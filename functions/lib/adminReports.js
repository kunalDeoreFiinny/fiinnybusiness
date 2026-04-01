import { onCall } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
export const getParsedMoneyReport = onCall({ region: "asia-south1", cors: true }, async (request) => {
    const db = getFirestore();
    const data = request.data || {};
    const startDateStr = data.startDate;
    const endDateStr = data.endDate;
    let startTs;
    let endTs;
    if (startDateStr) {
        const start = new Date(`${startDateStr}T00:00:00.000Z`);
        startTs = Timestamp.fromDate(start);
    }
    if (endDateStr) {
        const end = new Date(`${endDateStr}T23:59:59.999Z`);
        endTs = Timestamp.fromDate(end);
    }
    const usersSnap = await db.collection("users").get();
    let totalDebits = 0;
    let totalCredits = 0;
    let friendsMoney = 0;
    // Process in parallel
    const promises = usersSnap.docs.map(async (userDoc) => {
        const uid = userDoc.id;
        // Expenses
        let expQuery = db.collection(`users/${uid}/expenses`);
        if (startTs)
            expQuery = expQuery.where("date", ">=", startTs);
        if (endTs)
            expQuery = expQuery.where("date", "<=", endTs);
        try {
            const expSnap = await expQuery.get();
            expSnap.forEach(doc => {
                const d = doc.data();
                const amount = Number(d.amount) || 0;
                totalDebits += amount;
                const friendIds = d.friendIds;
                const groupId = d.groupId;
                if ((Array.isArray(friendIds) && friendIds.length > 0) || groupId) {
                    friendsMoney += amount;
                }
            });
        }
        catch (e) {
            console.error(`Error fetching expenses for ${uid}:`, e);
        }
        // Incomes
        let incQuery = db.collection(`users/${uid}/incomes`);
        if (startTs)
            incQuery = incQuery.where("date", ">=", startTs);
        if (endTs)
            incQuery = incQuery.where("date", "<=", endTs);
        try {
            const incSnap = await incQuery.get();
            incSnap.forEach(doc => {
                totalCredits += Number(doc.data().amount) || 0;
            });
        }
        catch (e) {
            console.error(`Error fetching incomes for ${uid}:`, e);
        }
    });
    await Promise.all(promises);
    return {
        totalParsed: Math.round(totalDebits + totalCredits),
        totalDebits: Math.round(totalDebits),
        totalCredits: Math.round(totalCredits),
        friendsMoney: Math.round(friendsMoney)
    };
});
//# sourceMappingURL=adminReports.js.map