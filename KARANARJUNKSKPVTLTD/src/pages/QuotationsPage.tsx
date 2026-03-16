import { useState, useEffect } from 'react';
import { addDoc, getDocs, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { fmtINR } from '../utils/gstCalculator';
import { FileText, Plus, CheckCircle2, Clock, XCircle, Send, ArrowRight, Trash2, Loader2 } from 'lucide-react';


interface QuoteLine { description: string; quantity: number; rate: number; gstPct: number; amount: number; }
interface Quotation {
  id: string; quoteNumber: string; quotedDate: string; validUntil: string;
  buyerName: string; buyerContact: string; buyerGstin: string; buyerAddress: string;
  lines: QuoteLine[]; totalAmount: number; notes: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  convertedInvoiceId?: string; createdAt?: any;
}

const STATUS_CONFIG = {
  draft:     { label:'Draft',     color:'#6366f1', bg:'hsla(238,83%,67%,0.1)', icon:<Clock size={14}/> },
  sent:      { label:'Sent',      color:'#3b82f6', bg:'hsla(217,91%,60%,0.1)', icon:<Send size={14}/> },
  accepted:  { label:'Accepted',  color:'#10b981', bg:'hsla(160,84%,39%,0.1)', icon:<CheckCircle2 size={14}/> },
  rejected:  { label:'Rejected',  color:'#ef4444', bg:'hsla(0,84%,60%,0.1)',   icon:<XCircle size={14}/> },
  expired:   { label:'Expired',   color:'#9ca3af', bg:'hsla(220,9%,65%,0.1)',  icon:<Clock size={14}/> },
  converted: { label:'Converted', color:'#f59e0b', bg:'hsla(38,92%,50%,0.1)',  icon:<ArrowRight size={14}/> },
};

const EMPTY_LINE = (): QuoteLine => ({ description: '', quantity: 1, rate: 0, gstPct: 5, amount: 0 });
const TODAY = () => new Date().toISOString().split('T')[0];
const PLUS30 = () => { const d = new Date(); d.setDate(d.getDate()+30); return d.toISOString().split('T')[0]; };

export default function QuotationsPage() {
  const { tenantId } = useAuth();
  const [view, setView] = useState<'list'|'new'>('list');
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState<string|null>(null);
  const [form, setForm] = useState({ buyerName:'', buyerContact:'', buyerGstin:'', buyerAddress:'', validUntil:PLUS30(), notes:'' });
  const [lines, setLines] = useState<QuoteLine[]>([EMPTY_LINE()]);

  const fetchQuotations = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(getTenantCollection(db, tenantId, 'quotations'), orderBy('createdAt','desc')));
      setQuotations(snap.docs.map(d=>({ id:d.id, ...d.data() } as Quotation)));
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchQuotations(); }, [tenantId]);

  const recalcLine = (l: QuoteLine): QuoteLine => ({ ...l, amount: l.quantity * l.rate * (1 + l.gstPct/100) });
  const totals = lines.reduce((s,l) => s + l.amount, 0);

  const handleSaveQuote = async (status: 'draft'|'sent') => {
    if (!tenantId || !form.buyerName) return;
    setSaving(true);
    try {
      const now = new Date(); const y = now.getFullYear();
      const snap = await getDocs(getTenantCollection(db, tenantId, 'quotations'));
      const seq = snap.size + 1;
      await addDoc(getTenantCollection(db, tenantId, 'quotations'), {
        quoteNumber: `QUO/${y.toString().slice(-2)}-${(y+1).toString().slice(-2)}/${String(seq).padStart(3,'0')}`,
        quotedDate: TODAY(), validUntil: form.validUntil,
        buyerName: form.buyerName, buyerContact: form.buyerContact,
        buyerGstin: form.buyerGstin, buyerAddress: form.buyerAddress,
        lines: lines.filter(l=>l.description||l.rate), totalAmount: totals,
        notes: form.notes, status, createdAt: serverTimestamp(),
      });
      setView('list'); fetchQuotations();
      setForm({ buyerName:'', buyerContact:'', buyerGstin:'', buyerAddress:'', validUntil:PLUS30(), notes:'' });
      setLines([EMPTY_LINE()]);
    } catch(e) { console.error(e); } finally { setSaving(false); }
  };

  const convertToInvoice = async (q: Quotation) => {
    if (!tenantId) return;
    setConverting(q.id);
    try {
      // Generate invoice number
      const counterRef = getTenantDoc(db, tenantId, 'counters', 'b2bInvoiceCounter');
      const { runTransaction } = await import('firebase/firestore');
      let seq = 1;
      await runTransaction(db, async tx => {
        const snap = await tx.get(counterRef);
        seq = snap.exists() ? (snap.data().lastInvoiceNumber||0)+1 : 1;
        tx.set(counterRef, { lastInvoiceNumber: seq }, { merge: true });
      });
      const y = new Date().getFullYear();
      const invNo = `SIPL/${y.toString().slice(-2)}-${(y+1).toString().slice(-2)}/${String(seq).padStart(3,'0')}`;

      // Build salesOrder from quote
      const lineItems = q.lines.map(l => ({
        itemDescription: l.description, quantity: l.quantity, rate: l.rate,
        gstPct: l.gstPct, grossAmount: l.amount,
      }));
      const taxable = q.lines.reduce((s,l)=>s+l.quantity*l.rate, 0);
      const cgst = taxable * 0.025;
      const ref = await addDoc(getTenantCollection(db, tenantId, 'salesOrders'), {
        orderNumber: invNo, invoiceType:'B2B_GST', retailerName:q.buyerName,
        buyerAddress:q.buyerAddress, buyerGstin:q.buyerGstin, buyerContact:q.buyerContact,
        lineItems, taxableValue:taxable, cgst, sgst:cgst, totalTax:cgst*2,
        netAmount:q.totalAmount, invoiceDate:TODAY(), status:'pending',
        fromQuotation:q.quoteNumber, createdAt:serverTimestamp(),
      });

      // Mark quotation as converted
      await updateDoc(getTenantDoc(db, tenantId, 'quotations', q.id) as any, {
        status:'converted', convertedInvoiceId:ref.id,
      });
      fetchQuotations();
      alert(`Invoice ${invNo} created from Quotation ${q.quoteNumber}!`);
    } catch(e) { console.error(e); } finally { setConverting(null); }
  };

  const updateStatus = async (q: Quotation, status: Quotation['status']) => {
    if (!tenantId) return;
    await updateDoc(getTenantDoc(db, tenantId, 'quotations', q.id) as any, { status });
    fetchQuotations();
  };

  const sendWhatsApp = (q: Quotation) => {
    const msg = encodeURIComponent(`Dear ${q.buyerName},\n\nPlease find your quotation ${q.quoteNumber} for ₹${fmtINR(q.totalAmount)}.\nValid until: ${q.validUntil}\n\nItems:\n${q.lines.map(l=>`• ${l.description} × ${l.quantity} @ ₹${l.rate} = ₹${fmtINR(l.amount)}`).join('\n')}\n\nTotal: ₹${fmtINR(q.totalAmount)}\n\nPlease confirm acceptance. Thank you!`);
    const num = q.buyerContact.replace(/\D/g,'');
    window.open(`https://wa.me/91${num}?text=${msg}`, '_blank');
  };

  const card = { background:'var(--surface-raised)', border:'1px solid var(--surface-border)', borderRadius:'14px', padding:'1.5rem' };

  return (
    <div className="animate-fade-in" style={{ maxWidth:'1100px', margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 className="primary-gradient-text" style={{ fontSize:'2rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <FileText size={32}/>  Quotations & Estimates
          </h1>
          <p style={{ color:'var(--text-secondary)', marginTop:'0.25rem' }}>Create quotes and convert to invoices in 1 click</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          {view==='new' && <button onClick={()=>setView('list')} style={{ padding:'0.75rem 1.5rem', background:'transparent', border:'1px solid var(--surface-border)', borderRadius:'10px', cursor:'pointer', color:'var(--text-secondary)', font:'inherit' }}>Cancel</button>}
          <button onClick={()=>setView(view==='list'?'new':'list')} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.5rem', background:'var(--primary-light)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:600, font:'inherit' }}>
            <Plus size={17}/> New Quotation
          </button>
        </div>
      </div>

      {/* New Quote Form */}
      {view==='new' && (
        <div style={{ ...card, marginBottom:'2rem' }}>
          <h3 style={{ marginBottom:'1.5rem', fontSize:'1.1rem', fontWeight:700 }}>Create New Quotation</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
            {[
              { key:'buyerName', label:'Buyer / Customer Name', placeholder:'e.g. Rajesh Traders', required:true },
              { key:'buyerContact', label:'Contact Number', placeholder:'10-digit mobile' },
              { key:'buyerGstin', label:'Buyer GSTIN (if applicable)', placeholder:'Optional' },
              { key:'validUntil', label:'Valid Until', type:'date' },
            ].map(f=>(
              <div key={f.key} className="input-group">
                <label style={{ fontWeight:600, fontSize:'0.85rem' }}>{f.label}{f.required&&' *'}</label>
                <input
                  className="input-field"
                  type={(f as any).type||'text'}
                  placeholder={(f as any).placeholder||''}
                  value={(form as any)[f.key]}
                  onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))}
                  required={f.required}
                />
              </div>
            ))}
          </div>
          <div className="input-group" style={{ marginBottom:'1.5rem' }}>
            <label style={{ fontWeight:600, fontSize:'0.85rem' }}>Buyer Address</label>
            <textarea className="input-field" style={{ minHeight:'60px' }} value={form.buyerAddress} onChange={e=>setForm(p=>({...p,buyerAddress:e.target.value}))} />
          </div>

          {/* Line Items */}
          <h4 style={{ marginBottom:'0.75rem', fontWeight:700 }}>Line Items</h4>
          <div style={{ overflowX:'auto', marginBottom:'1rem' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem' }}>
              <thead><tr style={{ background:'var(--surface-base)' }}>
                {['Description','Qty','Rate (₹)','GST%','Amount'].map(h=>(
                  <th key={h} style={{ padding:'0.6rem 0.75rem', textAlign:'left', fontWeight:700, color:'var(--text-secondary)', fontSize:'0.78rem', borderBottom:'1px solid var(--surface-border)' }}>{h}</th>
                ))}
                <th style={{ width:36 }}/>
              </tr></thead>
              <tbody>
                {lines.map((l,i)=>(
                  <tr key={i} style={{ borderBottom:'1px solid var(--surface-border)' }}>
                    <td style={{ padding:'0.4rem 0.5rem' }}>
                      <input className="input-field" style={{ margin:0 }} placeholder="Item/service description" value={l.description} onChange={e=>{const nl=[...lines]; nl[i]=recalcLine({...nl[i],description:e.target.value}); setLines(nl);}} />
                    </td>
                    <td style={{ padding:'0.4rem 0.5rem', width:70 }}>
                      <input type="number" className="input-field" style={{ margin:0 }} value={l.quantity} onChange={e=>{const nl=[...lines]; nl[i]=recalcLine({...nl[i],quantity:Number(e.target.value)}); setLines(nl);}} />
                    </td>
                    <td style={{ padding:'0.4rem 0.5rem', width:110 }}>
                      <input type="number" className="input-field" style={{ margin:0 }} value={l.rate} onChange={e=>{const nl=[...lines]; nl[i]=recalcLine({...nl[i],rate:Number(e.target.value)}); setLines(nl);}} />
                    </td>
                    <td style={{ padding:'0.4rem 0.5rem', width:80 }}>
                      <select className="input-field" style={{ margin:0 }} value={l.gstPct} onChange={e=>{const nl=[...lines]; nl[i]=recalcLine({...nl[i],gstPct:Number(e.target.value)}); setLines(nl);}}>
                        {[0,5,12,18,28].map(r=><option key={r} value={r}>{r}%</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'0.4rem 0.5rem', width:100, fontWeight:600, textAlign:'right' }}>₹{fmtINR(l.amount)}</td>
                    <td style={{ padding:'0.4rem 0.25rem', textAlign:'center' }}>
                      <button onClick={()=>setLines(ls=>ls.filter((_,j)=>j!==i))} style={{ border:'none', background:'transparent', cursor:'pointer', color:'#ef4444', padding:'4px' }}><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
            <button onClick={()=>setLines(l=>[...l,EMPTY_LINE()])} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1rem', background:'transparent', border:'1px dashed var(--surface-border)', borderRadius:'8px', cursor:'pointer', color:'var(--text-secondary)', font:'inherit', fontSize:'0.85rem' }}>
              <Plus size={14}/> Add Item
            </button>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>Total (incl. GST)</div>
              <div style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--primary-light)' }}>₹{fmtINR(totals)}</div>
            </div>
          </div>
          <div className="input-group" style={{ marginBottom:'1.5rem' }}>
            <label style={{ fontWeight:600, fontSize:'0.85rem' }}>Notes / Terms</label>
            <textarea className="input-field" style={{ minHeight:'60px' }} placeholder="Payment terms, delivery notes..." value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} />
          </div>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'flex-end' }}>
            <button onClick={()=>handleSaveQuote('draft')} disabled={saving} style={{ padding:'0.75rem 1.5rem', background:'transparent', border:'1px solid var(--surface-border)', borderRadius:'10px', cursor:'pointer', fontWeight:600, color:'var(--text-secondary)', font:'inherit', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              {saving?<Loader2 className="animate-spin" size={16}/>:<FileText size={16}/>} Save as Draft
            </button>
            <button onClick={()=>handleSaveQuote('sent')} disabled={saving} style={{ padding:'0.75rem 2rem', background:'var(--primary-light)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:700, font:'inherit', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              {saving?<Loader2 className="animate-spin" size={16}/>:<Send size={16}/>} Save & Mark Sent
            </button>
          </div>
        </div>
      )}

      {/* Quotations List */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-secondary)' }}><Loader2 className="animate-spin" size={36} style={{ margin:'0 auto' }}/></div>
      ) : quotations.length===0 ? (
        <div style={{ ...card, textAlign:'center', padding:'4rem' }}>
          <FileText size={48} style={{ color:'var(--text-tertiary)', margin:'0 auto 1rem', opacity:0.4 }}/>
          <h3>No Quotations Yet</h3>
          <p style={{ color:'var(--text-secondary)', marginTop:'0.5rem' }}>Create your first quotation to get started</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {quotations.map(q=>{
            const sc = STATUS_CONFIG[q.status]||STATUS_CONFIG.draft;
            return (
              <div key={q.id} style={{ ...card, display:'grid', gridTemplateColumns:'1fr auto', gap:'1rem', alignItems:'start' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem', flexWrap:'wrap' }}>
                    <span style={{ fontWeight:800, fontSize:'1rem', color:'var(--primary-light)' }}>{q.quoteNumber}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.2rem 0.65rem', borderRadius:'999px', background:sc.bg, color:sc.color, fontSize:'0.78rem', fontWeight:700 }}>{sc.icon}{sc.label}</span>
                    <span style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>Valid until: {q.validUntil}</span>
                  </div>
                  <div style={{ fontWeight:700, fontSize:'1.05rem', marginBottom:'0.25rem' }}>{q.buyerName}</div>
                  {q.buyerContact && <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'0.25rem' }}>📞 {q.buyerContact} {q.buyerGstin&&` • GSTIN: ${q.buyerGstin}`}</div>}
                  <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{q.lines.length} item(s) • Created: {q.quotedDate}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', alignItems:'flex-end' }}>
                  <div style={{ fontSize:'1.4rem', fontWeight:900, color:'var(--primary-light)' }}>₹{fmtINR(q.totalAmount)}</div>
                  <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', justifyContent:'flex-end' }}>
                    {q.status!=='converted' && (
                      <button onClick={()=>convertToInvoice(q)} disabled={!!converting} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.5rem 0.9rem', background:'#10b981', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:700, font:'inherit', fontSize:'0.82rem' }}>
                        {converting===q.id?<Loader2 className="animate-spin" size={14}/>:<ArrowRight size={14}/>} Convert to Invoice
                      </button>
                    )}
                    {q.buyerContact && (
                      <button onClick={()=>sendWhatsApp(q)} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.5rem 0.9rem', background:'#25D366', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600, font:'inherit', fontSize:'0.82rem' }}>
                        <Send size={14}/> WhatsApp
                      </button>
                    )}
                    {q.status==='draft' && (
                      <button onClick={()=>updateStatus(q,'sent')} style={{ padding:'0.5rem 0.9rem', background:'transparent', border:'1px solid var(--surface-border)', borderRadius:'8px', cursor:'pointer', color:'var(--text-secondary)', font:'inherit', fontSize:'0.82rem' }}>Mark Sent</button>
                    )}
                    {q.status==='sent' && (
                      <>
                        <button onClick={()=>updateStatus(q,'accepted')} style={{ padding:'0.5rem 0.75rem', background:'#10b981', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', font:'inherit', fontSize:'0.78rem', fontWeight:700 }}>✓ Accept</button>
                        <button onClick={()=>updateStatus(q,'rejected')} style={{ padding:'0.5rem 0.75rem', background:'#ef4444', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', font:'inherit', fontSize:'0.78rem', fontWeight:700 }}>✗ Reject</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
