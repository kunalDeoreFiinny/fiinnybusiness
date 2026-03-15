import { db } from '../src/firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

const PRODUCTS = [
    { name: "KaranArjun Power Plus (1L)", mrp: 1200, ptr: 850, margin: "29%", rate: 600, sellingPrice: 900, quantity: 100, boxCapacity: 12 },
    { name: "KaranArjun Power Plus (500ml)", mrp: 650, ptr: 450, margin: "30%", rate: 300, sellingPrice: 500, quantity: 200, boxCapacity: 24 },
    { name: "KaranArjun Power Plus (250ml)", mrp: 350, ptr: 240, margin: "31%", rate: 150, sellingPrice: 280, quantity: 300, boxCapacity: 48 },
    { name: "KaranArjun Sample Kit", mrp: 0, ptr: 0, margin: "N/A", rate: 0, sellingPrice: 0, quantity: 50, boxCapacity: 1 }
];

async function migrate() {
    console.log("Checking for existing products...");
    const q = query(collection(db, 'products'), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        console.log("Products already exist in Firestore. Skipping migration.");
        return;
    }

    console.log("Starting migration...");
    for (const product of PRODUCTS) {
        try {
            await addDoc(collection(db, 'products'), {
                ...product,
                createdAt: new Date().toISOString()
            });
            console.log(`Migrated: ${product.name}`);
        } catch (error) {
            console.error(`Error migrating ${product.name}:`, error);
        }
    }
    console.log("Migration complete!");
}

migrate();
