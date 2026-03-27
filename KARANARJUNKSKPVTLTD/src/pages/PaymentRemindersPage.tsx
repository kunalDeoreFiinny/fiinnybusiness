import { useState, useEffect, useMemo } from 'react';
import { getDocs, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { fmtINR } from '../utils/gstCalculator';
import { Bell, Send, CheckCircle2, Clock, AlertTriangle, Loader2, RefreshCw, MessageSquare } from 'lucide-react';

interface Invoice {
  id: string; orderNumber: string; invoiceDate: string; retailerName: string;
  buyerContact: string; netAmount: number; status: string;
  modeOfPayment?: string; retailerId?: string;
}

function daysDiff(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000*60*60*24));
}

function dueDaysLabel(days: number): { label: string; color: string; icon: React.ReactNode } {
  if (days < 0) return { label: `Due in ${Math.abs(days)}d`, color:'#10b981', icon:<Clock size={14}/> };
  if (days === 0) return { label:'Due Today', color:'#f59e0b', icon:<AlertTriangle size={14}/> };
  if (days <= 7) return { label:`${days}d overdue`, color:'#f59e0b', icon:<AlertTriangle size={14}/> };
  return { label:`${days}d overdue`, color:'#ef4444', icon:<AlertTriangle size={14}/> };
}

function buildWhatsAppMsg(inv: Invoice, businessName: string): string {
  const days = daysDiff(inv.invoiceDate);
  return encodeURIComponent(
    `Dear ${inv.retailerName},\n\n` +
    `This is a payment reminder from *${businessName}*.\n\n` +
    `📋 Invoice: *${inv.orderNumber}*\n` +
    `📅 Invoice Date: ${inv.invoiceDate}\n` +
    `💰 Amount: *₹${fmtINR(inv.netAmount)}*\n` +
    (days > 0 ? `⚠️ Overdue by *${days} days*\n\n` : `\n`) +
    `Please process the payment at your earliest convenience.\n\n` +
    `For any queries, please contact us.\n\nThank you! 🙏`
  );
}

