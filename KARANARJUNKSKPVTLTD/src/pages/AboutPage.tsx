import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Clock, Zap, Globe, ArrowLeft } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
            {/* Split Island Navigation */}
            <nav style={{
                position: 'fixed',
                top: '1.5rem',
                left: 0,
                right: 0,
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 2rem',
                pointerEvents: 'none'
            }}>
                <div style={{
                    pointerEvents: 'auto',
                    background: 'hsla(0, 0%, 100%, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '999px',
                    padding: '0.75rem 1.5rem',
                    boxShadow: 'var(--glass-shadow)',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.9rem' }}>
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
                <div style={{
                    pointerEvents: 'auto',
                    background: 'hsla(0, 0%, 100%, 0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '999px',
                    padding: '0.75rem 1.5rem',
                    boxShadow: 'var(--glass-shadow)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <img src="/logo.png" alt="Fiinny Logo" style={{ width: '28px', height: '28px' }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Fiinny</span>
                </div>
            </nav>

            <main style={{ paddingTop: '10rem', paddingBottom: '6rem', maxWidth: '800px', margin: '0 auto', padding: '10rem 2rem 6rem' }}>
                {/* Intro */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ marginBottom: '5rem' }}
                >
                    <div style={{
                        display: 'inline-flex',
                        padding: '0.4rem 1rem',
                        borderRadius: '99px',
                        background: 'var(--primary-light)',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '2rem'
                    }}>
                        Our Story
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2rem', lineHeight: 1.1 }}>
                        Engineering Financial Clarity. <br />
                        <span className="primary-gradient-text">Built in Hyderabad.</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>
                        Fiinny is an institution-grade financial operating system. We combine bank-level security with consumer-grade design to give you absolute control over your net worth.
                        <span style={{ display: 'block', marginTop: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>No ads. No data selling. Just pure utility.</span>
                    </p>
                </motion.div>

                <div style={{ height: '1px', background: 'var(--surface-border)', marginBottom: '5rem' }} />

                {/* The Mission */}
                <section style={{ marginBottom: '6rem' }}>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Our Mission</h2>
                    <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        <p style={{ marginBottom: '1.5rem' }}>
                            In a market flooded with loan apps disguised as trackers, <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Fiinny stands apart</span>. We are not here to sell you credit. We are here to help you build wealth.
                        </p>
                        <p>
                            Born in <strong>Hyderabad</strong>, a global hub of technology, our team engineers solutions that respect your privacy and your intelligence. We believe financial data is personal infrastructure, not a commodity.
                        </p>
                    </div>
                </section>

                {/* Principles Grid */}
                <section style={{ marginBottom: '6rem' }}>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>Our Principles</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {[
                            { icon: Shield, title: "Privacy First", desc: "We practice data minimization. Your financial records are encrypted and strictly isolated. We do not monetize your behavior." },
                            { icon: Clock, title: "Long-Term Reliability", desc: "We ignore short-term trends to build durable infrastructure. This product is designed to manage your finances for decades." },
                            { icon: Zap, title: "Speed & Utility", desc: "Latency is a bug. Every interaction is engineered to be instant. We respect the limited time you have to manage your money." },
                            { icon: Globe, title: "Global Neutrality", desc: "Fiinny works in 190+ countries and supports any currency. We are not tied to a single banking system or region." }
                        ].map((p, i) => (
                            <div key={i} className="glass-panel" style={{ padding: '2rem' }}>
                                <p.icon size={32} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{p.title}</h3>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Closing */}
                <section style={{ background: 'var(--text-primary)', color: 'white', padding: '3rem', borderRadius: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>A standard of care.</h3>
                    <p style={{ color: 'hsla(0, 0%, 100%, 0.7)', marginBottom: '2rem', lineHeight: 1.5 }}>
                        We are continuously refining Fiinny to be the most reliable financial tool on the market. Thank you for trusting us with your journey.
                    </p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.6, fontFamily: 'monospace' }}>Built with care in Hyderabad.</p>
                </section>
            </main>
        </div>
    );
}
