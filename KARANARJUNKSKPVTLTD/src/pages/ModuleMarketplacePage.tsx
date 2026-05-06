import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Package, Zap, RotateCcw, Star, CreditCard, Layers, Scale,
    Banknote, Archive, MessageCircle, MessageSquare, ShoppingCart,
    Columns, WifiOff, QrCode, Smartphone, Image, Lock, CheckCircle2,
    X, Loader2, AlertCircle, Calendar,
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

declare global { interface Window { Razorpay: any; } }

interface ModuleItem {
    id: string;
    name: string;
    tagline: string;
    description: string;
    icon: string;
    category: string;
    monthlyPrice: number;
    yearlyPrice: number;
    includedInPlans: string[];
    owned: boolean;
    status: string;
    expiresAt: string | null;
    billingCycle: string | null;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    Zap: <Zap size={24} />,
    RotateCcw: <RotateCcw size={24} />,
    Star: <Star size={24} />,
    CreditCard: <CreditCard size={24} />,
    Layers: <Layers size={24} />,
    Scale: <Scale size={24} />,
    Banknote: <Banknote size={24} />,
    Archive: <Archive size={24} />,
    MessageCircle: <MessageCircle size={24} />,
    MessageSquare: <MessageSquare size={24} />,
    ShoppingCart: <ShoppingCart size={24} />,
    Columns: <Columns size={24} />,
    WifiOff: <WifiOff size={24} />,
    QrCode: <QrCode size={24} />,
    Smartphone: <Smartphone size={24} />,
    Image: <Image size={24} />,
};

const CATEGORIES = ['All', 'pos', 'payments', 'customers', 'operations'];
const CATEGORY_LABELS: Record<string, string> = {
    All: 'All Modules', pos: 'POS', payments: 'Payments', customers: 'Customers', operations: 'Operations',
};

