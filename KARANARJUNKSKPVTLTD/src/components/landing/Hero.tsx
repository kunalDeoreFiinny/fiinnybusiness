import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section style={{
            padding: '10rem 2rem 5rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignItems: 'center',
            gap: '4rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
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
                    border: '1px solid hsla(152, 60%, 40%, 0.3)'
                }}>
                    Revolutionizing Retail 2.0
                </span>

                <h1 style={{
                    fontSize: '4.5rem',
                    lineHeight: 1.1,
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    letterSpacing: '-0.04em'
                }}>
                    Financial <span className="primary-gradient-text">clarity,</span> <br />
                    automated.
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '2.5rem',
                    lineHeight: 1.6,
                    maxWidth: '500px'
                }}>
                    The old way is manual, messy, and public. The <span style={{ color: 'white' }}>Fiinny KaranArjun</span> way is automated, private, and precise. Manage your entire business in one place.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
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
                                gap: '0.75rem'
                            }}
                        >
                            Get Started Now <ArrowRight size={20} />
                        </motion.button>
                    </Link>

                    <motion.button
                        whileHover={{ scale: 1.05, background: 'var(--surface-raised)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'transparent',
                            color: 'white',
                            border: '1px solid var(--surface-border)',
                            padding: '1rem 2.5rem',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}
                    >
                        <Play size={20} fill="currentColor" /> See how it works
                    </motion.button>
                </div>
            </motion.div>

            <motion.div
                initial={{ x: 100, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
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
                    zIndex: -1
                }} />

                <img
                    src="/mockup.png"
                    alt="Dashboard Mockup"
                    style={{
                        width: '100%',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        border: '8px solid hsla(220, 20%, 15%, 0.8)'
                    }}
                />
            </motion.div>
        </section>
    );
}
