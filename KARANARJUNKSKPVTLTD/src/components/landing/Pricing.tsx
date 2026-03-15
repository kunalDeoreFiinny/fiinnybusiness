import { motion } from 'framer-motion';
import { Check, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
    return (
        <section id="pricing" style={{ padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                    Simple, <span style={{ color: 'var(--primary-light)' }}>transparent</span> pricing.
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    Join thousands of retailers who have taken control of their growth.
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
                    style={{ padding: '3rem', opacity: 0.7, border: '1px solid hsla(0, 84%, 60%, 0.2)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--danger)' }}>
                        <AlertTriangle size={24} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Legacy Systems</h3>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-tertiary)' }}>
                        Expensive
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            "Manual entry feels like homework",
                            "Data sold to advertisers",
                            "Monthly ledgers that ignore daily reality",
                            "Restrictive limits on your own data",
                            "Public by default"
                        ].map(item => (
                            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-tertiary)' }}>
                                <X size={18} style={{ color: 'var(--danger)' }} /> {item}
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
                        padding: '3rem',
                        border: '2px solid var(--primary)',
                        boxShadow: 'var(--neon-glow)',
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
                        padding: '0.5rem 2rem',
                        transform: 'rotate(45deg) translate(30%, -50%)',
                        fontSize: '0.875rem',
                        fontWeight: 700
                    }}>
                        POPULAR
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary-light)' }}>
                        <Check size={24} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Fiinny System</h3>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Free <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>for now</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Early Adopter Special Program</p>

                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                        {[
                            "Auto-capture in seconds",
                            "Zero knowledge privacy architecture",
                            "Real-time wealth optimization",
                            "Unlimited freedom on your data",
                            "Private by design",
                            "Multi-lingual local support"
                        ].map(item => (
                            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Check size={18} style={{ color: 'var(--primary-light)' }} /> {item}
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
                                padding: '1.25rem',
                                borderRadius: '12px',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                cursor: 'pointer'
                            }}
                        >
                            Get Started Now
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
