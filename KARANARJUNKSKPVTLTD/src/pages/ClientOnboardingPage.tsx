import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Building2, MapPin, Target, Phone, CheckCircle2, LogOut, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const BUSINESS_TYPES = [
    { value: 'kirana', label: '🛒 Kirana / General Store' },
    { value: 'pharmacy', label: '💊 Medical / Pharmacy' },
    { value: 'garments', label: '👗 Garments / Clothing' },
    { value: 'restaurant', label: '🍛 Restaurant / Dhaba / Food' },
    { value: 'hardware', label: '🔧 Hardware / Building Materials' },
    { value: 'electronics', label: '📱 Electronics Shop' },
    { value: 'stationery', label: '📚 Stationery / Books' },
    { value: 'salon', label: '💇 Salon / Beauty Parlour' },
    { value: 'autoparts', label: '🚗 Auto Parts / Garage' },
    { value: 'agriculture', label: '🌾 Agriculture / Seeds / Fertilizer' },
    { value: 'hotel', label: '🏨 Hotel / Hospitality' },
    { value: 'liquor', label: '🍷 Liquor / Wineshop' },
    { value: 'other', label: '🏢 Other Business' },
];

const STEPS = ['Account', 'Business Setup', 'Dashboard'];

export default function ClientOnboardingPage() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        location: '',
        purpose: '',
        phone: '',
        logoUrl: '',
        referredBy: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setLoading(true);
        try {
            const tenantId = `tenant_${currentUser.uid}`;
            await setDoc(doc(db, 'tenants', tenantId), {
                ...formData,
                referredBy: formData.referredBy.trim() || null,
                ownerId: currentUser.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            await updateDoc(doc(db, 'users', currentUser.uid), {
                tenantId: tenantId,
                role: 'admin',
            });

            setDone(true);
            // Brief success animation then redirect
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1800);
        } catch (error) {
            console.error('Error onboarding client:', error);
            alert('Setup failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel"
                style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}
            >
                {/* Step Progress */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '3rem' }}>
                    {STEPS.map((step, i) => (
                        <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--primary)' : 'var(--surface-base)',
                                    border: i === 2 ? '2px dashed var(--surface-border)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: i < 2 ? 'white' : 'var(--text-tertiary)',
                                    fontSize: '0.8rem', fontWeight: 700,
                                }}>
                                    {i === 0 ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: '0.7rem', color: i < 2 ? 'var(--primary-light)' : 'var(--text-tertiary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                    {step}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div style={{ width: '80px', height: '2px', background: i === 0 ? 'var(--primary)' : 'var(--surface-border)', margin: '0 0.5rem', marginBottom: '20px' }} />
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {done ? (
                        // Success screen
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center', padding: '2rem 0' }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                style={{
                                    width: '80px', height: '80px',
                                    background: 'hsla(152, 60%, 40%, 0.15)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                }}
                            >
                                <CheckCircle2 size={44} color="var(--primary-light)" />
                            </motion.div>
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>You're all set! 🚀</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Setting up your dashboard...</p>
                        </motion.div>
                    ) : (
                        // Form
                        <motion.div key="form">
                            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                <div style={{
                                    width: '4rem', height: '4rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: '1rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                }}>
                                    <Building2 size={32} />
                                </div>
                                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                    {currentUser?.displayName
                                        ? `Welcome, ${currentUser.displayName.split(' ')[0]}! 👋`
                                        : 'Setup Your Business'}
                                </h1>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Tell us about your business — takes 60 seconds.
                                </p>

                                {/* Escape routes for existing users who got stuck */}
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                                    <Link
                                        to="/"
                                        style={{
                                            color: 'var(--text-tertiary)',
                                            fontSize: '0.8rem',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                        }}
                                    >
                                        <Home size={12} /> Back to Homepage
                                    </Link>
                                    <span style={{ color: 'var(--surface-border)' }}>·</span>
                                    <button
                                        type="button"
                                        onClick={() => signOut(auth).then(() => window.location.href = '/')}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-tertiary)',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            padding: 0,
                                            font: 'inherit',
                                        }}
                                    >
                                        <LogOut size={12} /> Sign out
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="input-group">
                                    <label><Building2 size={14} style={{ marginBottom: '-2px', marginRight: '6px' }} />Business Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Sharma General Store"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    />
                                </div>

                                <div className="input-group">
                                    <label><MapPin size={14} style={{ marginBottom: '-2px', marginRight: '6px' }} />City & State</label>
                                    <input
                                        required
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Nagpur, Maharashtra"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="input-group">
                                    <label><Target size={14} style={{ marginBottom: '-2px', marginRight: '6px' }} />Business Type</label>
                                    <select
                                        required
                                        className="input-field"
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    >
                                        <option value="">Select your business type</option>
                                        {BUSINESS_TYPES.map((bt) => (
                                            <option key={bt.value} value={bt.value}>{bt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label><Phone size={14} style={{ marginBottom: '-2px', marginRight: '6px' }} />Phone Number <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(Optional)</span></label>
                                    <input
                                        type="tel"
                                        className="input-field"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                
                                <div className="input-group">
                                    <label><Target size={14} style={{ marginBottom: '-2px', marginRight: '6px' }} />Referral / Agent Code <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(Optional)</span></label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Did someone refer you? Enter their code here"
                                        value={formData.referredBy}
                                        onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '0.5rem', fontSize: '1.05rem' }}
                                >
                                    {loading ? 'Creating your workspace...' : "Let's Go 🚀"}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
