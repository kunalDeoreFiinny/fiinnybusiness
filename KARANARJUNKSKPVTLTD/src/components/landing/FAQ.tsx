import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        q: 'Is Fiinny Business free to use?',
        a: 'Yes! Fiinny Business is completely free during our Early Adopter Program. You get full access to GST invoicing, inventory management, POS billing, payment links, analytics, and the AI advisor — all at no cost. We believe every Indian retailer deserves access to powerful business tools.',
    },
    {
        q: 'Can I use it from anywhere in India — Kashmir, Northeast, rural areas?',
        a: 'Absolutely! Fiinny Business is a web-based platform that works on any device with a browser — phone, tablet, or laptop. Whether you\'re in Kashmir, Kanyakumari, Assam, or a small town in Rajasthan, as long as you have internet, you can run your business. It also has offline support via PWA technology for areas with spotty connectivity.',
    },
    {
        q: 'Does it support GST invoices?',
        a: 'Yes, fully! You can generate professional GST-compliant invoices with GSTIN, HSN codes, CGST/SGST/IGST breakdowns, and business logo. Invoices can be downloaded as PDF or sent directly via WhatsApp. GST reports like GSTR-1 summary are also available in the Reports section.',
    },
    {
        q: 'Is my business data private and secure?',
        a: 'Your data is 100% private. Each business gets a completely isolated workspace (we call it a "tenant") — meaning no other user, admin, or entity can ever see your data. We use Google Firestore with strict security rules and row-level isolation. Your competitor\'s data and yours will never mix.',
    },
    {
        q: 'How is Fiinny different from Tally, Vyapar, or Busy?',
        a: 'Tally costs ₹18,000+/year and requires a Windows desktop + CA knowledge. Vyapar is Android-only with limited B2B features. Busy/Marg is designed for accountants, not shop owners. Fiinny Business is free, works on any browser, handles both B2B and B2C billing, has an AI advisor, and is built for the modern Indian retailer — not a 1990s accountant.',
    },
    {
        q: 'Can my customers pay online via UPI or card?',
        a: 'Yes! You can generate payment links from any invoice and share them via WhatsApp instantly. Customers can pay via UPI, debit card, credit card, or net banking — powered by Razorpay. Once paid, the invoice is automatically marked as paid in your dashboard.',
    },
    {
        q: 'Does it work in Hindi or regional languages?',
        a: 'We currently support English and Hindi interfaces, with more Indian languages coming soon. The app is designed with Indian business workflows in mind — including Indian number formatting (lakhs, crores), ₹ currency, and GST-specific features.',
    },
    {
        q: 'Can I print invoices and thermal receipts?',
        a: 'Yes! You can generate professional PDF invoices from any browser. For thermal receipt printing, the POS billing module supports standard 58mm and 80mm thermal printers. You can also customize the invoice with your business logo, address, and branding.',
    },
    {
        q: 'Can I add staff or employees to my account?',
        a: 'Yes. As the owner (Admin), you can invite staff members with specific roles — Analyst (can view and bill) or custom roles via the Role Matrix. You control exactly what each team member can see and do. Great for managing cashiers, sales staff, or accountants.',
    },
    {
        q: 'What happens to my data if I stop using Fiinny?',
        a: 'Your data remains safe in your Firestore workspace. You can export all your invoices, customers, inventory, and reports as CSV or PDF at any time. We believe your data belongs to you — always. There are no lock-ins.',
    },
];

export default function FAQ() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section
            id="faq"
            style={{ padding: '8rem 2rem', maxWidth: '860px', margin: '0 auto' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
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
                    Common Questions
                </span>
                <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
                    Frequently Asked{' '}
                    <span style={{ color: 'var(--primary-light)' }}>Questions</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Everything a small business owner in India needs to know before getting started.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {faqs.map((faq, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="glass-panel"
                        style={{
                            border: `1px solid ${open === i ? 'var(--primary-light)' : 'var(--surface-border)'}`,
                            borderRadius: '14px',
                            overflow: 'hidden',
                            transition: 'border-color 0.3s',
                        }}
                    >
                        <button
                            onClick={() => setOpen(open === i ? null : i)}
                            style={{
                                width: '100%',
                                padding: '1.25rem 1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                font: 'inherit',
                                textAlign: 'left',
                                color: 'var(--text-primary)',
                                fontWeight: open === i ? 700 : 600,
                                fontSize: '1rem',
                            }}
                        >
                            <span>{faq.q}</span>
                            <ChevronDown
                                size={20}
                                style={{
                                    color: 'var(--primary-light)',
                                    transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s',
                                    flexShrink: 0,
                                }}
                            />
                        </button>

                        <AnimatePresence>
                            {open === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <p style={{
                                        padding: '0 1.5rem 1.25rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.7,
                                        fontSize: '0.95rem',
                                        borderTop: '1px solid var(--surface-border)',
                                        paddingTop: '1rem',
                                        margin: 0,
                                    }}>
                                        {faq.a}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
