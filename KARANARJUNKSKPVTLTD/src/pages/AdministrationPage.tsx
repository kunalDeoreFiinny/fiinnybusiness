import { useState } from 'react';
import {
    ShieldAlert, Users, Store, Layers, Palette, Database,
    Factory, Settings, UserCog,
} from 'lucide-react';

// Import sub-pages directly (AdministrationPage itself is lazy-loaded by App.tsx)
import AdminPage from './AdminPage';
import ManageRolesPage from './ManageRolesPage';
import ManageRetailersPage from './ManageRetailersPage';
import ManufacturersPage from './ManufacturersPage';
import AdminStoreProductsPage from './AdminStoreProductsPage';
import InvoiceTemplateBuilderPage from './InvoiceTemplateBuilderPage';
import InvoiceSettingsPage from './InvoiceSettingsPage';
import SchemaBuilderPage from './SchemaBuilderPage';
import SettingsPage from './SettingsPage';

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminTab =
    | 'users'
    | 'roles'
    | 'retailers'
    | 'manufacturers'
    | 'store'
    | 'invoice-templates'
    | 'invoice-branding'
    | 'schema-builder'
    | 'settings';

const ADMIN_TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'users',             label: 'Manage Users',      icon: <Users size={16} /> },
    { id: 'roles',             label: 'Role Matrix',        icon: <ShieldAlert size={16} /> },
    { id: 'retailers',         label: 'Manage Retailers',   icon: <UserCog size={16} /> },
    { id: 'manufacturers',     label: 'Manufacturers',      icon: <Factory size={16} /> },
    { id: 'store',             label: 'Manage Store',       icon: <Store size={16} /> },
    { id: 'invoice-templates', label: 'Invoice Templates',  icon: <Layers size={16} /> },
    { id: 'invoice-branding',  label: 'Invoice Branding',   icon: <Palette size={16} /> },
    { id: 'schema-builder',    label: 'UI Layout Builder',  icon: <Database size={16} /> },
    { id: 'settings',          label: 'Settings',           icon: <Settings size={16} /> },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdministrationPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>('users');

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>

            {/* ── Sticky Tab Bar ── */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    background: 'var(--surface-base)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    display: 'flex',
                    gap: '0.25rem',
                    borderBottom: '2px solid var(--surface-border)',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    // Extend to page edges under the parent's 2rem padding
                    marginLeft: '-2rem',
                    marginRight: '-2rem',
                    paddingLeft: '2rem',
                    paddingRight: '2rem',
                    marginTop: '-2rem',
                    paddingTop: '0.75rem',
                    marginBottom: '1.75rem',
                }}
            >
                {ADMIN_TABS.map(tab => {
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.65rem 1.1rem',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: active
                                    ? '2px solid var(--primary-light)'
                                    : '2px solid transparent',
                                marginBottom: '-2px',
                                color: active ? 'var(--primary-light)' : 'var(--text-tertiary)',
                                fontWeight: active ? 700 : 400,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                whiteSpace: 'nowrap',
                                transition: 'color 0.15s ease, border-color 0.15s ease',
                                flexShrink: 0,
                            }}
                            onMouseEnter={e => {
                                if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={e => {
                                if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)';
                            }}
                        >
                            <span style={{ opacity: active ? 1 : 0.6, display: 'flex' }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab Content ── */}
            {activeTab === 'users'             && <AdminPage />}
            {activeTab === 'roles'             && <ManageRolesPage />}
            {activeTab === 'retailers'         && <ManageRetailersPage />}
            {activeTab === 'manufacturers'     && <ManufacturersPage />}
            {activeTab === 'store'             && <AdminStoreProductsPage />}
            {activeTab === 'invoice-templates' && <InvoiceTemplateBuilderPage />}
            {activeTab === 'invoice-branding'  && <InvoiceSettingsPage />}
            {activeTab === 'schema-builder'    && <SchemaBuilderPage />}
            {activeTab === 'settings'          && <SettingsPage />}
        </div>
    );
}
