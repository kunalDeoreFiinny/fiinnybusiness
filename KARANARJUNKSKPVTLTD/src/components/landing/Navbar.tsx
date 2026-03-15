import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
    const { currentUser } = useAuth();

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            style={{
                position: 'fixed',
                top: '1.5rem',
                left: 0,
                right: 0,
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 2rem',
                pointerEvents: 'none'
            }}
        >
            {/* Left Island: Brand */}
            <div style={{
                pointerEvents: 'auto',
                background: 'hsla(0, 0%, 100%, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--surface-border)',
                borderRadius: '999px',
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: 'var(--glass-shadow)',
                cursor: 'pointer'
            }}>
                <img src="/logo.png" alt="Fiinny Logo" style={{ width: '32px', height: '32px' }} />
                <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                    Fiinny <span style={{ color: 'var(--primary)' }}>KaranArjun</span>
                </span>
            </div>

            {/* Right Island: Navigation & Actions */}
            <div style={{
                pointerEvents: 'auto',
                background: 'hsla(0, 0%, 100%, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--surface-border)',
                borderRadius: '999px',
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                boxShadow: 'var(--glass-shadow)'
            }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="nav-links-desktop">
                    {['Features', 'Pricing', 'Trust & Safety'].map((item) => (
                        <motion.a
                            key={item}
                            href={`#${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                            whileHover={{ color: 'var(--primary)' }}
                            style={{
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                transition: 'color 0.2s'
                            }}
                        >
                            {item}
                        </motion.a>
                    ))}
                </div>

                <Link to={currentUser ? "/dashboard" : "/login"} style={{ textDecoration: 'none' }}>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: 'var(--neon-glow)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1.25rem',
                            borderRadius: '99px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        {currentUser ? 'Console' : 'Get Started'}
                    </motion.button>
                </Link>
            </div>
        </motion.nav>
    );
}
