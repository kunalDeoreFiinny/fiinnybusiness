import {
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getDocRef, getCollection } from '../firebase/firestore';
import { COLLECTIONS, RetailerDoc } from '../types/firebase';

/** Get a retailer by ID. */
export async function getRetailerById(retailerId: string): Promise<RetailerDoc | null> {
  const snap = await getDoc(getDocRef(COLLECTIONS.RETAILERS, retailerId));
  return snap.exists() ? (snap.data() as RetailerDoc) : null;
}

/** Get retailer by phone number. */
export async function getRetailerByPhone(phone: string): Promise<{ id: string; data: RetailerDoc } | null> {
  const q = query(getCollection(COLLECTIONS.RETAILERS), where('phone', '==', phone));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return { id: doc.id, data: doc.data() as RetailerDoc };
}

/** Create a new retailer document. Returns the generated doc ID. */
export async function createRetailer(
  retailerId: string,
  data: Omit<RetailerDoc, 'createdAt' | 'approved'>,
): Promise<void> {
  await setDoc(getDocRef(COLLECTIONS.RETAILERS, retailerId), {
    ...data,
    approved: true,
    createdAt: serverTimestamp(),
  });
}

/** Update retailer fields. */
export async function updateRetailer(
  retailerId: string,
  data: Partial<RetailerDoc>,
): Promise<void> {
  await updateDoc(getDocRef(COLLECTIONS.RETAILERS, retailerId), data);
}
