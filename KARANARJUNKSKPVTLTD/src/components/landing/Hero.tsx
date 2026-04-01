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
                    color: 'var(--text-primary)'
                }}>
                    The Complete <span className="primary-gradient-text">Operating System</span> <br />
                    for Modern Retail.
                </h1>

                <p style={{
                    fontSize: '1.35rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1.5rem',
                    lineHeight: 1.6,
                    maxWidth: '550px',
                }}>
                    GST Billing, Smart Inventory & Digital Khata—all in one powerful app. 
                    Manage your Kirana like a Pro. Built for the future of Bharat.
                </p>

                {/* Free callout */}
                <p style={{
                    fontSize: '0.95rem',
                    color: 'var(--primary-light)',
                    fontWeight: 600,
                    marginBottom: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}>
                    <ShieldCheck size={20} /> GST Ready · Works Offline · 100% Secure & Private
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
                                padding: '1.1rem 2.8rem',
                                borderRadius: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '1.15rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 10px 25px -5px hsla(152, 60%, 32%, 0.3)'
                            }}
                        >
                            Get Started Now <ArrowRight size={20} />
                        </motion.button>
                    </Link>

                    <button
                        onClick={() => window.open('https://wa.me/91XXXXXXXXXX', '_blank')}
                        style={{
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--surface-border)',
                            padding: '1.1rem 2.2rem',
                            borderRadius: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '1.05rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'var(--surface-raised)'; e.currentTarget.style.borderColor = 'var(--text-tertiary)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
                    >
                        💬 Book a Free Demo
                    </button>
                </div>

                {/* Already have account */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginBottom: '2.5rem' }}>
                    Already handling your business here?{' '}
                    <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                        Login to Dashboard →
                    </Link>
                </p>

                {/* Stats row */}
                <div style={{
                    display: 'flex',
                    gap: '2.5rem',
                    marginTop: '2.5rem',
                    paddingTop: '2.5rem',
                    borderTop: '1px solid var(--surface-border)',
                    flexWrap: 'wrap',
                }}>
                    {[
                        { icon: <FileText size={18} />, label: 'GST Invoices Ready' },
                        { icon: <MapPin size={18} />, label: 'Trusted Across India' },
                        { icon: <ShieldCheck size={18} />, label: 'ISO 27001 Certified' },
                    ].map((stat) => (
                        <div key={stat.label} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                        }}>
                            <span style={{ color: 'var(--primary-light)' }}>{stat.icon}</span>
                            {stat.label}
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ x: 100, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ position: 'relative' }}
            >
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '130%',
                    height: '130%',
                    background: 'radial-gradient(circle, hsla(152, 60%, 32%, 0.1) 0%, transparent 75%)',
                    zIndex: -1,
                }} />
                <img
                    src="/premium-hero.png"
                    alt="KaranArjun Retailer SaaS — Professional POS and GST Billing"
                    style={{
                        width: '100%',
                        borderRadius: '28px',
                        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.4), 0 18px 36px -18px rgba(0, 0, 0, 0.5)',
                        border: '1px solid var(--surface-border)',
                    }}
                />
            </motion.div>
        </section>
    );
}
