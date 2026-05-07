import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import * as https from 'https';

admin.initializeApp();
const db = admin.firestore();

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

function razorpayRequest(
  method: string,
  path: string,
  body: object,
  keyId: string,
  keySecret: string,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const payload = JSON.stringify(body);
    const req = https.request(
      {
        hostname: 'api.razorpay.com',
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: string) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data) as Record<string, unknown>;
            if (res.statusCode && res.statusCode >= 400) {
              const err = (parsed.error as Record<string, unknown>) ?? parsed;
              reject(new Error(String(err.description ?? 'Razorpay API error')));
            } else {
              resolve(parsed);
            }
          } catch {
            reject(new Error('Failed to parse Razorpay response'));
          }
        });
      },
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Step 1: Create a Razorpay order server-side so amount cannot be tampered with
export const createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in to continue.');
  }

  const { items } = data as { items: CartItem[] };
  if (!Array.isArray(items) || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Cart is empty.');
  }

  const keyId: string = functions.config().razorpay?.key_id ?? process.env.RAZORPAY_KEY_ID ?? '';
  const keySecret: string = functions.config().razorpay?.key_secret ?? process.env.RAZORPAY_KEY_SECRET ?? '';

  if (!keyId || !keySecret) {
    throw new functions.https.HttpsError('internal', 'Payment service not configured.');
  }

  // Fetch authoritative prices from Firestore — do NOT trust client-supplied amounts
  let totalAmount = 0;
  const verifiedItems: Array<{ id: string; name: string; price: number; quantity: number }> = [];

  for (const item of items) {
    const productSnap = await db.collection('products').doc(item.id).get();
    if (!productSnap.exists) {
      throw new functions.https.HttpsError('not-found', `Product not found: ${item.id}`);
    }
    const product = productSnap.data()!;
    const price = Number(product.numericPrice ?? 0);
    const qty = Math.max(1, Math.floor(Number(item.quantity)));
    totalAmount += price * qty;
    verifiedItems.push({ id: item.id, name: String(product.name), price, quantity: qty });
  }

  const receipt = `ppw_${context.auth.uid.slice(0, 8)}_${Date.now()}`;
  const order = await razorpayRequest(
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

// Step 2: Verify Razorpay signature and create order in Firestore
export const verifyAndSaveOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
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
  } = data as {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    delivery: DeliveryDetails;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    totalAmount: number;
    customerEmail: string;
  };

  const keySecret: string = functions.config().razorpay?.key_secret ?? process.env.RAZORPAY_KEY_SECRET ?? '';
  if (!keySecret) {
    throw new functions.https.HttpsError('internal', 'Payment service not configured.');
  }

  // Cryptographic verification — payment cannot be faked
  const expectedSig = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    throw new functions.https.HttpsError('invalid-argument', 'Payment verification failed. Contact support.');
  }

  // Write order using admin SDK (bypasses Firestore rules — only this function can create orders)
  const orderRef = await db.collection('orders').add({
    uid: context.auth.uid,
    customerName: delivery.fullName,
    customerPhone: delivery.phone,
    state: delivery.state,
    district: delivery.district,
    address: delivery.address,
    pinCode: delivery.pinCode,
    customerEmail,
    items,
    totalAmount,
    status: 'Paid',
    paymentStatus: 'paid',
    razorpayPaymentId: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, orderId: orderRef.id };
});
