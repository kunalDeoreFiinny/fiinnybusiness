import { onDocumentCreated } from 'firebase-functions/v2/firestore';

// Stub for WhatsApp API Integration
// Requires third-party service like Twilio, Gupshup, or Meta WhatsApp Business API

export const sendWhatsAppReceipt = onDocumentCreated(
    'tenants/{tenantId}/salesOrders/{orderId}',
    async (event) => {
        const snap = event.data;
        if (!snap) return;
        
        const order = snap.data();
        const { tenantId, orderId } = event.params;

        if (!order.customerPhone) {
            console.log(`No phone number for order ${orderId}. Skipping WhatsApp.`);
            return;
        }

        const receiptUrl = `https://karanarjun.com/receipt/${tenantId}/${orderId}`;
        const message = `Hello ${order.customerName || 'Customer'}, your digital receipt from KaranArjun KSK is ready: ${receiptUrl} . Thank you for your business!`;

        console.log(`[STUB] Sending WhatsApp to ${order.customerPhone}: ${message}`);
        
        // TODO: Implement actual HTTP call to WhatsApp API Provider
        // Example: await axios.post('https://graph.facebook.com/v17.0/.../messages', { ... });
    }
);
