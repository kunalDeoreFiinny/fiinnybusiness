import { getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { InvoiceTemplate, InvoiceTemplateBranding } from '../types/invoiceTemplate';
import { getTenantDoc } from '../utils/tenantPath';

export const INVOICE_TEMPLATES_COLLECTION = 'invoice_templates';

// ── Default: Distributor → Retailer ──────────────────────────
export const DEFAULT_DISTRIBUTOR_RETAILER_TEMPLATE: InvoiceTemplate = {
    templateId: 'distributor_retailer',
    name: 'Distributor → Retailer',
    description: 'Tax invoice issued by KaranArjun (distributor) to retailer',
    fields: [
        { id: 'productName', label: 'Product / Description', sourceKey: 'productName', show: true, bold: false, order: 1, systemOnly: true },
        { id: 'quantity', label: 'Qty', sourceKey: 'quantity', show: true, bold: false, order: 2, systemOnly: true },
        { id: 'unit', label: 'Unit', sourceKey: 'unit', show: true, bold: false, order: 3, systemOnly: true },
        { id: 'amount', label: 'Amount (₹)', sourceKey: 'amount', show: true, bold: true, order: 4, isCurrency: true, systemOnly: true },
        { id: 'paymentStatus', label: 'Payment Status', sourceKey: 'paymentStatus', show: true, bold: false, order: 5, systemOnly: true },
        { id: 'talkedTo', label: 'Salesperson', sourceKey: 'talkedTo', show: true, bold: false, order: 6 },
        { id: 'notes', label: 'Notes / Remarks', sourceKey: 'notes', show: true, bold: false, order: 7 },
    ],
};

// ── Default: Retailer → Customer ─────────────────────────────
export const DEFAULT_RETAILER_CUSTOMER_TEMPLATE: InvoiceTemplate = {
    templateId: 'retailer_customer',
    name: 'Retailer → Customer',
    description: 'Bill issued by retailer to their end customer',
    fields: [
        { id: 'productName', label: 'Product Name', sourceKey: 'productName', show: true, bold: false, order: 1, systemOnly: true },
        { id: 'unit', label: 'Packing', sourceKey: 'unit', show: true, bold: false, order: 2, systemOnly: true },
        { id: 'mrp', label: 'Rate (₹)', sourceKey: 'mrp', show: true, bold: false, order: 3, isCurrency: true, systemOnly: true },
        { id: 'quantity', label: 'Quantity', sourceKey: 'quantity', show: true, bold: false, order: 4, systemOnly: true },
        { id: 'amount', label: 'Total (₹)', sourceKey: 'amount', show: true, bold: true, order: 5, isCurrency: true, systemOnly: true },
        { id: 'notes', label: 'Remarks', sourceKey: 'notes', show: false, bold: false, order: 6 },
    ],
};

// ── Fetch ─────────────────────────────────────────────────────
export const fetchInvoiceTemplate = async (
    tenantId: string,
    templateId: 'distributor_retailer' | 'retailer_customer'
): Promise<InvoiceTemplate> => {
    try {
        const ref = getTenantDoc(db, tenantId, INVOICE_TEMPLATES_COLLECTION, templateId);
        const snap = await getDoc(ref);
        if (snap.exists()) return snap.data() as InvoiceTemplate;
        // Return default if not configured yet
        return templateId === 'distributor_retailer'
            ? DEFAULT_DISTRIBUTOR_RETAILER_TEMPLATE
            : DEFAULT_RETAILER_CUSTOMER_TEMPLATE;
    } catch (err) {
        console.error('fetchInvoiceTemplate error', err);
        return templateId === 'distributor_retailer'
            ? DEFAULT_DISTRIBUTOR_RETAILER_TEMPLATE
            : DEFAULT_RETAILER_CUSTOMER_TEMPLATE;
    }
};

// ── Fetch Branding ────────────────────────────────────────────
export const fetchInvoiceBranding = async (tenantId: string): Promise<InvoiceTemplateBranding> => {
    try {
        const ref = getTenantDoc(db, tenantId, 'settings', 'invoice');
        const snap = await getDoc(ref);
        if (snap.exists()) return snap.data() as InvoiceTemplateBranding;
    } catch { /* ignore */ }
    return {
        businessName: '',
        address: '',
    };
};

// ── Save ──────────────────────────────────────────────────────
export const saveInvoiceTemplate = async (
    tenantId: string,
    template: InvoiceTemplate
): Promise<void> => {
    const ref = getTenantDoc(db, tenantId, INVOICE_TEMPLATES_COLLECTION, template.templateId);
    await setDoc(ref, { ...template, updatedAt: serverTimestamp() });
};
