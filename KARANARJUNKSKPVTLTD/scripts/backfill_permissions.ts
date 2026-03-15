import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAaQ8tB11OBJyqGXEl55oeyQnVrOLrBrxE",
    authDomain: "karanarjun-pvt-ltd.firebaseapp.com",
    projectId: "karanarjun-pvt-ltd",
    storageBucket: "karanarjun-pvt-ltd.firebasestorage.app",
    messagingSenderId: "832154675525",
    appId: "1:832154675525:web:aadc29d24e4c962f85362c",
    measurementId: "G-70B3CNJVQM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getTenantDoc = (db: any, tenantId: string, collName: string, docId: string, ...rest: string[]) => {
    if (tenantId === 'master') {
        return doc(db, collName, docId, ...rest);
    }
    return doc(db, 'tenants', tenantId, collName, docId, ...rest);
};

export const defaultPermissions = {
    admin: { dashboard: true, retailers: true, worklist: true, dispatch: true, pos: true, inventory: true, online_orders: true, order_history: true, settings: true, admin: true, manufacturers: true, invoice_templates: true, invoice_settings: true, schema_builder: true, manage_retailers: true },
    analyst: { dashboard: true, retailers: true, worklist: true, dispatch: true, pos: true, inventory: true, online_orders: false, order_history: true, settings: true, admin: false, manufacturers: false, invoice_templates: false, invoice_settings: false, schema_builder: false, manage_retailers: false },
    retailer: { dashboard: false, retailers: false, worklist: false, dispatch: false, pos: false, inventory: false, online_orders: false, order_history: false, settings: true, admin: false, manufacturers: false, invoice_templates: false, invoice_settings: false, schema_builder: false, manage_retailers: false },
    manufacturer: { dashboard: false, retailers: false, worklist: false, dispatch: false, pos: false, inventory: false, online_orders: false, order_history: false, settings: true, admin: false, manufacturers: false, invoice_templates: false, invoice_settings: false, schema_builder: false, manage_retailers: false }
};

async function backfillPermissions() {
    console.log("Starting backfill process...");
    
    // First update the master tenant
    try {
        const masterPermDocRef = getTenantDoc(db, 'master', 'settings', 'rolePermissions');
        await setDoc(masterPermDocRef, defaultPermissions, { merge: true });
        console.log("Updated master tenant permissions.");
    } catch (error) {
        console.error("Error updating master tenant:", error);
    }

    // Now update all sub-tenants
    try {
        const tenantsSnapshot = await getDocs(collection(db, 'tenants'));
        for (const tenantDoc of tenantsSnapshot.docs) {
            const tenantId = tenantDoc.id;
            const tenantPermDocRef = getTenantDoc(db, tenantId, 'settings', 'rolePermissions');
            await setDoc(tenantPermDocRef, defaultPermissions, { merge: true });
            console.log(`Updated permissions for tenant: ${tenantId}`);
        }
    } catch (error) {
        console.error("Error fetching tenants:", error);
    }
    
    console.log("Backfill complete.");
    process.exit(0);
}

backfillPermissions();
