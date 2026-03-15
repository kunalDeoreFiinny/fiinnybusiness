import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }}>Terms of Service</h1>
                    <p style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Last Updated: March 06, 2026</p>
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
                            By using Fiinny, you agree to these terms. If you do not agree, do not use the service.
                        </p>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>1. Use of Service</h2>
                            <p>You are responsible for any activity that occurs under your account. You must provide accurate information when creating an account.</p>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>2. Data Maturity</h2>
                            <p>While we strive for 100% accuracy, automated categorization and sync features are provided "as-is". Always verify your financial records for official use.</p>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>3. Limitation of Liability</h2>
                            <p>Fiinny is a tool for financial management. We are not financial advisors. Your use of the data provided is at your own risk.</p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
