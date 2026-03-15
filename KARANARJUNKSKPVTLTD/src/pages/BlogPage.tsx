import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, User } from "lucide-react";

const blogPosts = [
    {
        title: "The Hyderabad Tech Scene and Financial Engineering",
        date: "March 01, 2026",
        author: "Arjun Tanpure",
        excerpt: "Exploring how the local engineering ecosystem is shaping the future of global financial tools."
    },
    {
        title: "Why Privacy is Our Only Metric",
        date: "February 15, 2026",
        author: "Fiinny Team",
        excerpt: "In a world of data monetization, we've chosen a different path: complete isolation and encryption."
    }
];

export default function BlogPage() {
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
                        Journal
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>The Fiinny Blog</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Thoughts on engineering, privacy, and wealth.</p>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {blogPosts.map((post, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            className="glass-panel"
                            style={{ padding: '2.5rem', cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {post.date}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} /> {post.author}</span>
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>{post.title}</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '1.5rem' }}>{post.excerpt}</p>
                            <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                Read More <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                            </span>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
