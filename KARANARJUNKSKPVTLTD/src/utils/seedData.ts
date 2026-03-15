import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function seedDemoData(tenantId: string) {
    try {
        const retailersCol = collection(db, 'tenants', tenantId, 'retailers');
        const productsCol = collection(db, 'tenants', tenantId, 'products');

        // Seed a Retailer
        await addDoc(retailersCol, {
            name: "Demo Retailer One",
            location: "Pune, Maharashtra",
            number: "9876543210",
            portfolioSize: "Big",
            createdAt: serverTimestamp()
        });

        // Seed some Products
        await addDoc(productsCol, {
            name: "Premium Organic Fertilizer",
            category: "Fertilizer",
            boxCapacity: 10,
            boxesInStock: 50,
            loosePieces: 5,
            piecePricing: { mrp: 120, ptr: 100, rate: 110, offer: 105 },
            boxPricing: { mrp: 1100, ptr: 900, rate: 1000, offer: 950 },
            createdAt: serverTimestamp()
        });

        await addDoc(productsCol, {
            name: "High-Yield Seed Pack (1kg)",
            category: "Seeds",
            boxCapacity: 20,
            boxesInStock: 25,
            loosePieces: 0,
            piecePricing: { mrp: 350, ptr: 300, rate: 320, offer: 310 },
            boxPricing: { mrp: 6500, ptr: 5500, rate: 6000, offer: 5800 },
            createdAt: serverTimestamp()
        });

        console.log("Demo data seeded successfully!");
    } catch (error) {
        console.error("Seeding failed: ", error);
    }
}
