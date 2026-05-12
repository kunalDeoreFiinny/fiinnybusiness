import {
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getDocRef, getCollection } from '../firebase/firestore';
import { COLLECTIONS, InventoryDoc } from '../types/firebase';

/** Get all inventory items for a retailer. */
export async function getInventoryByRetailer(retailerId: string): Promise<Array<{ id: string } & InventoryDoc>> {
  const q = query(
    getCollection(COLLECTIONS.INVENTORY),
    where('retailerId', '==', retailerId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as InventoryDoc) }));
}

/** Upsert an inventory item for a specific retailer + product combo. */
export async function upsertInventoryItem(
  inventoryId: string,
  data: Omit<InventoryDoc, 'updatedAt'>,
): Promise<void> {
  await setDoc(getDocRef(COLLECTIONS.INVENTORY, inventoryId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Get a single inventory item. */
export async function getInventoryItem(inventoryId: string): Promise<InventoryDoc | null> {
  const snap = await getDoc(getDocRef(COLLECTIONS.INVENTORY, inventoryId));
  return snap.exists() ? (snap.data() as InventoryDoc) : null;
}

/** Delete an inventory item. */
export async function deleteInventoryItem(inventoryId: string): Promise<void> {
  await deleteDoc(getDocRef(COLLECTIONS.INVENTORY, inventoryId));
}