export default function ModuleMarketplacePage() {
    const { tenantId, tenantPlan } = useAuth();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const highlight = searchParams.get('highlight');

    const [modules, setModules] = useState<ModuleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [activeCategory, setActiveCategory] = useState('All');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [cancelTarget, setCancelTarget] = useState<ModuleItem | null>(null);

    const fetchCatalog = useCallback(async () => {
        if (!tenantId) return;
        try {
            const fn = httpsCallable<any, { modules: ModuleItem[] }>(functions, 'getModuleCatalog');
            const result = await fn({ tenantId });
            setModules(result.data.modules);
        } catch (e) {
            console.error('Failed to load module catalog', e);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

    // Scroll to highlighted module
    useEffect(() => {
        if (highlight && !loading) {
            setTimeout(() => {
                document.getElementById(`module-${highlight}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, [highlight, loading]);

    const handleBuy = async (mod: ModuleItem) => {
        if (!tenantId) return;
        setProcessingId(mod.id);
        try {
            const createOrder = httpsCallable<any, { order_id: string; key_id: string; amount: number; moduleName: string }>(functions, 'createModuleOrder');
            const { data } = await createOrder({ tenantId, moduleId: mod.id, billingCycle });

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.body.appendChild(script);
            script.onload = () => {
                const rzp = new window.Razorpay({
                    key: data.key_id,
                    amount: data.amount,
                    currency: 'INR',
                    name: 'KaranArjun POS',
                    description: `${data.moduleName} — ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}`,
                    order_id: data.order_id,
                    theme: { color: '#10b981' },
                    handler: async (response: any) => {
                        try {
                            const verify = httpsCallable(functions, 'verifyModulePayment');
                            await verify({
                                tenantId,
                                moduleId: mod.id,
                                billingCycle,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });
                            showToast(`${mod.name} unlocked successfully!`, 'success');
                            fetchCatalog();
                        } catch (e) {
                            showToast('Payment verified but activation failed. Contact support.', 'error');
                        } finally {
                            setProcessingId(null);
                        }
                    },
                    modal: { ondismiss: () => setProcessingId(null) },
                });
                rzp.open();
            };
        } catch (e: any) {
            showToast(e.message || 'Failed to initiate payment', 'error');
            setProcessingId(null);
        }
    };

    const handleCancel = async () => {
        if (!cancelTarget || !tenantId) return;
        try {
            const fn = httpsCallable(functions, 'cancelModule');
            const result: any = await fn({ tenantId, moduleId: cancelTarget.id });
            const expiry = result.data.expiresAt
                ? new Date(result.data.expiresAt).toLocaleDateString('en-IN')
                : 'end of period';
            showToast(`${cancelTarget.name} will cancel on ${expiry}`, 'success');
            fetchCatalog();
        } catch (e: any) {
            showToast(e.message || 'Failed to cancel module', 'error');
        } finally {
            setCancelTarget(null);
        }
    };

    const filtered = modules.filter(m => activeCategory === 'All' || m.category === activeCategory);

    const savings = (mod: ModuleItem) => {
        const monthlyCost = mod.monthlyPrice * 12;
        return monthlyCost > mod.yearlyPrice ? Math.round(((monthlyCost - mod.yearlyPrice) / monthlyCost) * 100) : 0;
    };

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
                        <Package size={22} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Module Marketplace</h1>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Add features to your POS as you need them. Buy only what you use.
                    Current plan: <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{tenantPlan}</strong>
                </p>
            </div>

            {/* Billing cycle toggle + category filter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 600,
                                border: '1px solid var(--surface-border)', cursor: 'pointer',
                                background: activeCategory === cat ? 'var(--primary)' : 'white',
                                color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                            }}>
                            {CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', background: 'var(--surface-raised)', borderRadius: '12px', padding: '0.25rem' }}>
                    {(['monthly', 'yearly'] as const).map(cycle => (
                        <button key={cycle} onClick={() => setBillingCycle(cycle)}
                            style={{
                                padding: '0.4rem 1.1rem', borderRadius: '10px', fontWeight: 600,
                                background: billingCycle === cycle ? 'white' : 'transparent',
                                color: billingCycle === cycle ? 'var(--primary)' : 'var(--text-tertiary)',
                                border: 'none', cursor: 'pointer',
                            }}>
                            {cycle === 'yearly' ? '📅 Yearly (save up to 15%)' : 'Monthly'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Module grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {filtered.map(mod => {
                    const isHighlighted = mod.id === highlight;
                    const price = billingCycle === 'yearly' ? mod.yearlyPrice : mod.monthlyPrice;
                    const savePct = savings(mod);
                    const isProcessing = processingId === mod.id;
                    const isPlanIncluded = mod.includedInPlans.includes(tenantPlan);

                    return (
                        <div key={mod.id} id={`module-${mod.id}`}
                            style={{
                                background: 'white', borderRadius: '16px', padding: '1.5rem',
                                border: isHighlighted ? '2px solid var(--primary)' : '1px solid var(--surface-border)',
                                boxShadow: isHighlighted ? '0 0 0 4px hsla(152,60%,40%,0.12)' : 'none',
                                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                transition: 'box-shadow 0.2s',
                            }}>

                            {/* Icon + name */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                                        background: 'hsla(152,60%,40%,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--primary)',
                                    }}>
                                        {ICON_MAP[mod.icon] || <Package size={24} />}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{mod.name}</h4>
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '8px',
                                            background: 'var(--surface-raised)', color: 'var(--text-tertiary)',
                                            textTransform: 'capitalize',
                                        }}>{mod.category}</span>
                                    </div>
                                </div>

                                {/* Status badge */}
                                {mod.status === 'active' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700 }}>
                                        <CheckCircle2 size={16} /> Active
                                    </div>
                                )}
                                {mod.status === 'plan_included' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb', fontSize: '0.78rem', fontWeight: 700 }}>
                                        <CheckCircle2 size={16} /> Included
                                    </div>
                                )}
                                {mod.status === 'cancels_at_period_end' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#d97706', fontSize: '0.78rem', fontWeight: 700 }}>
                                        <AlertCircle size={16} /> Cancels soon
                                    </div>
                                )}
                                {!mod.owned && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                                        <Lock size={14} /> Locked
                                    </div>
                                )}
                            </div>

                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {mod.tagline}
                            </p>

                            {/* Expiry info */}
                            {mod.expiresAt && mod.status !== 'plan_included' && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                    <Calendar size={13} />
                                    {mod.status === 'cancels_at_period_end' ? 'Cancels on' : 'Renews on'}{' '}
                                    {new Date(mod.expiresAt).toLocaleDateString('en-IN')}
                                </div>
                            )}

                            {/* Price + CTA */}
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    {mod.owned ? (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                                            {mod.billingCycle === 'plan_included'
                                                ? `Via ${tenantPlan} plan`
                                                : `₹${price}/${billingCycle === 'yearly' ? 'yr' : 'mo'}`}
                                        </span>
                                    ) : (
                                        <div>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                                                ₹{price}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                                /{billingCycle === 'yearly' ? 'yr' : 'mo'}
                                            </span>
                                            {billingCycle === 'yearly' && savePct > 0 && (
                                                <span style={{
                                                    marginLeft: '0.4rem', fontSize: '0.7rem', fontWeight: 700,
                                                    color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '8px',
                                                }}>
                                                    Save {savePct}%
                                                </span>
                                            )}
                                            {isPlanIncluded && !mod.owned && (
                                                <div style={{ fontSize: '0.72rem', color: '#2563eb', marginTop: '2px' }}>
                                                    Included in {mod.includedInPlans[0]} plan
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    {mod.status === 'plan_included' ? (
                                        <button disabled style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'default', fontSize: '0.85rem' }}>
                                            Included
                                        </button>
                                    ) : mod.owned ? (
                                        mod.status !== 'cancels_at_period_end' && (
                                            <button onClick={() => setCancelTarget(mod)}
                                                style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                Manage
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            onClick={() => handleBuy(mod)}
                                            disabled={isProcessing}
                                            style={{
                                                padding: '0.45rem 1.1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                                background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.85rem',
                                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                opacity: isProcessing ? 0.7 : 1,
                                            }}>
                                            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                            Buy
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-tertiary)' }}>
                    <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                    <p>No modules in this category yet.</p>
                </div>
            )}

            {/* Cancel confirmation modal */}
            {cancelTarget && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '420px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Cancel Module</h3>
                            <button onClick={() => setCancelTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Are you sure you want to cancel <strong>{cancelTarget.name}</strong>?
                            It will remain active until the end of the current billing period.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setCancelTarget(null)}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'transparent', cursor: 'pointer' }}>
                                Keep Module
                            </button>
                            <button onClick={handleCancel}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: 'var(--danger)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
