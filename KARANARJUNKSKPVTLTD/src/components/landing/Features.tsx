import { motion } from 'framer-motion';
import { Package, Calculator, BarChart3, CloudOff, ShieldCheck, FileText } from 'lucide-react';

const features = [
    {
        icon: Calculator,
        title: "3-Second Billing",
        desc: "Generate professional GST invoices faster than a calculator. Send receipts instantly via WhatsApp or print via Thermal printers."
    },
    {
        icon: Package,
        title: "Smart Inventory",
        desc: "Never run out of stock. Automatic low-stock alerts, expiry tracking, and one-click item addition with Barcode scanning."
    },
    {
        icon: FileText,
        title: "Digital Khata (Udhaar)",
        desc: "Replace your physical registers. Track customer credit (Udhaar) digitally with automated payment reminders."
    },
    {
        icon: CloudOff,
        title: "Offline Resilience",
        desc: "Business doesn't stop for the internet. Bill customers offline and your data safe-syncs automatically when you're back."
    },
    {
        icon: BarChart3,
        title: "Profit Analytics",
        desc: "See exactly how much you're making. Track margins, top-selling products, and daily growth with clean, professional charts."
    },
    {
        icon: ShieldCheck,
        title: "Enterprise Security",
        desc: "Your data is 100% private and bank-grade secure. Advanced encryption ensures your business secrets stay yours."
    }
];

export default function Features() {
    return (
        <section id="features" style={{ padding: '10rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <span style={{ color: 'var(--primary-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Powerful Features</span>
                <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginTop: '1rem', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                    Built to manage <span style={{ color: 'var(--primary-light)' }}>everything.</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.3rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
                    From the billing counter to the back-office warehouse, KaranArjun gives you the tools 
                    to scale your retail business with confidence.
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
