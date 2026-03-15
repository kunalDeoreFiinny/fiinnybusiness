import { motion } from 'framer-motion';
import { UserPlus, ClipboardCheck, Zap } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        title: "1. Rapid Onboarding",
        desc: "Create your tenant account in seconds. Add your business details and pick your preferred language."
    },
    {
        icon: ClipboardCheck,
        title: "2. Organize Inventory",
        desc: "Upload your product catalog. Set specific Piece and Box pricing for maximum profit margins."
    },
    {
        icon: Zap,
        title: "3. Start Billing",
        desc: "Use the rapid POS to serve customers. Generate digital or physical receipts instantly."
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" style={{ padding: '8rem 2rem', background: 'hsla(220, 20%, 10%, 0.5)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                        Managing money <br />
                        <span style={{ color: 'var(--primary-light)' }}>shouldn't feel like work.</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Fiinny KaranArjun removes the clutter. We built a system that fits naturally into your life, not the other way around. Same powerful tools, just effortless.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4rem', position: 'relative' }}>
                    {/* Connecting line */}
                    <div style={{
                        position: 'absolute',
                        top: '40px',
                        left: '10%',
                        right: '10%',
                        height: '2px',
                        background: 'linear-gradient(to right, transparent, var(--surface-border), transparent)',
                        zIndex: 0
                    }} />

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 0.8 }}
                            style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'var(--surface-raised)',
                                border: '2px solid var(--primary)',
                                borderRadius: '99px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary-light)',
                                margin: '0 auto 2rem',
                                boxShadow: 'var(--neon-glow)'
                            }}>
                                <step.icon size={40} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{step.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
