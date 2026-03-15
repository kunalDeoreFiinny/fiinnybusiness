import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Star, Shield } from "lucide-react";

const updates = [
    {
        version: "v2.1.0",
        date: "March 2026",
        title: "Multi-tenant Architecture",
        desc: "Introducing SaaS capabilities allowing business owners to create their own isolated instances.",
        type: "Feature",
        icon: Zap
    },
    {
        version: "v2.0.4",
        date: "February 2026",
        title: "Split Island Interface",
        desc: "Redesigned the entire landing experience for better responsiveness and premium feel.",
        type: "UI/UX",
        icon: Star
    },
    {
        version: "v2.0.0",
        date: "January 2026",
        title: "Institutional Security",
        desc: "Migrated to hardware-backed encryption keys for all stored financial data.",
        type: "Security",
        icon: Shield
    }
];

export default function ChangelogPage() {
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

            <main style={{ padding: '10rem 2rem 6rem', maxWidth: '800px', margin: '0 auto' }}>
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
                        Updates
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Changelog</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>The evolution of financial engineering.</p>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '2rem', top: 0, bottom: 0, width: '2px', background: 'var(--surface-border)', zIndex: 0 }} />

                    {updates.map((update, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            style={{ display: 'flex', gap: '3rem', position: 'relative', zIndex: 1 }}
                        >
                            <div style={{
                                width: '4rem',
                                height: '4rem',
                                background: 'white',
                                border: '2px solid var(--surface-border)',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: 'var(--glass-shadow)'
                            }}>
                                <update.icon size={24} style={{ color: 'var(--primary)' }} />
                            </div>
                            <div style={{ paddingTop: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{update.version}</span>
                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>{update.date}</span>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--surface-border)',
                                        borderRadius: '99px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: 'var(--primary)'
                                    }}>{update.type}</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{update.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem' }}>{update.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
