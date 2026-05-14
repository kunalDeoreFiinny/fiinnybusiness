import type { Timestamp } from 'firebase/firestore';

// Firestore: /products/{productId}
export interface Product {
  id?: string;           // set after addDoc resolves; absent on write
  name: string;
  brand: string;
  category: string;
  unit: string;          // e.g. "kg", "L", "bag"
  imageUrl?: string;
  createdAt: Timestamp;
}

// Shape sent to addDoc — no id, createdAt is the sentinel
export type NewProduct = Omit<Product, 'id' | 'createdAt'>;
