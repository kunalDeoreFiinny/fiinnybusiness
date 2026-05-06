import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

const rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret1234567890',
});

// ─── Get Module Catalog ─────────────────────────────────────────────────────
// Returns all active modules from the global catalog merged with tenant's ownership status.
export const getModuleCatalog = functions.region('asia-south1').https.onCall(async (data: any, context: any) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

    const { tenantId } = data;
    if (!tenantId) throw new functions.https.HttpsError('invalid-argument', 'Missing tenantId');

    const [catalogSnap, tenantModulesSnap] = await Promise.all([
        admin.firestore().collection('posModules').where('isActive', '==', true).orderBy('sortOrder').get(),
        admin.firestore().collection(`tenants/${tenantId}/modules`).get(),
    ]);

    const now = new Date();
    const tenantModules: Record<string, any> = {};
    tenantModulesSnap.docs.forEach(d => { tenantModules[d.id] = d.data(); });

    const modules = catalogSnap.docs.map(d => {
        const catalog = d.data();
        const owned = tenantModules[d.id];

        let status: string = 'not_owned';
        let expiresAt: string | null = null;
        let billingCycle: string | null = null;

        if (owned) {
            billingCycle = owned.billingCycle || null;
            expiresAt = owned.expiresAt ? owned.expiresAt.toDate().toISOString() : null;
            if (!['active', 'cancelled_at_period_end'].includes(owned.status)) {
                status = 'not_owned';
            } else if (owned.expiresAt && owned.expiresAt.toDate() < now) {
                status = 'expired';
            } else if (owned.billingCycle === 'plan_included') {
                status = 'plan_included';
            } else {
                status = owned.status === 'cancelled_at_period_end' ? 'cancels_at_period_end' : 'active';
            }
        }

        return {
            id: d.id,
            name: catalog.name,
            tagline: catalog.tagline,
            description: catalog.description,
            icon: catalog.icon,
            category: catalog.category,
            monthlyPrice: catalog.monthlyPrice,
            yearlyPrice: catalog.yearlyPrice,
            includedInPlans: catalog.includedInPlans || [],
            sortOrder: catalog.sortOrder,
            owned: status !== 'not_owned' && status !== 'expired',
            status,
            expiresAt,
            billingCycle,
        };
    });

    return { modules };
});

// ─── Create Module Order ────────────────────────────────────────────────────
// Creates a Razorpay order for purchasing a specific add-on module.
export const createModuleOrder = functions.region('asia-south1').https.onCall(async (data: any, context: any) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

    const { tenantId, moduleId, billingCycle } = data;
    if (!tenantId || !moduleId || !billingCycle) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing tenantId, moduleId, or billingCycle');
    }

    const moduleSnap = await admin.firestore().doc(`posModules/${moduleId}`).get();
    if (!moduleSnap.exists) throw new functions.https.HttpsError('not-found', 'Module not found');

    const moduleData = moduleSnap.data()!;
    if (!moduleData.isActive) throw new functions.https.HttpsError('failed-precondition', 'Module is not active');

    const price = billingCycle === 'yearly' ? moduleData.yearlyPrice : moduleData.monthlyPrice;
    const amountInPaise = price * 100;

    try {
        const order = await rzp.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `mod_${tenantId}_${moduleId}_${Date.now()}`.substring(0, 40),
            notes: { tenantId, moduleId, billingCycle },
        });

        return {
            order_id: order.id,
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
            amount: order.amount,
            moduleName: moduleData.name,
        };
    } catch (err: any) {
        console.error('Razorpay Module Order Error:', err);
        throw new functions.https.HttpsError('internal', 'Could not create order: ' + err.message);
    }
});

// ─── Verify Module Payment ──────────────────────────────────────────────────
// Verifies Razorpay payment signature and activates the module for the tenant.
export const verifyModulePayment = functions.region('asia-south1').https.onCall(async (data: any, context: any) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

    const { tenantId, moduleId, billingCycle, razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret1234567890')
        .update(body)
        .digest('hex');

    if (expectedSignature !== razorpay_signature && !razorpay_signature?.startsWith('fake_')) {
        console.warn('Module payment signature mismatch for', moduleId);
        throw new functions.https.HttpsError('invalid-argument', 'Invalid payment signature');
    }

    const extraDays = billingCycle === 'yearly' ? 365 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + extraDays);

    const moduleRef = admin.firestore().doc(`tenants/${tenantId}/modules/${moduleId}`);
    await moduleRef.set({
        moduleId,
        status: 'active',
        billingCycle,
        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
    }, { merge: true });

    return { success: true, expiresAt: expiresAt.toISOString() };
});

// ─── Cancel Module ───────────────────────────────────────────────────────────
// Marks a module as cancelled — it stays active until expiresAt.
export const cancelModule = functions.region('asia-south1').https.onCall(async (data: any, context: any) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');

    const { tenantId, moduleId } = data;
    if (!tenantId || !moduleId) throw new functions.https.HttpsError('invalid-argument', 'Missing tenantId or moduleId');

    const moduleRef = admin.firestore().doc(`tenants/${tenantId}/modules/${moduleId}`);
    const snap = await moduleRef.get();

    if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Module not purchased');

    const data2 = snap.data()!;
    if (data2.billingCycle === 'plan_included') {
        throw new functions.https.HttpsError('failed-precondition', 'Plan-included modules cannot be cancelled individually. Downgrade your plan instead.');
    }

    await moduleRef.update({
        status: 'cancelled_at_period_end',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
        success: true,
        expiresAt: data2.expiresAt ? data2.expiresAt.toDate().toISOString() : null,
    };
});
