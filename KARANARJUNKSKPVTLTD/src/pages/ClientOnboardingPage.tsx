import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Building2, MapPin, Target, Layout } from 'lucide-react';

export default function ClientOnboardingPage() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        location: '',
        purpose: '',
        logoUrl: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setLoading(true);
        try {
            // 1. Create Tenant Document
            const tenantId = `tenant_${currentUser.uid}`;
            await setDoc(doc(db, 'tenants', tenantId), {
                ...formData,
                ownerId: currentUser.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // 2. Update User Profile with tenantId
            await updateDoc(doc(db, 'users', currentUser.uid), {
                tenantId: tenantId,
                role: 'admin' // First user of tenant is always admin
            });

            // 3. Force page reload to refresh AuthContext
            window.location.href = '/dashboard';
        } catch (error) {
            console.error("Error onboarding client:", error);
            alert("Setup failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel"
                style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '4rem',
                        height: '4rem',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <Building2 size={32} />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Setup Your Business</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome to Fiinny Business. Let's get your instance ready.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label><Building2 size={16} style={{ marginBottom: '-3px', marginRight: '8px' }} /> Business Name</label>
                        <input
                            required
                            type="text"
                            className="input-field"
                            placeholder="e.g. Fiinny Retailers"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label><MapPin size={16} style={{ marginBottom: '-3px', marginRight: '8px' }} /> Location</label>
                        <input
                            required
                            type="text"
                            className="input-field"
                            placeholder="City, State"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label><Target size={16} style={{ marginBottom: '-3px', marginRight: '8px' }} /> Purpose of Using Fiinny</label>
                        <select
                            required
                            className="input-field"
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        >
                            <option value="">Select Purpose</option>
                            <option value="retail">Retail Shop Management</option>
                            <option value="pharmacy">Pharmacy/Medical Store</option>
                            <option value="personal">Personal Asset Tracking</option>
                            <option value="other">Other Business</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label><Layout size={16} style={{ marginBottom: '-3px', marginRight: '8px' }} /> Logo URL (Optional)</label>
                        <input
                            type="url"
                            className="input-field"
                            placeholder="https://example.com/logo.png"
                            value={formData.logoUrl}
                            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                    >
                        {loading ? 'Initializing Instance...' : 'Complete Setup'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
