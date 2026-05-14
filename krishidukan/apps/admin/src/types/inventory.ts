import type { Timestamp } from 'firebase/firestore';

// Firestore: /inventory/{inventoryId}
export interface Inventory {
  id?: string;           // set after addDoc resolves; absent on write
  retailerId: string;    // UID from /retailers/{uid}
  productId: string;     // document ID from /products/{productId}
  stock: number;         // current unit count
  price: number;         // selling price in INR
  updatedAt: Timestamp;
}

// Shape sent to addDoc — no id, updatedAt is the sentinel
export type NewInventory = Omit<Inventory, 'id' | 'updatedAt'>;
