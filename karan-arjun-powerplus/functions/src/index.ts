import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import * as https from 'https';

admin.initializeApp();
const db = admin.firestore();

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  quantity: number;
}

interface DeliveryDetails {
  fullName: string;
  phone: string;
  state: string;
  district: string;
  address: string;
  pinCode: string;
}

interface ShiprocketTokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

// ─── Generic HTTP helper ───────────────────────────────────────────────────────

function httpRequest(
  method: string,
  hostname: string,
  path: string,
  headers: Record<string, string>,
  body?: object,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const req = https.request(
      {
        hostname,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: string) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data) as Record<string, unknown>;
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(JSON.stringify(parsed)));
            } else {
              resolve(parsed);
            }
          } catch {
            reject(new Error('Failed to parse response'));
          }
        });
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ─── Razorpay helper ──────────────────────────────────────────────────────────

function razorpayRequest(
  method: string,
  path: string,
  body: object,
  keyId: string,
  keySecret: string,
): Promise<Record<string, unknown>> {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  return httpRequest(method, 'api.razorpay.com', path, { 'Authorization': `Basic ${auth}` }, body);
}

// ─── ShipRocket helpers ───────────────────────────────────────────────────────

async function getShiprocketToken(): Promise<string> {
  const cacheRef = db.collection('_config').doc('shiprocket_token');
  const cacheSnap = await cacheRef.get();

  if (cacheSnap.exists) {
    const cached = cacheSnap.data() as ShiprocketTokenCache;
    // Tokens are valid for 24 h; refresh 10 min early
    if (cached.token && cached.expiresAt > Date.now() + 10 * 60 * 1000) {
      return cached.token;
    }
  }

  const email    = process.env.SHIPROCKET_EMAIL    ?? '';
  const password = process.env.SHIPROCKET_PASSWORD ?? '';

  if (!email || !password) {
    throw new Error('ShipRocket credentials not configured.');
  }

  const res = await httpRequest(
    'POST',
    'apiv2.shiprocket.in',
    '/v1/external/auth/login',
    {},
    { email, password },
  );

  const token = String(res.token ?? '');
  if (!token) throw new Error('ShipRocket login returned no token.');

  await cacheRef.set({
    token,
    expiresAt: Date.now() + 23 * 60 * 60 * 1000, // 23 hours
  });

  return token;
}

function shiprocketRequest(
  method: string,
  path: string,
  token: string,
  body?: object,
): Promise<Record<string, unknown>> {
  return httpRequest(
    method,
    'apiv2.shiprocket.in',
    path,
    { 'Authorization': `Bearer ${token}` },
    body,
  );
}

// Maps ShipRocket status strings to our simplified enum
function mapShiprocketStatus(
  srStatus: string,
): 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' {
  const s = srStatus.toUpperCase();
  if (s.includes('CANCEL') || s.includes('RTO')) return 'cancelled';
  if (s.includes('DELIVERED')) return 'delivered';
  if (s.includes('OUT FOR DELIVERY')) return 'out_for_delivery';
  if (s.includes('IN TRANSIT') || s.includes('PICKED UP') || s.includes('SHIPPED')) return 'shipped';
  if (s.includes('PICKUP GENERATED') || s.includes('PACKED')) return 'packed';
  return 'processing';
}

// ─── Razorpay Cloud Functions ─────────────────────────────────────────────────

