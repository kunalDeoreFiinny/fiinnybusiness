import { motion } from 'framer-motion';
import { Package, Calculator, BarChart3, CloudOff, ShieldCheck, Zap } from 'lucide-react';

const features = [
    {
        icon: Package,
        title: "Inventory Mastery",
        desc: "Track every piece and box. Real-time stock alerts and organized cataloging for all your retail products."
    },
    {
        icon: Calculator,
        title: "Rapid POS Billing",
        desc: "Generate professional invoices in seconds. Support for digital PDF and physical thermal receipt printing."
    },
    {
        icon: BarChart3,
        title: "Sales Analytics",
        desc: "Visualize your revenue trends with beautiful charts. Understand your growth at a single glance."
    },
    {
        icon: CloudOff,
        title: "Offline Ready",
        desc: "Keep billing even without internet. Our PWA technology ensures your data stays safe and syncs when back online."
    },
    {
        icon: ShieldCheck,
        title: "Tenant Isolation",
        desc: "Your data is strictly yours. Advanced Firestore security rules ensure maximum privacy and data separation."
    },
    {
        icon: Zap,
        title: "Native Feel",
        desc: "Installable on your home screen. Fast, responsive, and smooth animations across all devices."
    }
];

export default function Features() {
    return (
        <section id="features" style={{ padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                    Stop managing <span style={{ color: 'var(--danger)' }}>chaos.</span> <br />
                    Start building <span style={{ color: 'var(--primary-light)' }}>wealth.</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
                    Everything you need to run your modern retail business, built with premium aesthetics and powerful performance.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2.5rem'
            }}>
                {features.map((f, i) => (
                    <motion.div
                        key={f.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.8 }}
                        whileHover={{ y: -10, borderColor: 'var(--primary)' }}
                        className="glass-panel"
                        style={{
                            padding: '2.5rem',
                            transition: 'all 0.3s ease',
                            border: '1px solid var(--surface-border)'
                        }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'hsla(152, 60%, 40%, 0.1)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary-light)',
                            marginBottom: '1.5rem'
                        }}>
                            <f.icon size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{f.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
