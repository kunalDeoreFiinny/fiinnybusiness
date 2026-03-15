import { motion } from 'framer-motion';
import { Instagram, Linkedin, Twitter, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = [
    {
        title: "PRODUCT",
        links: [
            { name: "Features", path: "/#features" },
            { name: "Pricing", path: "/pricing" },
            { name: "Download", path: "/download" },
            { name: "Changelog", path: "/changelog" }
        ]
    },
    {
        title: "COMPANY",
        links: [
            { name: "About", path: "/about" },
            { name: "Blog", path: "/blog" },
            { name: "Privacy", path: "/privacy" },
            { name: "Terms Page", path: "/terms" }
        ]
    }
];

export default function Footer() {
    return (
        <footer style={{
            padding: '8rem 2rem 4rem',
            borderTop: '1px solid var(--surface-border)',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '4rem',
                marginBottom: '6rem'
            }}>
                <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <img src="/logo.png" alt="Fiinny Logo" style={{ width: '40px', height: '40px' }} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
                            Fiinny <span style={{ color: 'var(--primary-light)' }}>KaranArjun</span>
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-tertiary)', maxWidth: '400px', lineHeight: 1.6, marginBottom: '2rem' }}>
                        The smart, simple way to track inventory, manage sales, and reach your financial goals. Built with privacy and scale at its core.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {[Instagram, Linkedin, Twitter, Github].map((Icon, i) => (
                            <motion.a
                                key={i}
                                href="#"
                                whileHover={{ y: -5, color: 'var(--primary-light)' }}
                                style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }}
                            >
                                <Icon size={24} />
                            </motion.a>
                        ))}
                    </div>
                </div>

                {footerLinks.map((column) => (
                    <div key={column.title}>
                        <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            letterSpacing: '0.05em',
                            marginBottom: '2rem'
                        }}>
                            {column.title}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {column.links.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    style={{
                                        color: 'var(--text-tertiary)',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary-light)')}
                                    onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                paddingTop: '3rem',
                borderTop: '1px solid hsla(220, 20%, 40%, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.875rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <p>&copy; 2026 Fiinny Inc. All rights reserved.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                    All Systems Operational
                </div>
            </div>
        </footer>
    );
}