// Step 1: Create a Razorpay order server-side so amount cannot be tampered with
export const createRazorpayOrder = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in to continue.');
  }

  const { items } = (request.data ?? {}) as { items: CartItem[] };
  if (!Array.isArray(items) || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Cart is empty.');
  }

  const keyId     = process.env.RAZORPAY_KEY_ID     ?? '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';

  if (!keyId || !keySecret) {
    throw new functions.https.HttpsError('internal', 'Payment service not configured.');
  }

  // Fetch authoritative prices from Firestore — never trust client-supplied amounts
  let totalAmount = 0;
  const verifiedItems: Array<{ id: string; name: string; price: number; quantity: number }> = [];

  for (const item of items) {
    const productSnap = await db.collection('products').doc(item.id).get();
    if (!productSnap.exists) {
      throw new functions.https.HttpsError('not-found', `Product not found: ${item.id}`);
    }
    const product = productSnap.data()!;
    const price   = Number(product.numericPrice ?? 0);
    const qty     = Math.max(1, Math.floor(Number(item.quantity)));
    totalAmount  += price * qty;
    verifiedItems.push({ id: item.id, name: String(product.name), price, quantity: qty });
  }

  const receipt = `ppw_${request.auth.uid.slice(0, 8)}_${Date.now()}`;
  const order   = await razorpayRequest(
    'POST',
    '/v1/orders',
    { amount: Math.round(totalAmount * 100), currency: 'INR', receipt },
    keyId,
    keySecret,
  );

  return {
    razorpayOrderId: String(order.id),
    amount: totalAmount,
    verifiedItems,
  };
});

// Step 2: Verify Razorpay HMAC signature and save order to Firestore
export const verifyAndSaveOrder = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in to continue.');
  }

  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    delivery,
    items,
    totalAmount,
    customerEmail,
  } = (request.data ?? {}) as {
    razorpay_payment_id: string;
    razorpay_order_id:   string;
    razorpay_signature:  string;
    delivery:            DeliveryDetails;
    items:               Array<{ id: string; name: string; price: number; quantity: number }>;
    totalAmount:         number;
    customerEmail:       string;
  };

  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
  if (!keySecret) {
    throw new functions.https.HttpsError('internal', 'Payment service not configured.');
  }

  // Cryptographic check — this is mathematically impossible to fake without the secret key
  const expectedSig = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    throw new functions.https.HttpsError('invalid-argument', 'Payment verification failed. Contact support.');
  }

  const orderRef = await db.collection('orders').add({
    uid:              request.auth.uid,
    customerName:     delivery.fullName,
    customerPhone:    delivery.phone,
    state:            delivery.state,
    district:         delivery.district,
    address:          delivery.address,
    pinCode:          delivery.pinCode,
    customerEmail,
    items,
    totalAmount,
    status:           'Paid',
    paymentStatus:    'paid',
    razorpayPaymentId: razorpay_payment_id,
    razorpayOrderId:   razorpay_order_id,
    createdAt:        admin.firestore.FieldValue.serverTimestamp(),
    updatedAt:        admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, orderId: orderRef.id };
});

// ─── ShipRocket Cloud Functions ───────────────────────────────────────────────

/**
 * createShiprocketShipment
 * Admin-only callable. Creates an order in ShipRocket for a paid Firestore order.
 * Call this once the warehouse is ready to fulfill.
 */
