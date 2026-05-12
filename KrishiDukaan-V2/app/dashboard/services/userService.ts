import {
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getDocRef } from '../firebase/firestore';
import { COLLECTIONS, UserDoc, UserRole } from '../types/firebase';

/** Get a user document by UID. Returns null if not found. */
export async function getUserById(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(getDocRef(COLLECTIONS.USERS, uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

/** Create a new user document. Called after first-time phone auth. */
export async function createUser(
  uid: string,
  data: { phone: string; name?: string },
): Promise<UserDoc> {
  const userDoc: UserDoc = {
    name: data.name ?? '',
    email: '',
    phone: data.phone,
    role: 'retailer' as UserRole,
    retailerId: null,
    createdAt: serverTimestamp() as any,
  };
  await setDoc(getDocRef(COLLECTIONS.USERS, uid), userDoc);
  return userDoc;
}

/** Update a user's profile fields. */
export async function updateUser(
  uid: string,
  data: Partial<Pick<UserDoc, 'name' | 'email' | 'retailerId'>>,
): Promise<void> {
  await updateDoc(getDocRef(COLLECTIONS.USERS, uid), data);
}

/** Check if user exists and return their doc, or create one. */
export async function getOrCreateUser(
  uid: string,
  phone: string,
): Promise<UserDoc> {
  const existing = await getUserById(uid);
  if (existing) return existing;
  return createUser(uid, { phone });
}
