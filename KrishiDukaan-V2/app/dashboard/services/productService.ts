import {
  getDocs,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { getDocRef, getCollection } from '../firebase/firestore';
import { COLLECTIONS, ProductDoc } from '../types/firebase';

/** Get all products from the master catalog. */
export async function getAllProducts(): Promise<Array<{ id: string } & ProductDoc>> {
  const snap = await getDocs(getCollection(COLLECTIONS.PRODUCTS));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ProductDoc) }));
}

/** Get a single product by ID. */
export async function getProductById(productId: string): Promise<ProductDoc | null> {
  const snap = await getDoc(getDocRef(COLLECTIONS.PRODUCTS, productId));
  return snap.exists() ? (snap.data() as ProductDoc) : null;
}

/** Add or update a product in the master catalog. (Admin only) */
export async function upsertProduct(productId: string, data: ProductDoc): Promise<void> {
  await setDoc(getDocRef(COLLECTIONS.PRODUCTS, productId), data);
}