export default function PaymentRemindersPage() {
  const { tenantId, tenantData } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [remindedSet, setRemindedSet] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all'|'overdue'|'week'>('overdue');

  const businessName = (tenantData as any)?.businessName || 'Your Business Name';

  const fetchInvoices = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(getTenantCollection(db, tenantId, 'salesOrders'), orderBy('createdAt','desc')));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data(), netAmount: Number((d.data() as any).netAmount) || 0 } as Invoice));
      // Only pending/credit invoices
      setInvoices(all.filter(o => o.status !== 'paid' && o.modeOfPayment !== 'Cash'));
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, [tenantId]);

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const days = daysDiff(inv.invoiceDate);
      if (filter === 'overdue') return days > 0;
      if (filter === 'week') return days > 7;
      return true;
    }).sort((a,b) => daysDiff(b.invoiceDate) - daysDiff(a.invoiceDate));
  }, [invoices, filter]);

  const totalOutstanding = filtered.reduce((s, inv) => s + (Number(inv.netAmount) || 0), 0);
  const overdueCount = invoices.filter(inv=>daysDiff(inv.invoiceDate)>0).length;
  const highRisk = invoices.filter(inv=>daysDiff(inv.invoiceDate)>30).length;

  const sendReminder = (inv: Invoice) => {
    const num = (inv.buyerContact||'').replace(/\D/g,'');
    if (!num || num.length < 10) { alert('No valid contact number for this customer.'); return; }
    const msg = buildWhatsAppMsg(inv, businessName);
    window.open(`https://wa.me/91${num}?text=${msg}`, '_blank');
    setRemindedSet(prev => new Set([...prev, inv.id]));
  };

  const sendBulkReminders = () => {
    const overdue = filtered.filter(inv=>daysDiff(inv.invoiceDate)>0 && inv.buyerContact);
    if (overdue.length === 0) { alert('No overdue invoices with contact numbers.'); return; }
    // Open first one, user can click for others
    const inv = overdue[0];
    const num = (inv.buyerContact||'').replace(/\D/g,'');
    const msg = buildWhatsAppMsg(inv, businessName);
    window.open(`https://wa.me/91${num}?text=${msg}`, '_blank');
    setRemindedSet(prev => new Set([...prev, ...overdue.map(i=>i.id)]));
  };

  const markPaid = async (inv: Invoice) => {
    if (!tenantId) return;
    await updateDoc(getTenantDoc(db, tenantId, 'salesOrders', inv.id) as any, { status:'paid' });
    fetchInvoices();
  };

  const card = { background:'var(--surface-raised)', border:'1px solid var(--surface-border)', borderRadius:'14px', padding:'1.5rem' };
  const filterBtn = (f: typeof filter) => ({
    padding:'0.5rem 1.25rem', borderRadius:'8px', border:'1px solid var(--surface-border)',
    cursor:'pointer' as const, fontWeight:filter===f?700:400, font:'inherit', fontSize:'0.88rem',
    background:filter===f?'var(--primary-light)':'transparent',
    color:filter===f?'#fff':'var(--text-secondary)',
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth:'1050px', margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 className="primary-gradient-text" style={{ fontSize:'2rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <Bell size={32}/> Payment Reminders
          </h1>
          <p style={{ color:'var(--text-secondary)', marginTop:'0.25rem' }}>Track overdue payments and send WhatsApp reminders instantly</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button onClick={fetchInvoices} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1rem', background:'transparent', border:'1px solid var(--surface-border)', borderRadius:'10px', cursor:'pointer', color:'var(--text-secondary)', font:'inherit' }}>
            <RefreshCw size={16}/> Refresh
          </button>
          <button onClick={sendBulkReminders} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.25rem', background:'#25D366', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:700, font:'inherit' }}>
            <Send size={16}/> Remind All Overdue
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(175px, 1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Total Pending Invoices', value:invoices.length, color:'#6366f1', icon:<Bell size={18}/> },
          { label:'Overdue', value:overdueCount, color:'#f59e0b', icon:<AlertTriangle size={18}/> },
          { label:'30+ Days Overdue', value:highRisk, color:'#ef4444', icon:<AlertTriangle size={18}/> },
          { label:'Outstanding Amount', value:`₹${fmtINR(totalOutstanding)}`, color:'#ef4444', icon:<CheckCircle2 size={18}/> },
        ].map(s=>(
          <div key={s.label} style={{ background:'var(--surface-raised)', border:'1px solid var(--surface-border)', borderLeft:`4px solid ${s.color}`, borderRadius:'14px', padding:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:s.color, marginBottom:'0.4rem', fontSize:'0.78rem', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.05em' }}>{s.icon}{s.label}</div>
            <div style={{ fontSize:'1.3rem', fontWeight:800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        <button style={filterBtn('all')} onClick={()=>setFilter('all')}>All Pending ({invoices.length})</button>
        <button style={filterBtn('overdue')} onClick={()=>setFilter('overdue')}>Overdue ({overdueCount})</button>
        <button style={filterBtn('week')} onClick={()=>setFilter('week')}>7+ Days Overdue ({invoices.filter(i=>daysDiff(i.invoiceDate)>7).length})</button>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-secondary)' }}><Loader2 className="animate-spin" size={36} style={{ margin:'0 auto' }}/></div>
      ) : filtered.length===0 ? (
        <div style={{ ...card, textAlign:'center', padding:'4rem' }}>
          <CheckCircle2 size={52} style={{ color:'#10b981', margin:'0 auto 1rem', opacity:0.6 }}/>
          <h3>All Clear! 🎉</h3>
          <p style={{ color:'var(--text-secondary)', marginTop:'0.5rem' }}>No overdue invoices in this view</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {filtered.map(inv=>{
            const days = daysDiff(inv.invoiceDate);
            const due = dueDaysLabel(days);
            const reminded = remindedSet.has(inv.id);
            return (
              <div key={inv.id} style={{ ...card, padding:'1.25rem', display:'grid', gridTemplateColumns:'1fr auto', gap:'1rem', alignItems:'center', borderLeft:`4px solid ${due.color}` }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.35rem', flexWrap:'wrap' }}>
                    <span style={{ fontWeight:800, color:'var(--primary-light)' }}>{inv.orderNumber}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.15rem 0.6rem', borderRadius:'999px', background:`${due.color}20`, color:due.color, fontSize:'0.76rem', fontWeight:700 }}>
                      {due.icon}{due.label}
                    </span>
                    {reminded && <span style={{ fontSize:'0.75rem', color:'#25D366', fontWeight:700 }}>✓ Reminded</span>}
                  </div>
                  <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:'0.2rem' }}>{inv.retailerName}</div>
                  <div style={{ fontSize:'0.83rem', color:'var(--text-secondary)' }}>
                    {inv.buyerContact && <span>📞 {inv.buyerContact}</span>}
                    <span style={{ marginLeft:'0.75rem' }}>📅 Invoice: {inv.invoiceDate}</span>
                    {inv.modeOfPayment && <span style={{ marginLeft:'0.75rem' }}>💳 {inv.modeOfPayment}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', alignItems:'flex-end' }}>
                  <div style={{ fontSize:'1.35rem', fontWeight:900, color:due.color }}>₹{fmtINR(inv.netAmount)}</div>
                  <div style={{ display:'flex', gap:'0.4rem' }}>
                    <button
                      onClick={()=>sendReminder(inv)}
                      disabled={!inv.buyerContact}
                      style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.5rem 0.9rem', background:inv.buyerContact?'#25D366':'var(--surface-border)', color:'#fff', border:'none', borderRadius:'8px', cursor:inv.buyerContact?'pointer':'not-allowed', fontWeight:700, font:'inherit', fontSize:'0.82rem' }}
                      title={!inv.buyerContact?'No contact number':'Send WhatsApp reminder'}
                    >
                      <MessageSquare size={14}/> Remind
                    </button>
                    <button
                      onClick={()=>markPaid(inv)}
                      style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.5rem 0.9rem', background:'#10b981', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:700, font:'inherit', fontSize:'0.82rem' }}
                    >
                      <CheckCircle2 size={14}/> Paid
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WhatsApp tip */}
      <div style={{ marginTop:'1.5rem', padding:'1rem', background:'hsla(134,61%,41%,0.08)', borderRadius:'10px', border:'1px solid hsla(134,61%,41%,0.2)', fontSize:'0.85rem', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:'0.75rem' }}>
        <MessageSquare size={18} style={{ color:'#25D366', flexShrink:0 }}/>
        <span><strong>Tip:</strong> WhatsApp reminders open directly with a pre-filled message. Your customer just needs to receive it. Add contact numbers in Retailer Management for bulk reminders.</span>
      </div>
    </div>
  );
}
