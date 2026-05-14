/**
 * seedFirestore.ts
 *
 * Seeds Firestore with dummy MVP data using the Firebase Client SDK.
 *
 * NOTE ON PERMISSIONS:
 * Since you cannot create a Service Account Key due to org policies, we are
 * using the standard Client SDK. 
 * 
 * IMPORTANT: You must temporarily allow writes in your Firestore Rules:
 *   1. Go to Firebase Console -> Firestore Database -> Rules tab.
 *   2. Change your rules to:
 *        match /{document=**} { allow read, write: if true; }
 *   3. Publish the rules.
 *   4. Run this script: `pnpm --filter @krishidukan/admin run seed`
 *   5. Change the rules back to what they were!
 */

import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from apps/admin root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { products, retailers, inventoryTemplate } from "./seedData.js";

// ─── Firebase Init ───────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig, "seed-script");
const db = getFirestore(app);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[seed] ${msg}`);
}

// ─── Step 1: Seed Products ────────────────────────────────────────────────────

async function seedProducts(): Promise<string[]> {
  log("Seeding /products …");
  const productIds: string[] = [];

  for (const product of products) {
    const docRef = await addDoc(collection(db, "products"), {
      ...product,
      createdAt: serverTimestamp(),
    });
    productIds.push(docRef.id);
    log(`  ✓ Product "${product.name}" → ${docRef.id}`);
  }

  return productIds;
}

// ─── Step 2: Seed Retailers + Users ──────────────────────────────────────────

async function seedRetailers(): Promise<string[]> {
  log("Seeding /retailers and /users …");
  const retailerIds: string[] = [];

  for (const retailer of retailers) {
    const retailersRef = collection(db, "retailers");
    const tmpRef = doc(retailersRef); // auto-ID without writing
    const uid = tmpRef.id;

    // /retailers/{uid}
    await setDoc(doc(db, "retailers", uid), {
      uid,
      shopName: retailer.shopName,
      ownerName: retailer.ownerName,
      phone: retailer.phone,
      email: retailer.email,
      address: retailer.address,
      location: retailer.location,
      createdAt: serverTimestamp(),
    });

    // /users/{uid}
    await setDoc(doc(db, "users", uid), {
      uid,
      role: "retailer",
      email: retailer.email,
      createdAt: serverTimestamp(),
    });

    retailerIds.push(uid);
    log(`  ✓ Retailer "${retailer.shopName}" → ${uid}`);
  }

  return retailerIds;
}

// ─── Step 3: Seed Inventory ───────────────────────────────────────────────────

async function seedInventory(
  productIds: string[],
  retailerIds: string[]
): Promise<void> {
  log("Seeding /inventory …");

  for (const item of inventoryTemplate) {
    const retailerId = retailerIds[item.retailerIndex];
    const productId = productIds[item.productIndex];

    const docRef = await addDoc(collection(db, "inventory"), {
      retailerId,
      productId,
      stock: item.stock,
      price: item.price,
      updatedAt: serverTimestamp(),
    });

    log(
      `  ✓ Inventory [retailer ${item.retailerIndex} × product ${item.productIndex}]` +
        ` stock=${item.stock} price=₹${item.price} → ${docRef.id}`
    );
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔═══════════════════════════════════════╗");
  console.log("║   KrishiDukan Firestore Seed Script   ║");
  console.log("╚═══════════════════════════════════════╝\n");

  try {
    const productIds = await seedProducts();
    const retailerIds = await seedRetailers();
    await seedInventory(productIds, retailerIds);

    console.log("\n✅  Seeding complete!");
    console.log(`   ${productIds.length} products`);
    console.log(`   ${retailerIds.length} retailers + users`);
    console.log(`   ${inventoryTemplate.length} inventory entries`);
  } catch (err) {
    console.error("\n❌  Seeding failed:", err);
    process.exit(1);
  }

  // Force exit — Firestore keeps the connection open
  process.exit(0);
}

main();
