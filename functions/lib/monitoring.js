import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
/**
 * Nightly Firestore backup at 2:00 AM IST (20:30 UTC)
 * Exports to gs://karanarjun-pvt-ltd.appspot.com/backups/daily/YYYY-MM-DD/
 */
export const dailyFirestoreBackup = onSchedule({
    schedule: "30 20 * * *", // 2:00 AM IST
    timeZone: "Asia/Kolkata",
    memory: "256MiB",
    timeoutSeconds: 120,
    region: "asia-south1",
}, async (event) => {
    const db = getFirestore();
    const today = new Date().toISOString().slice(0, 10);
    try {
        // Write a metadata record so we can verify backups ran
        await db.collection("systemLogs").add({
            type: "backup_started",
            date: today,
            timestamp: new Date(),
            status: "running",
        });
        console.log(`[Backup] Starting Firestore export for ${today}`);
        // Note: Full Firestore export requires Firestore Admin API
        // For now we export critical collections manually as JSON snapshots
        const collections = [
            "tenants",
            "paymentLinks_public",
            "users",
        ];
        const storage = getStorage();
        const bucket = storage.bucket();
        for (const col of collections) {
            const snap = await db.collection(col).limit(5000).get();
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            const json = JSON.stringify(data, null, 2);
            const file = bucket.file(`backups/daily/${today}/${col}.json`);
            await file.save(json, { contentType: "application/json" });
            console.log(`[Backup] Exported ${col}: ${snap.size} docs`);
        }
        // Update log with success
        const logs = await db
            .collection("systemLogs")
            .where("type", "==", "backup_started")
            .where("date", "==", today)
            .limit(1)
            .get();
        if (!logs.empty) {
            await logs.docs[0].ref.update({ status: "completed", completedAt: new Date() });
        }
        console.log(`[Backup] Completed successfully for ${today}`);
    }
    catch (error) {
        console.error("[Backup] Failed:", error);
        await db.collection("systemLogs").add({
            type: "backup_failed",
            date: today,
            error: String(error),
            timestamp: new Date(),
        });
    }
});
/**
 * Daily business metrics — runs at 11:59 PM IST
 * Counts invoices, revenue, new sign-ups for the day and writes to metrics collection
 */
export const dailyMetrics = onSchedule({
    schedule: "29 18 * * *", // 11:59 PM IST
    timeZone: "Asia/Kolkata",
    memory: "256MiB",
    region: "asia-south1",
}, async () => {
    const db = getFirestore();
    const today = new Date().toISOString().slice(0, 10);
    try {
        // Get all tenants
        const tenantsSnap = await db.collection("tenants").get();
        let totalInvoicesToday = 0;
        let totalRevenueToday = 0;
        for (const tenant of tenantsSnap.docs) {
            const tenantId = tenant.id;
            const startOfDay = new Date(`${today}T00:00:00.000Z`);
            const invoicesSnap = await db
                .collection(`tenants/${tenantId}/invoices`)
                .where("createdAt", ">=", startOfDay)
                .get();
            const revenue = invoicesSnap.docs.reduce((sum, d) => sum + (d.data().grandTotal || d.data().totalAmount || 0), 0);
            totalInvoicesToday += invoicesSnap.size;
            totalRevenueToday += revenue;
        }
        await db.doc(`metrics/daily/${today}/summary`).set({
            date: today,
            totalTenants: tenantsSnap.size,
            invoicesToday: totalInvoicesToday,
            revenueToday: totalRevenueToday,
            computedAt: new Date(),
        });
        console.log(`[Metrics] ${today}: ${totalInvoicesToday} invoices, ₹${totalRevenueToday} revenue across ${tenantsSnap.size} tenants`);
    }
    catch (error) {
        console.error("[Metrics] Failed:", error);
    }
});
//# sourceMappingURL=monitoring.js.map