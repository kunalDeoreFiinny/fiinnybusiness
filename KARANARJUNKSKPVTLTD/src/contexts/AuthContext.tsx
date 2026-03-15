import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

export type UserRole = 'admin' | 'analyst' | 'retailer' | 'manufacturer' | 'customer';

interface TenantData {
    businessName: string;
    logoUrl?: string;
    location?: string;
    purpose?: string;
}

export type AppScreen =
  | 'dashboard'
  | 'b2c_dashboard'
  | 'retailers'
  | 'worklist'
  | 'dispatch'
  | 'pos'
  | 'inventory'
  | 'settings'
  | 'manage_retailers'
  | 'admin'
  | 'invoice_settings'
  | 'schema_builder'
  | 'invoice_templates'
  | 'manufacturers'
  | 'order_history'
  | 'online_orders'
  | 'online_dashboard'
  | 'manage_store'
  | 'analytics';

export type RolePermissions = Record<UserRole, Record<AppScreen, boolean>>;
export const defaultPermissions: RolePermissions = {
    admin: { dashboard: true, b2c_dashboard: true, online_dashboard: true, analytics: true, retailers: true, worklist: true, dispatch: true, pos: true, inventory: true, online_orders: true, order_history: true, settings: true, admin: true, manufacturers: true, invoice_templates: true, invoice_settings: true, schema_builder: true, manage_retailers: true, manage_store: true },
    analyst: { dashboard: true, b2c_dashboard: true, online_dashboard: true, analytics: true, retailers: true, worklist: true, dispatch: true, pos: true, inventory: true, online_orders: false, order_history: true, settings: true, admin: false, manufacturers: false, invoice_templates: false, invoice_settings: false, schema_builder: false, manage_retailers: false, manage_store: false },
    retailer: { dashboard: false, b2c_dashboard: false, online_dashboard: false, analytics: false, retailers: false, worklist: false, dispatch: false, pos: false, inventory: false, online_orders: false, order_history: false, settings: true, admin: false, manufacturers: false, invoice_templates: false, invoice_settings: false, schema_builder: false, manage_retailers: false, manage_store: false },
    manufacturer: { dashboard: false, b2c_dashboard: false, online_dashboard: false, analytics: false, retailers: false, worklist: false, dispatch: false, pos: false, inventory: false, online_orders: false, order_history: false, settings: true, admin: false, manufacturers: false, invoice_templates: false, invoice_settings: false, schema_builder: false, manage_retailers: false, manage_store: false },
    customer: { dashboard: false, b2c_dashboard: false, online_dashboard: false, analytics: false, retailers: false, worklist: false, dispatch: false, pos: false, inventory: false, online_orders: false, order_history: false, settings: true, admin: false, manufacturers: false, invoice_templates: false, invoice_settings: false, schema_builder: false, manage_retailers: false, manage_store: false }
};

interface AuthContextType {
    currentUser: User | null;
    userRole: UserRole | null;
    tenantId: string | null;
    tenantData: TenantData | null;
    linkedId: string | null; // retailerId or manufacturerId for non-admin users
    permissions: RolePermissions;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    userRole: null,
    tenantId: null,
    tenantData: null,
    linkedId: null,
    permissions: defaultPermissions,
    loading: true,
    logout: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [tenantData, setTenantData] = useState<TenantData | null>(null);
    const [linkedId, setLinkedId] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<RolePermissions>(defaultPermissions);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribePerms: (() => void) | null = null;
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);
                    const emailLC = user.email?.toLowerCase() || '';
                    const isMasterAdmin = emailLC.includes('arjuntanpure') || emailLC.includes('arjutanpure');

                    let role: UserRole = isMasterAdmin ? 'admin' : (userDoc.exists() ? (userDoc.data().role as UserRole) : 'analyst');
                    let tId = isMasterAdmin ? 'master' : (userDoc.exists() ? userDoc.data().tenantId : null);
                    let lId: string | null = userDoc.exists() ? (userDoc.data().linkedId || null) : null;

                    if (!userDoc.exists() || isMasterAdmin) {
                        await setDoc(userDocRef, {
                            email: user.email,
                            name: user.displayName || user.email?.split('@')[0] || 'Arjun Tanpure',
                            role: role,
                            tenantId: tId,
                            linkedId: lId,
                            updatedAt: serverTimestamp(),
                            ...(userDoc.exists() ? {} : { createdAt: serverTimestamp() })
                        }, { merge: true });
                    }

                    setUserRole(role);
                    setTenantId(tId);
                    setLinkedId(lId);

                    if (tId && tId !== 'master') {
                        const tenantDoc = await getDoc(doc(db, 'tenants', tId));
                        if (tenantDoc.exists()) {
                            setTenantData(tenantDoc.data() as TenantData);
                        }
                    } else if (tId === 'master') {
                        setTenantData({ businessName: 'KaranArjun' });
                    }

                    // Fetch or Initialize Role Permissions
                    if (tId) {
                        try {
                            const [getTenantDoc] = await Promise.all([
                                import('../utils/tenantPath').then(m => m.getTenantDoc)
                            ]);
                            const permDocRef = getTenantDoc(db, tId, 'settings', 'rolePermissions');

                            if (unsubscribePerms) unsubscribePerms();

                            unsubscribePerms = onSnapshot(permDocRef, async (permDoc) => {
                                if (permDoc.exists() && Object.keys(permDoc.data() || {}).length > 0) {
                                    const fetchedPerms = permDoc.data() as RolePermissions;
                                    const mergedPerms: any = { ...defaultPermissions };
                                    
                                    for (const [r, pObj] of Object.entries(fetchedPerms)) {
                                        mergedPerms[r] = {
                                            ...(defaultPermissions[r as UserRole] || {}),
                                            ...pObj
                                        };
                                    }
                                    setPermissions(mergedPerms as RolePermissions);
                                } else {
                                    await setDoc(permDocRef, defaultPermissions);
                                    // Snapshot will trigger again automatically after setDoc
                                }
                            });
                        } catch (permErr) {
                            console.error("Error fetching permissions", permErr);
                            setPermissions(defaultPermissions);
                        }
                    } else {
                        if (unsubscribePerms) {
                            unsubscribePerms();
                            unsubscribePerms = null;
                        }
                    }

                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setUserRole('analyst');
                    setPermissions(defaultPermissions);
                }
            } else {
                setUserRole(null);
                setTenantId(null);
                setTenantData(null);
                setLinkedId(null);
                setPermissions(defaultPermissions);
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return () => {
            unsubscribe();
            if (unsubscribePerms) unsubscribePerms();
        };
    }, []);

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userRole,
        tenantId,
        tenantData,
        linkedId,
        permissions,
        loading,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
