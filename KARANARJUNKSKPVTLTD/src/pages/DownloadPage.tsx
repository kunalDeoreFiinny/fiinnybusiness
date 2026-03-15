import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Apple, Play } from "lucide-react";

export default function DownloadPage() {
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

            <main style={{ padding: '10rem 2rem 6rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ marginBottom: '6rem' }}
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
                        Mobile App
                    </div>
                    <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Fiinny in your pocket.</h1>
                    <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', fontWeight: 500, maxWidth: '600px', margin: '0 auto' }}>
                        The full power of institutional financial engineering, optimized for your mobile workflow.
                    </p>
                </motion.div>

                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[
                        { icon: Apple, label: "App Store", soon: true },
                        { icon: Play, label: "Google Play", soon: true }
                    ].map((app, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10 }}
                            className="glass-panel"
                            style={{
                                padding: '3rem',
                                width: '320px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1.5rem',
                                position: 'relative',
                                opacity: app.soon ? 0.8 : 1
                            }}
                        >
                            <div style={{
                                width: '5rem',
                                height: '5rem',
                                background: 'var(--text-primary)',
                                color: 'white',
                                borderRadius: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <app.icon size={40} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{app.label}</h2>
                            {app.soon && (
                                <span style={{
                                    padding: '0.4rem 1rem',
                                    background: 'var(--primary-light)',
                                    color: 'white',
                                    borderRadius: '99px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700
                                }}>Coming Soon</span>
                            )}
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    style={{ marginTop: '8rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}
                >
                    <p>Current version: v2.1.0-beta</p>
                    <p style={{ marginTop: '0.5rem' }}>Requirement: iOS 16+ or Android 12+</p>
                </motion.div>
            </main>
        </div>
    );
}
