import { motion } from 'framer-motion';
import { Check, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
    return (
        <section id="pricing" style={{ padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <span style={{ color: 'var(--primary-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Pricing & Partnership</span>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginTop: '1rem', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                    Join the <span style={{ color: 'var(--primary-light)' }}>Retail Revolution.</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.3rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
                    We're on a mission to digitize 1 Crore Kirana stores. Join our Early Adopter 
                    program and get premium access at zero cost for a limited time.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 450px) minmax(300px, 450px)', gap: '3rem', justifyContent: 'center' }}>
                {/* Legacy System Card */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="glass-panel"
                    style={{ padding: '3.5rem', opacity: 0.8, border: '1px solid var(--surface-border)', background: 'var(--surface-raised)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-tertiary)' }}>
                        <X size={24} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manual Methods</h3>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-tertiary)' }}>
                        Hidden Costs
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            "Hours lost in manual tallying",
                            "Inventory leakage & hidden losses",
                            "Forgotten Udhaar (Credit) records",
                            "GST errors & filing headaches",
                            "No way to track real-time profit"
                        ].map(item => (
                            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                                <AlertTriangle size={18} style={{ color: 'var(--warning)' }} /> {item}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Fiinny KaranArjun Card */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="glass-panel"
                    style={{
                        padding: '3.5rem',
                        border: '2px solid var(--primary)',
                        boxShadow: '0 20px 50px -10px hsla(152, 60%, 32%, 0.25)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '0.6rem 2.5rem',
                        transform: 'rotate(45deg) translate(30%, -50%)',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em'
                    }}>
                        RECOMMENDED
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary-light)' }}>
                        <Check size={28} />
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>KaranArjun OS</h3>
                    </div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        Free <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ month*</span>
                    </div>
                    <p style={{ color: 'var(--primary-light)', fontWeight: 600, marginBottom: '2.5rem' }}>Limited Time Early Adopter Access</p>

                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3.5rem' }}>
                        {[
                            "Unlimited 3-Second GST Billing",
                            "Automated Digital Udhaar Tracking",
                            "AI-Powered Smart Inventory control",
                            "WhatsApp Receipts & Auto-Reminders",
                            "Offline Mode with Cloud Sync",
                            "VIP Multi-lingual Support"
                        ].map(item => (
                            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.05rem', fontWeight: 500 }}>
                                <Check size={20} style={{ color: 'var(--primary-light)' }} /> {item}
                            </li>
                        ))}
                    </ul>

                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '1.35rem',
                                borderRadius: '14px',
                                fontWeight: 700,
                                fontSize: '1.15rem',
                                cursor: 'pointer',
                                boxShadow: '0 10px 20px -5px hsla(152, 60%, 32%, 0.4)'
                            }}
                        >
                            Claim Your Free Access
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
