import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
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

            <div style={{ padding: '10rem 2rem 6rem', maxWidth: '800px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
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
                        Legal
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }}>Privacy Policy</h1>
                    <p style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Last Updated: September 11, 2025</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="glass-panel"
                    style={{ padding: '3rem' }}
                >
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '2rem' }}>
                            Fiinny (“we”, “our”, “the App”) helps you track personal finances. We respect your privacy and explain here what we collect, why, and how you control it.
                        </p>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ width: '2rem', height: '2rem', background: 'var(--primary-light)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>1</span>
                                Information we collect
                            </h2>
                            <ul style={{ paddingLeft: '2rem', listStyleType: 'disc' }}>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Account & profile (optional):</strong> phone/email, display name.</li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Financial data you add:</strong> expenses, income, assets, goals, notes.</li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Device & diagnostics:</strong> model, OS version, app version, crash logs.</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ width: '2rem', height: '2rem', background: 'var(--primary-light)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>2</span>
                                How we use data
                            </h2>
                            <ul style={{ paddingLeft: '2rem', listStyleType: 'disc' }}>
                                <li style={{ marginBottom: '0.5rem' }}>Create and categorize transactions, show insights.</li>
                                <li style={{ marginBottom: '0.5rem' }}>Sync your data to your account if signed in.</li>
                                <li style={{ marginBottom: '0.5rem' }}>Improve reliability and security.</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ width: '2rem', height: '2rem', background: 'var(--primary-light)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>3</span>
                                Data storage & sharing
                            </h2>
                            <p>We do not sell your data. We use industry-standard encryption for data in transit and at rest. Your financial records are strictly isolated and private by design.</p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
