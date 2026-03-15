import { getDoc, setDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { ModuleSchema } from '../types/schema';
import { getTenantDoc, getTenantCollection } from '../utils/tenantPath';

export const SCHEMA_COLLECTION = 'ui_schemas';

// Default schema for Retailers if none exists
const DEFAULT_RETAILER_SCHEMA: ModuleSchema = {
    moduleId: 'retailers',
    moduleName: 'Retailers/Customers',
    fields: [
        { id: 'name', label: 'Retailer Name', type: 'text', required: true, editable: true, visibleInTable: true, visibleInExport: true, order: 1, systemOnly: true },
        { id: 'number', label: 'Contact Number', type: 'phone', required: true, editable: true, visibleInTable: true, visibleInExport: true, order: 2 },
        { id: 'location', label: 'Location/Village', type: 'text', required: false, editable: true, visibleInTable: true, visibleInExport: true, order: 3 },
        { id: 'portfolioSize', label: 'Portfolio Size', type: 'select', required: true, editable: true, visibleInTable: true, visibleInExport: true, order: 4, options: [{ label: 'Big', value: 'Big' }, { label: 'Medium', value: 'Medium' }, { label: 'Small', value: 'Small' }] },
        { id: 'outstandingAmount', label: 'Outstanding Balance', type: 'currency', required: false, editable: false, visibleInTable: true, visibleInExport: true, order: 5, systemOnly: true },
        { id: 'email', label: 'Email Address', type: 'email', required: false, editable: true, visibleInTable: false, visibleInExport: true, order: 6 },
        { id: 'bookName', label: 'Book Name', type: 'text', required: false, editable: true, visibleInTable: false, visibleInExport: true, order: 7 },
        { id: 'billBookPageNo', label: 'Bill Book Page No', type: 'text', required: false, editable: true, visibleInTable: false, visibleInExport: true, order: 8 },
        { id: 'alternateNumber', label: 'Alternate Mobile', type: 'phone', required: false, editable: true, visibleInTable: false, visibleInExport: true, order: 9 },
    ]
};

// Default schema for Orders
const DEFAULT_ORDER_SCHEMA: ModuleSchema = {
    moduleId: 'orders',
    moduleName: 'Orders & Sales',
    fields: [
        { id: 'productName', label: 'Product Name', type: 'text', required: true, editable: false, visibleInTable: true, visibleInExport: true, order: 1, systemOnly: true },
        { id: 'quantity', label: 'Quantity', type: 'number', required: true, editable: true, visibleInTable: true, visibleInExport: true, order: 2 },
        { id: 'unit', label: 'Unit', type: 'select', required: true, editable: true, visibleInTable: true, visibleInExport: true, order: 3, options: [{ label: 'Boxes', value: 'Boxes' }, { label: 'Pieces', value: 'Pieces' }] },
        { id: 'amount', label: 'Total Amount', type: 'currency', required: true, editable: true, visibleInTable: true, visibleInExport: true, order: 4, systemOnly: true },
        { id: 'paymentStatus', label: 'Payment Status', type: 'select', required: true, editable: true, visibleInTable: true, visibleInExport: true, order: 5, options: [{ label: 'Paid', value: 'Paid' }, { label: 'Unpaid', value: 'Unpaid' }], systemOnly: true },
        { id: 'talkedTo', label: 'Talked To', type: 'text', required: false, editable: true, visibleInTable: true, visibleInExport: true, order: 6 },
        { id: 'notes', label: 'Notes', type: 'text', required: false, editable: true, visibleInTable: false, visibleInExport: true, order: 7 },
    ]
};

export const fetchModuleSchema = async (tenantId: string, moduleId: string): Promise<ModuleSchema> => {
    try {
        const schemaRef = getTenantDoc(db, tenantId, SCHEMA_COLLECTION, moduleId);
        const schemaSnap = await getDoc(schemaRef);

        if (schemaSnap.exists()) {
            return schemaSnap.data() as ModuleSchema;
        }

        // Return defaults if none exists in DB yet
        if (moduleId === 'retailers') return DEFAULT_RETAILER_SCHEMA;
        if (moduleId === 'orders') return DEFAULT_ORDER_SCHEMA;

        throw new Error(`Schema for module ${moduleId} not found and no default exists.`);
    } catch (error) {
        console.error(`Error fetching schema for ${moduleId}:`, error);
        throw error;
    }
};

export const fetchAllSchemas = async (tenantId: string): Promise<ModuleSchema[]> => {
    try {
        const schemasCol = getTenantCollection(db, tenantId, SCHEMA_COLLECTION);
        const snap = await getDocs(schemasCol);

        if (snap.empty) {
            // Seed defaults
            await saveModuleSchema(tenantId, DEFAULT_RETAILER_SCHEMA.moduleId, DEFAULT_RETAILER_SCHEMA);
            await saveModuleSchema(tenantId, DEFAULT_ORDER_SCHEMA.moduleId, DEFAULT_ORDER_SCHEMA);
            return [DEFAULT_RETAILER_SCHEMA, DEFAULT_ORDER_SCHEMA];
        }

        return snap.docs.map(doc => doc.data() as ModuleSchema);
    } catch (error) {
        console.error("Error fetching all schemas:", error);
        throw error;
    }
};

export const saveModuleSchema = async (tenantId: string, moduleId: string, schema: ModuleSchema): Promise<void> => {
    try {
        const schemaRef = getTenantDoc(db, tenantId, SCHEMA_COLLECTION, moduleId);
        await setDoc(schemaRef, {
            ...schema,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error(`Error saving schema for ${moduleId}:`, error);
        throw error;
    }
};
