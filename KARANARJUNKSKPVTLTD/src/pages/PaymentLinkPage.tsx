import { useState, useEffect } from 'react';
import { getDocs, query, orderBy, addDoc, serverTimestamp, doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection } from '../utils/tenantPath';
import { Link2, Copy, CheckCircle2, Clock, IndianRupee, ExternalLink, RefreshCw, Loader2, QrCode, Send } from 'lucide-react';

interface PaymentLink {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  description: string;
  status: 'active' | 'paid' | 'expired';
  token: string;
  createdAt: any;
  paidAt?: any;
  razorpayPaymentId?: string;
  expiresAt?: any;
}

interface Invoice {
  id: string;
  invoiceNumber?: string;
  invoiceNo?: string;
  buyerName?: string;
  customerName?: string;
  totalAmount?: number;
  grandTotal?: number;
  total?: number;
  paymentStatus?: string;
  createdAt?: any;
}

export default function PaymentLinkPage() {
  const { tenantId } = useAuth();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [description, setDescription] = useState('');

  const fetchAll = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [linksSnap, invSnap] = await Promise.all([
        getDocs(query(getTenantCollection(db, tenantId, 'paymentLinks'), orderBy('createdAt', 'desc'))),
        getDocs(query(getTenantCollection(db, tenantId, 'invoices'), orderBy('createdAt', 'desc'))),
      ]);
      setLinks(linksSnap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentLink)));
      setInvoices(invSnap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)).filter(i => i.paymentStatus !== 'Paid'));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [tenantId]);

  const generateToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

  const handleCreate = async () => {
    if (!tenantId || !selectedInvoice) return;
    const inv = invoices.find(i => i.id === selectedInvoice);
    if (!inv) return;
    setCreating(true);
    try {
      const token = generateToken();
      const amount = customAmount ? Number(customAmount) : (inv.totalAmount || inv.grandTotal || inv.total || 0);
      await addDoc(getTenantCollection(db, tenantId, 'paymentLinks'), {
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber || inv.invoiceNo || 'INV',
        customerName: inv.buyerName || inv.customerName || 'Customer',
        amount,
        description: description || `Payment for ${inv.invoiceNumber || inv.invoiceNo || 'Invoice'}`,
        status: 'active',
        token,
        tenantId,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      // ✅ Mirror to public top-level collection so /pay/:token works without auth
      await setDoc(doc(collection(db, 'paymentLinks_public'), token), {
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber || inv.invoiceNo || 'INV',
        customerName: inv.buyerName || inv.customerName || 'Customer',
        amount,
        description: description || `Payment for ${inv.invoiceNumber || inv.invoiceNo || 'Invoice'}`,
        status: 'active',
        token,
        tenantId,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      setShowCreate(false);
      setSelectedInvoice('');
      setCustomAmount('');
      setDescription('');
      fetchAll();
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  const getPaymentUrl = (token: string) =>
    `${window.location.origin}/pay/${token}`;

  const copyLink = async (token: string, id: string) => {
    await navigator.clipboard.writeText(getPaymentUrl(token));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendWhatsApp = (link: PaymentLink) => {
    const msg = encodeURIComponent(
      `Hi ${link.customerName},\n\nYour payment of ₹${link.amount.toLocaleString('en-IN')} is due for ${link.description}.\n\nPay securely here 👇\n${getPaymentUrl(link.token)}\n\nThis link is valid for 7 days.`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const totalCollected = links.filter(l => l.status === 'paid').reduce((s, l) => s + l.amount, 0);
  const totalPending = links.filter(l => l.status === 'active').reduce((s, l) => s + l.amount, 0);

  const card = { background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '14px', padding: '1.5rem' };

  const statusColor = { active: '#f59e0b', paid: '#10b981', expired: '#6b7280' };
  const statusBg = { active: 'hsla(38,92%,50%,0.1)', paid: 'hsla(152,60%,40%,0.1)', expired: 'hsla(0,0%,50%,0.1)' };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="primary-gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link2 size={32} /> Payment Links
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Generate payment links for invoices and collect online via Razorpay
          </p>
        </div>
        <button
          onClick={() => setShowCreate(f => !f)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--primary-light)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, font: 'inherit' }}
        >
          <Link2 size={17} /> Generate Payment Link
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Links', value: links.length, color: '#6366f1', icon: <QrCode size={18} /> },
          { label: 'Active Links', value: links.filter(l => l.status === 'active').length, color: '#f59e0b', icon: <Clock size={18} /> },
          { label: 'Amount Collected', value: `₹${totalCollected.toLocaleString('en-IN')}`, color: '#10b981', icon: <IndianRupee size={18} /> },
          { label: 'Pending Amount', value: `₹${totalPending.toLocaleString('en-IN')}`, color: '#f59e0b', icon: <RefreshCw size={18} /> },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '1.25rem', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: s.color, marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.icon}{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div style={{ ...card, marginBottom: '1.5rem', border: '2px dashed var(--primary-light)' }}>
          <h3 style={{ marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link2 size={18} /> Generate New Payment Link
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="input-group" style={{ gridColumn: 'span 3' }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Select Invoice *</label>
              <select
                className="input-field"
                style={{ margin: 0 }}
                value={selectedInvoice}
                onChange={e => {
                  setSelectedInvoice(e.target.value);
                  const inv = invoices.find(i => i.id === e.target.value);
                  if (inv) {
                    setCustomAmount(String(inv.totalAmount || inv.grandTotal || inv.total || ''));
                    setDescription(`Payment for ${inv.invoiceNumber || inv.invoiceNo || 'Invoice'}`);
                  }
                }}
              >
                <option value="">-- Select an unpaid invoice --</option>
                {invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber || inv.invoiceNo || inv.id.slice(0, 8)} — {inv.buyerName || inv.customerName} — ₹{(inv.totalAmount || inv.grandTotal || inv.total || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Amount (₹)</label>
              <input className="input-field" style={{ margin: 0 }} type="number" placeholder="Auto-filled from invoice" value={customAmount} onChange={e => setCustomAmount(e.target.value)} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Description</label>
              <input className="input-field" style={{ margin: 0 }} placeholder="Payment for Invoice #..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCreate(false)} style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid var(--surface-border)', borderRadius: '10px', cursor: 'pointer', font: 'inherit', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !selectedInvoice}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.75rem', background: 'var(--primary-light)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, font: 'inherit', opacity: !selectedInvoice ? 0.5 : 1 }}
            >
              {creating ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              Generate Link
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={36} style={{ margin: '0 auto' }} /></div>
      ) : links.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '4rem' }}>
          <Link2 size={52} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3>No Payment Links Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Generate your first payment link from an unpaid invoice</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {links.map(link => (
            <div key={link.id} style={{ ...card, padding: '1.2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>{link.customerName}</span>
                  <span style={{ fontWeight: 700, color: '#6366f1' }}>₹{link.amount.toLocaleString('en-IN')}</span>
                  <span style={{ padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: statusBg[link.status], color: statusColor[link.status], textTransform: 'uppercase' }}>
                    {link.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span>📄 {link.invoiceNumber}</span>
                  <span>{link.description}</span>
                  <span>🕒 {link.createdAt?.toDate?.().toLocaleDateString('en-IN') || '—'}</span>
                  {link.status === 'paid' && link.paidAt && <span style={{ color: '#10b981' }}>✅ Paid on {link.paidAt?.toDate?.().toLocaleDateString('en-IN')}</span>}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', fontFamily: 'monospace', background: 'var(--surface-base)', padding: '0.3rem 0.6rem', borderRadius: '6px', display: 'inline-block' }}>
                  {getPaymentUrl(link.token)}
                </div>
              </div>
              {link.status === 'active' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => copyLink(link.token, link.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: copiedId === link.id ? '#10b981' : 'var(--surface-base)', border: '1px solid var(--surface-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, font: 'inherit', fontSize: '0.82rem', color: copiedId === link.id ? '#fff' : 'var(--text-primary)', whiteSpace: 'nowrap' }}
                  >
                    {copiedId === link.id ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                  </button>
                  <button
                    onClick={() => sendWhatsApp(link)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, font: 'inherit', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                  >
                    <Send size={14} /> WhatsApp
                  </button>
                  <a
                    href={getPaymentUrl(link.token)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--surface-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, font: 'inherit', fontSize: '0.82rem', color: 'var(--text-secondary)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    <ExternalLink size={14} /> Preview
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