export const createShiprocketShipment = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in to continue.');
  }

  // Verify caller is admin
  const callerDoc = await db.collection('users').doc(request.auth.uid).get();
  if (callerDoc.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin only.');
  }

  const { orderId } = (request.data ?? {}) as { orderId: string };
  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'orderId is required.');
  }

  const orderSnap = await db.collection('orders').doc(orderId).get();
  if (!orderSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Order not found.');
  }

  const order = orderSnap.data()!;
  if (order.paymentStatus !== 'paid') {
    throw new functions.https.HttpsError('failed-precondition', 'Order is not paid.');
  }
  if (order.shiprocketOrderId) {
    throw new functions.https.HttpsError('already-exists', 'ShipRocket shipment already created.');
  }

  const token           = await getShiprocketToken();
  const pickupLocation  = process.env.SHIPROCKET_PICKUP_LOCATION ?? 'Primary';
  const nameParts       = String(order.customerName ?? '').split(' ');
  const firstName       = nameParts[0] ?? 'Customer';
  const lastName        = nameParts.slice(1).join(' ') || '-';
  const orderDate       = (order.createdAt as admin.firestore.Timestamp)
                            ?.toDate?.()
                            ?.toISOString()
                            ?.slice(0, 16)
                            ?.replace('T', ' ')
                          ?? new Date().toISOString().slice(0, 16).replace('T', ' ');

  const orderItems = (order.items as Array<{ id: string; name: string; price: number; quantity: number }>)
    .map((item) => ({
      name:          item.name,
      sku:           item.id,
      units:         item.quantity,
      selling_price: item.price,
    }));

  const payload = {
    order_id:              orderId,
    order_date:            orderDate,
    pickup_location:       pickupLocation,
    billing_customer_name: firstName,
    billing_last_name:     lastName,
    billing_address:       String(order.address ?? ''),
    billing_city:          String(order.district ?? ''),
    billing_pincode:       String(order.pinCode ?? ''),
    billing_state:         String(order.state ?? ''),
    billing_country:       'India',
    billing_email:         String(order.customerEmail ?? ''),
    billing_phone:         String(order.customerPhone ?? ''),
    shipping_is_billing:   1,
    order_items:           orderItems,
    payment_method:        'Prepaid',
    sub_total:             Number(order.totalAmount ?? 0),
    length:                10,
    breadth:               10,
    height:                10,
    weight:                0.5,
  };

  const result = await shiprocketRequest('POST', '/v1/external/orders/create/adhoc', token, payload);

  const shiprocketOrderId = String(result.order_id ?? '');
  const shipmentId        = String(result.shipment_id ?? '');

  await db.collection('orders').doc(orderId).update({
    shiprocketOrderId,
    shipmentId,
    shipmentStatus: 'processing',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, shiprocketOrderId, shipmentId };
});

/**
 * trackShiprocketOrder
 * Callable by any authenticated user. Fetches live tracking from ShipRocket
 * for a given orderId and syncs the status back to Firestore.
 */
export const trackShiprocketOrder = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in to continue.');
  }

  const { orderId } = (request.data ?? {}) as { orderId: string };
  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'orderId is required.');
  }

  const orderSnap = await db.collection('orders').doc(orderId).get();
  if (!orderSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Order not found.');
  }

  const order = orderSnap.data()!;

  // Ensure the caller owns this order (or is admin)
  const callerDoc = await db.collection('users').doc(request.auth.uid).get();
  const isAdmin   = callerDoc.data()?.role === 'admin';
  if (!isAdmin && order.uid !== request.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Access denied.');
  }

  if (!order.shiprocketOrderId) {
    return { shipmentStatus: order.shipmentStatus ?? null, trackingData: null };
  }

  const token  = await getShiprocketToken();
  const result = await shiprocketRequest(
    'GET',
    `/v1/external/courier/track/order/${String(order.shiprocketOrderId)}`,
    token,
  );

  const trackingData = result.tracking_data as Record<string, unknown> | undefined;
  const srStatus     = String(
    (trackingData?.shipment_track as Array<Record<string, unknown>>)?.[0]?.current_status ?? '',
  );

  let mappedStatus: string = order.shipmentStatus ?? 'processing';
  if (srStatus) {
    mappedStatus = mapShiprocketStatus(srStatus);
    await db.collection('orders').doc(orderId).update({
      shipmentStatus: mappedStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  return { shipmentStatus: mappedStatus, trackingData };
});

/**
 * updateShipmentStatus
 * Admin-only callable. Manually set shipment status + tracking ID.
 * Use this until the full ShipRocket supply chain is wired up.
 */
export const updateShipmentStatus = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in to continue.');
  }

  const callerDoc = await db.collection('users').doc(request.auth.uid).get();
  if (callerDoc.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin only.');
  }

  const { orderId, shipmentStatus, trackingId } = (request.data ?? {}) as {
    orderId: string;
    shipmentStatus?: string;
    trackingId?: string;
  };

  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'orderId is required.');
  }

  const updates: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  if (shipmentStatus) updates.shipmentStatus = shipmentStatus;
  if (trackingId)     updates.trackingId     = trackingId;

  await db.collection('orders').doc(orderId).update(updates);
  return { success: true };
});
