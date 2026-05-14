import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Inventory, NewInventory } from '../types/inventory';

const COLLECTION = 'inventory';

/**
 * Adds a new inventory document to /inventory.
 * Firestore auto-generates the document ID.
 * Returns the DocumentReference (contains .id for the new entry's ID).
 */
export async function addInventory(data: NewInventory): Promise<DocumentReference> {
  console.log('[inventoryService] Adding inventory entry:', data);
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  console.log('[inventoryService] ✅ Inventory entry created, id:', ref.id);
  return ref;
}

/**
 * Fetches all documents from /inventory.
 * Returns an array of Inventory objects with their Firestore IDs attached.
 */
export async function fetchInventory(): Promise<Inventory[]> {
  console.log('[inventoryService] Fetching all inventory…');
  const snapshot = await getDocs(collection(db, COLLECTION));
  const items = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Inventory, 'id'>),
  }));
  console.log('[inventoryService] ✅ Fetched', items.length, 'inventory entries');
  return items;
}
