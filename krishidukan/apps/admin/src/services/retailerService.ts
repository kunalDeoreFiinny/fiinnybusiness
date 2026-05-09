import { doc, setDoc, serverTimestamp, collection, getDocs, type Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface CreateRetailerPayload {
  uid: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  lat: number;
  lng: number;
}

/**
 * Writes /users/{uid} (auth/role metadata) and /retailers/{uid} (shop data)
 * in parallel. UID comes from the Firebase Auth response after account creation.
 */
export async function createRetailerDocs(payload: CreateRetailerPayload): Promise<void> {
  console.log('[retailerService] Starting Firestore write for UID:', payload.uid);
  console.log('[retailerService] Retailer payload:', payload);
  console.log('[retailerService] Firestore db instance:', db);

  const createdAt = serverTimestamp();

  const retailerData = {
    uid: payload.uid,
    shopName: payload.shopName,
    ownerName: payload.ownerName,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
    location: {
      lat: payload.lat,
      lng: payload.lng,
    },
    createdAt,
  };

  const userData = {
    uid: payload.uid,
    role: 'retailer',
    email: payload.email,
    createdAt,
  };

  console.log('[retailerService] Writing /retailers/' + payload.uid, retailerData);
  console.log('[retailerService] Writing /users/' + payload.uid, userData);

  try {
    await Promise.all([
      setDoc(doc(db, 'retailers', payload.uid), retailerData),
      setDoc(doc(db, 'users', payload.uid), userData),
    ]);
    console.log('[retailerService] ✅ Firestore write SUCCESS — /retailers/' + payload.uid + ' and /users/' + payload.uid);
  } catch (err) {
    console.error('[retailerService] ❌ Firestore write FAILED:', err);
    // Re-throw so the caller (AddRetailerPage) can surface it in the UI
    throw err;
  }
}

// ── Read ──────────────────────────────────────────────────────────────────────

export interface RetailerDoc {
  uid: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  location: { lat: number; lng: number };
  createdAt: Date | null;
}

export async function fetchAllRetailers(): Promise<RetailerDoc[]> {
  const snapshot = await getDocs(collection(db, 'retailers'));
  return snapshot.docs.map((d) => {
    const data = d.data();
    // Firestore Timestamp → JS Date; fall back gracefully if missing
    const ts = data['createdAt'] as Timestamp | undefined;
    return {
      uid: d.id,
      shopName: data['shopName'] ?? '',
      ownerName: data['ownerName'] ?? '',
      phone: data['phone'] ?? '',
      email: data['email'] ?? '',
      address: data['address'] ?? '',
      location: data['location'] ?? { lat: 0, lng: 0 },
      createdAt: ts?.toDate?.() ?? null,
    };
  });
}
