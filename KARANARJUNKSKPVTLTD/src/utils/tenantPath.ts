import { collection, doc, Firestore } from 'firebase/firestore';

export const getTenantCollection = (db: Firestore, tenantId: string, collName: string, ...rest: string[]) => {
    if (tenantId === 'master') {
        return collection(db, collName, ...rest);
    }
    return collection(db, 'tenants', tenantId, collName, ...rest);
};

export const getTenantDoc = (db: Firestore, tenantId: string, collName: string, docId: string, ...rest: string[]) => {
    if (tenantId === 'master') {
        return doc(db, collName, docId, ...rest);
    }
    return doc(db, 'tenants', tenantId, collName, docId, ...rest);
};
