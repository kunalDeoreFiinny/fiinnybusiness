import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Ramesh Sharma',
        business: 'Sharma General Store',
        location: 'Nagpur, Maharashtra',
        type: 'Kirana / General Store',
        avatar: '🛒',
        stars: 5,
        text: 'Pehle sab kuch diary mein likhte the. Ab Fiinny se GST invoice 30 second mein ban jaata hai. Stock bhi track hota hai. Bilkul seedha aur asaan hai!',
    },
    {
        name: 'Dr. Anjali Mehta',
        business: 'Mehta Medical & Pharmacy',
        location: 'Connaught Place, Delhi',
        type: 'Medical / Pharmacy',
        avatar: '💊',
        stars: 5,
        text: 'Our billing was completely manual before Fiinny. Now we issue GST receipts, track medicines stock, and get daily revenue reports — all in one place. Best decision for our clinic.',
    },
    {
        name: 'Suresh Patel',
        business: 'Patel Garments & Fabrics',
        location: 'Surat, Gujarat',
        type: 'Garments / Clothing',
        avatar: '👗',
        stars: 5,
        text: 'Surat mein competition bohot hai. Fiinny se hamare B2B invoices aur retailer ka hisaab bilkul clear rehta hai. Payment link WhatsApp pe bhejo aur paise aa jaate hain!',
    },
];

export default function Testimonials() {
    return (
        <section
            id="testimonials"
            style={{ padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <span style={{
                    background: 'hsla(152, 60%, 40%, 0.15)',
                    color: 'var(--primary-light)',
                    padding: '0.4rem 1rem',
                    borderRadius: '99px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'inline-block',
                    border: '1px solid hsla(152, 60%, 40%, 0.3)',
                    marginBottom: '1.5rem',
                }}>
                    Real Businesses, Real Results
                </span>
                <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
                    Trusted by retailers{' '}
                    <span style={{ color: 'var(--primary-light)' }}>across India</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    From kirana shops in Nagpur to garment wholesalers in Surat — Fiinny Business works for every kind of Indian shop.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
            }}>
                {testimonials.map((t, i) => (
                    <motion.div
                        key={t.name}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15, duration: 0.7 }}
                        className="glass-panel"
                        style={{
                            padding: '2rem',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Quote mark */}
                        <span style={{
                            position: 'absolute', top: '1rem', right: '1.5rem',
                            fontSize: '5rem', lineHeight: 1, color: 'hsla(152, 60%, 40%, 0.1)',
                            fontFamily: 'Georgia, serif', fontWeight: 900,
                        }}>"</span>

                        {/* Stars */}
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {Array.from({ length: t.stars }).map((_, j) => (
                                <Star key={j} size={16} fill="var(--secondary-dark)" color="var(--secondary-dark)" />
                            ))}
                        </div>

                        {/* Quote */}
                        <p style={{
                            color: 'var(--text-secondary)',
                            lineHeight: 1.7,
                            fontSize: '0.95rem',
                            fontStyle: 'italic',
                            flex: 1,
                        }}>
                            "{t.text}"
                        </p>

                        {/* Reviewer */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                            <div style={{
                                width: '48px', height: '48px',
                                background: 'hsla(152, 60%, 40%, 0.1)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem',
                            }}>
                                {t.avatar}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</div>
                                <div style={{ color: 'var(--primary-light)', fontSize: '0.8rem', fontWeight: 600 }}>{t.business}</div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{t.location}</div>
                            </div>
                            <div style={{
                                marginLeft: 'auto',
                                background: 'hsla(152, 60%, 40%, 0.12)',
                                color: 'var(--primary-light)',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                            }}>
                                {t.type}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
