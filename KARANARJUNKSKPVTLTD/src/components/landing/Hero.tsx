import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MapPin, FileText } from 'lucide-react';

export default function Hero() {
    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section style={{
            padding: '10rem 2rem 5rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignItems: 'center',
            gap: '4rem',
            maxWidth: '1200px',
            margin: '0 auto',
        }}>
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
            >
                <span style={{
                    background: 'hsla(152, 60%, 40%, 0.15)',
                    color: 'var(--primary-light)',
                    padding: '0.5rem 1rem',
                    borderRadius: '99px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '1.5rem',
                    display: 'inline-block',
                    border: '1px solid hsla(152, 60%, 40%, 0.3)',
                }}>
                    🇮🇳 Made for Indian Retailers
                </span>

                <h1 style={{
                    fontSize: '4.5rem',
                    lineHeight: 1.1,
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    letterSpacing: '-0.04em',
                }}>
                    Financial <span className="primary-gradient-text">clarity,</span> <br />
                    automated.
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    lineHeight: 1.6,
                    maxWidth: '500px',
                }}>
                    GST invoices, inventory, POS billing & online payments — all in one place.
                    The smart way to run your shop.
                </p>

                {/* Free callout */}
                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--primary-light)',
                    fontWeight: 600,
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                }}>
                    ✅ Free forever · No credit card · Setup in 2 minutes
                </p>

                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    <Link to="/login?signup=true" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: 'var(--neon-glow)' }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2.5rem',
                                borderRadius: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                            }}
                        >
                            Start Free <ArrowRight size={20} />
                        </motion.button>
                    </Link>

                    <motion.button
                        onClick={scrollToFeatures}
                        whileHover={{ scale: 1.05, background: 'var(--surface-raised)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'transparent',
                            color: 'white',
                            border: '1px solid var(--surface-border)',
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        ▶ See how it works
                    </motion.button>
                </div>

                {/* Already have account */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                        Login →
                    </Link>
                </p>

                {/* Stats row */}
                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    marginTop: '2.5rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid var(--surface-border)',
                    flexWrap: 'wrap',
                }}>
                    {[
                        { icon: <FileText size={16} />, label: 'GST Invoices Ready' },
                        { icon: <MapPin size={16} />, label: 'Works Across India' },
                        { icon: <ShieldCheck size={16} />, label: '100% Private Data' },
                    ].map((stat) => (
                        <div key={stat.label} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-tertiary)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                        }}>
                            <span style={{ color: 'var(--primary-light)' }}>{stat.icon}</span>
                            {stat.label}
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ x: 100, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ position: 'relative' }}
            >
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120%',
                    height: '120%',
                    background: 'radial-gradient(circle, hsla(152, 60%, 40%, 0.15) 0%, transparent 70%)',
                    zIndex: -1,
                }} />
                <img
                    src="/mockup.png"
                    alt="Fiinny Business Dashboard — GST billing and inventory management"
                    style={{
                        width: '100%',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        border: '8px solid hsla(220, 20%, 15%, 0.8)',
                    }}
                />
            </motion.div>
        </section>
    );
}
