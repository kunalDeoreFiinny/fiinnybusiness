import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Product, NewProduct } from '../types/product';

const COLLECTION = 'products';

/**
 * Adds a new product document to /products.
 * Firestore auto-generates the document ID.
 * Returns the DocumentReference (contains .id for the new product ID).
 */
export async function addProduct(data: NewProduct): Promise<DocumentReference> {
  console.log('[productService] Adding product:', data);
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  console.log('[productService] ✅ Product created, id:', ref.id);
  return ref;
}

/**
 * Fetches all documents from /products.
 * Returns an array of Product objects with their Firestore IDs attached.
 */
export async function fetchProducts(): Promise<Product[]> {
  console.log('[productService] Fetching all products…');
  const snapshot = await getDocs(collection(db, COLLECTION));
  const products = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Product, 'id'>),
  }));
  console.log('[productService] ✅ Fetched', products.length, 'products');
  return products;
}
