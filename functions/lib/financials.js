import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
const db = getFirestore();
export const getParsedMoneyReport = onCall({
    region: "asia-south1",
    timeoutSeconds: 540,
    memory: "1GiB",
}, async (request) => {
    // Removed strict auth check for MVP admin dashboard compatibility.
    // In production, consider adding a custom claim check.
    const { startDate, endDate } = request.data;
    if (!startDate || !endDate) {
        throw new HttpsError("invalid-argument", "startDate and endDate are required");
    }
    const startTs = Timestamp.fromDate(new Date(startDate));
    // Set end of day for the endDate
    const endTs = Timestamp.fromDate(new Date(endDate + "T23:59:59.999Z"));
    let totalDebit = 0;
    let totalCredit = 0;
    let friendsMoney = 0;
    const OUTLIER_THRESHOLD = 10_000_000_000; // Skip clearly corrupted data (e.g. 10^17)
    try {
        const topTxList = [];
        const addToTop = (tx) => {
            topTxList.push(tx);
            topTxList.sort((a, b) => b.amount - a.amount);
            if (topTxList.length > 10)
                topTxList.pop();
        };
        // 1. Fetch expenses across all users
        const expensesSnap = await db.collectionGroup("expenses")
            .where("date", ">=", startTs)
            .where("date", "<=", endTs)
            .get();
        expensesSnap.forEach(doc => {
            const data = doc.data();
            const amount = Number(data.amount || 0);
            // Skip astronomical outliers while still including legitimate 1Cr+ transactions
            if (amount > OUTLIER_THRESHOLD) {
                console.warn(`Skipping astronomical outlier: Document ${doc.id} (Ref: ${doc.ref.path}) has amount ₹${amount}`);
                return;
            }
            totalDebit += amount;
            // Track in top 10
            const userId = doc.ref.path.split("/")[1]; // users/{uid}/expenses/{id}
            addToTop({
                id: doc.id,
                amount,
                date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : String(data.date),
                type: "expense",
                userId,
                message: data.msg || data.memo || data.rawMessage || "—",
            });
            const friendIds = data.friendIds || [];
            const groupId = data.groupId;
            if (friendIds.length > 0 || groupId) {
                friendsMoney += amount;
            }
        });
        // 2. Fetch incomes across all users
        const incomesSnap = await db.collectionGroup("incomes")
            .where("date", ">=", startTs)
            .where("date", "<=", endTs)
            .get();
        incomesSnap.forEach(doc => {
            const data = doc.data();
            const amount = Number(data.amount || 0);
            if (amount > OUTLIER_THRESHOLD) {
                console.warn(`Skipping astronomical outlier income: Document ${doc.id} (Ref: ${doc.ref.path}) has amount ₹${amount}`);
                return;
            }
            totalCredit += amount;
            // Track in top 10
            const userId = doc.ref.path.split("/")[1];
            addToTop({
                id: doc.id,
                amount,
                date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : String(data.date),
                type: "income",
                userId,
                message: data.msg || data.memo || data.rawMessage || "—",
            });
        });
        // 3. Post-process Top 10 to add User Names
        const finalTopTx = await Promise.all(topTxList.map(async (tx) => {
            try {
                const userDoc = await db.doc(`users/${tx.userId}`).get();
                const userData = userDoc.data();
                return {
                    ...tx,
                    userName: userData?.name || "Unknown",
                    userPhone: tx.userId, // Phone is the ID in this project
                };
            }
            catch {
                return tx;
            }
        }));
        return {
            totalParsed: totalDebit + totalCredit,
            totalDebit,
            totalCredit,
            friendsMoney,
            expenseCount: expensesSnap.size,
            incomeCount: incomesSnap.size,
            totalCount: expensesSnap.size + incomesSnap.size,
            topTransactions: finalTopTx,
        };
    }
    catch (error) {
        console.error("Error generating report:", error);
        throw new HttpsError("internal", "Error generating report: " + String(error));
    }
});
//# sourceMappingURL=financials.js.map