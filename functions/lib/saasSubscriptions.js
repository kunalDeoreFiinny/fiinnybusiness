import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import * as crypto from "crypto";
// @ts-ignore
import Razorpay from "razorpay";
if (getApps().length === 0)
    initializeApp();
const db = getFirestore();
let rzpInstance = null;
function getRzp() {
    if (rzpInstance)
        return rzpInstance;
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret)
        throw new Error("Razorpay keys missing");
    rzpInstance = new Razorpay({ key_id, key_secret });
    return rzpInstance;
}
// SaaS Plan pricing in paise (₹ × 100)
const SAAS_PLANS = {
    starter: { monthly: 99900, yearly: 99900 * 10 }, // ₹999/mo | ₹9,990/yr
    growth: { monthly: 199900, yearly: 199900 * 10 }, // ₹1,999/mo | ₹19,990/yr
    pro: { monthly: 299900, yearly: 299900 * 10 }, // ₹2,999/mo | ₹29,990/yr
};
/**
 * createSaaSOrder — creates a Razorpay order for KARAN ARJUN SaaS subscription.
 * Called from the React SaaS app via firebase/functions.
 */
export const createSaaSOrder = onCall({ region: "asia-south1" }, async (request) => {
    if (!request.auth)
        throw new HttpsError("unauthenticated", "Login required.");
    const { plan, cycle, tenantId } = request.data;
    if (!SAAS_PLANS[plan] || !["monthly", "yearly"].includes(cycle)) {
        throw new HttpsError("invalid-argument", "Invalid plan or cycle.");
    }
    const uid = request.auth.uid;
    const amountInPaise = SAAS_PLANS[plan][cycle];
    try {
        const order = await getRzp().orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `saas_${tenantId?.substring(0, 8) || uid.substring(0, 8)}_${Date.now()}`,
            notes: { uid, plan, cycle, tenantId: tenantId || uid, type: "saas_subscription" },
        });
        return {
            order_id: order.id,
            key_id: process.env.RAZORPAY_KEY_ID,
            amount: amountInPaise,
            currency: "INR",
        };
    }
    catch (error) {
        const msg = error?.error?.description || error?.message || "Failed to create order";
        throw new HttpsError("internal", msg);
    }
});
/**
 * verifySaaSPayment — verifies Razorpay signature and activates SaaS subscription.
 */
export const verifySaaSPayment = onCall({ region: "asia-south1" }, async (request) => {
    if (!request.auth)
        throw new HttpsError("unauthenticated", "Login required.");
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan, cycle, tenantId } = request.data;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret)
        throw new HttpsError("failed-precondition", "Payment provider not configured.");
    // HMAC-SHA256 signature verification
    const expected = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
    if (expected !== razorpay_signature) {
        throw new HttpsError("permission-denied", "Payment signature mismatch.");
    }
    const uid = request.auth.uid;
    const tid = tenantId || uid;
    const now = new Date();
    // Calculate expiry
    const expiry = new Date(now);
    if (cycle === "yearly")
        expiry.setFullYear(expiry.getFullYear() + 1);
    else
        expiry.setMonth(expiry.getMonth() + 1);
    const subData = {
        uid,
        tenantId: tid,
        plan,
        cycle,
        status: "active",
        activatedAt: Timestamp.fromDate(now),
        expiryAt: Timestamp.fromDate(expiry),
        razorpay_payment_id,
        razorpay_order_id,
        updatedAt: FieldValue.serverTimestamp(),
    };
    // Write to saasSubscriptions/{tenantId}
    await db.collection("saasSubscriptions").doc(tid).set(subData, { merge: true });
    // Also record in purchase history
    await db.collection("saasSubscriptions").doc(tid)
        .collection("purchases").add({
        ...subData,
        purchasedAt: FieldValue.serverTimestamp(),
    });
    return { success: true, expiryAt: expiry.toISOString() };
});
/**
 * getSaaSSubscription — returns current subscription status for a tenant.
 */
export const getSaaSSubscription = onCall({ region: "asia-south1" }, async (request) => {
    if (!request.auth)
        throw new HttpsError("unauthenticated", "Login required.");
    const { tenantId } = request.data;
    const tid = tenantId || request.auth.uid;
    const doc = await db.collection("saasSubscriptions").doc(tid).get();
    if (!doc.exists)
        return { plan: "free", status: "inactive" };
    const data = doc.data();
    const expiry = data.expiryAt?.toDate();
    const isActive = expiry && expiry > new Date();
    return {
        plan: isActive ? data.plan : "free",
        cycle: data.cycle,
        status: isActive ? "active" : "expired",
        expiryAt: expiry?.toISOString() || null,
    };
});
//# sourceMappingURL=saasSubscriptions.js.map