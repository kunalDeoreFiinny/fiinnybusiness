import { useState, useEffect } from 'react';
import { addDoc, getDocs, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';

import { Truck, Plus, CheckCircle2, FileText, Loader2, Trash2, AlertCircle, ArrowRight } from 'lucide-react';

interface ChallanLine { description: string; quantity: number; unit: string; }
interface DeliveryChallan {
  id: string; challanNumber: string; challanDate: string;
  buyerName: string; buyerContact: string; buyerAddress: string;
  vehicleNo: string; driverName: string;
  lines: ChallanLine[]; notes: string;
  status: 'pending'|'delivered'|'converted'; convertedInvoiceId?: string; createdAt?: any;
}

const STATUS_CFG = {
  pending:   { label:'Pending',   color:'#f59e0b', bg:'hsla(38,92%,50%,0.1)' },
  delivered: { label:'Delivered', color:'#10b981', bg:'hsla(160,84%,39%,0.1)' },
  converted: { label:'Invoiced',  color:'#6366f1', bg:'hsla(238,83%,67%,0.1)' },
};

const EMPTY_LINE = (): ChallanLine => ({ description:'', quantity:1, unit:'Nos' });
const TODAY = () => new Date().toISOString().split('T')[0];

export default function DeliveryChallansPage() {
  const { tenantId } = useAuth();
  const [view, setView] = useState<'list'|'new'>('list');
  const [challans, setChallans] = useState<DeliveryChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ buyerName:'', buyerContact:'', buyerAddress:'', vehicleNo:'', driverName:'', notes:'' });
  const [lines, setLines] = useState<ChallanLine[]>([EMPTY_LINE()]);

  const fetch = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(getTenantCollection(db, tenantId, 'deliveryChallans'), orderBy('createdAt','desc')));
      setChallans(snap.docs.map(d=>({ id:d.id, ...d.data() } as DeliveryChallan)));
    } catch(e){ console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [tenantId]);

  const handleSave = async () => {
    if (!tenantId || !form.buyerName) return;
    setSaving(true);
    try {
      const snap = await getDocs(getTenantCollection(db, tenantId, 'deliveryChallans'));
      const seq = snap.size + 1;
      const y = new Date().getFullYear();
      await addDoc(getTenantCollection(db, tenantId, 'deliveryChallans'), {
        challanNumber: `DC/${y.toString().slice(-2)}-${(y+1).toString().slice(-2)}/${String(seq).padStart(3,'0')}`,
        challanDate: TODAY(), buyerName: form.buyerName, buyerContact: form.buyerContact,
        buyerAddress: form.buyerAddress, vehicleNo: form.vehicleNo, driverName: form.driverName,
        lines: lines.filter(l=>l.description), notes: form.notes, status:'pending',
        createdAt: serverTimestamp(),
      });
      setView('list'); fetch();
      setForm({ buyerName:'', buyerContact:'', buyerAddress:'', vehicleNo:'', driverName:'', notes:'' });
      setLines([EMPTY_LINE()]);
    } catch(e){ console.error(e); } finally { setSaving(false); }
  };

  const markDelivered = async (dc: DeliveryChallan) => {
    if (!tenantId) return;
    await updateDoc(getTenantDoc(db, tenantId, 'deliveryChallans', dc.id) as any, { status:'delivered', deliveredAt: serverTimestamp() });
    fetch();
  };

  const convertToInvoice = async (dc: DeliveryChallan) => {
    if (!tenantId) return;
    // Create minimal invoice shell for redirect to B2B invoice
    alert(`Challan ${dc.challanNumber}: Please create a B2B GST Invoice for ${dc.buyerName} with the items from this challan. The challan reference will be tracked.`);
    await updateDoc(getTenantDoc(db, tenantId, 'deliveryChallans', dc.id) as any, { status:'converted' });
    fetch();
  };

  const printChallan = (dc: DeliveryChallan) => {
    const win = window.open('', '_blank', 'width=700,height=900');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Delivery Challan ${dc.challanNumber}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Times New Roman', serif; padding:20px; color:#000; font-size:12px; }
      h1 { font-size:18px; text-align:center; margin-bottom:4px; }
      .sub { text-align:center; font-size:10px; color:#444; margin-bottom:16px; }
      .title { text-align:center; font-size:14px; font-weight:bold; border:2px solid #000; padding:4px; margin-bottom:12px; }
      .grid { display:grid; grid-template-columns:1fr 1fr; gap:0; border:1px solid #000; margin-bottom:12px; }
      .cell { padding:6px 10px; border:1px solid #000; font-size:11px; }
      .bold { font-weight:bold; }
      table { width:100%; border-collapse:collapse; margin-bottom:12px; font-size:11px; }
      th, td { border:1px solid #000; padding:4px 6px; }
      th { background:#f2f2f2; font-weight:bold; text-align:center; }
      .footer { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px; }
      .sig { border-top:1px solid #000; padding-top:4px; text-align:center; margin-top:40px; font-size:10px; }
      @media print { button { display:none; } }
    </style></head><body>
    <h1>DELIVERY CHALLAN</h1>
    <div class="sub">Not a Tax Invoice</div>
    <div class="grid">
      <div class="cell"><span class="bold">Challan No:</span> ${dc.challanNumber}</div>
      <div class="cell"><span class="bold">Date:</span> ${dc.challanDate}</div>
      <div class="cell"><span class="bold">Deliver To:</span> ${dc.buyerName}</div>
      <div class="cell"><span class="bold">Contact:</span> ${dc.buyerContact||'—'}</div>
      <div class="cell" style="grid-column:span 2"><span class="bold">Address:</span> ${dc.buyerAddress||'—'}</div>
      <div class="cell"><span class="bold">Vehicle No:</span> ${dc.vehicleNo||'—'}</div>
      <div class="cell"><span class="bold">Driver:</span> ${dc.driverName||'—'}</div>
    </div>
    <table>
      <thead><tr><th>S.No</th><th>Description</th><th>Qty</th><th>Unit</th><th>Received Qty</th><th>Remarks</th></tr></thead>
      <tbody>
        ${dc.lines.map((l,i)=>`<tr><td style="text-align:center">${i+1}</td><td>${l.description}</td><td style="text-align:center">${l.quantity}</td><td style="text-align:center">${l.unit}</td><td></td><td></td></tr>`).join('')}
      </tbody>
    </table>
    ${dc.notes?`<div style="border:1px solid #000;padding:6px 10px;font-size:11px;margin-bottom:12px;"><strong>Notes:</strong> ${dc.notes}</div>`:''}
    <div class="footer">
      <div><div class="sig">Prepared By</div></div>
      <div><div class="sig">Receiver's Signature & Stamp</div></div>
    </div>
    <script>setTimeout(()=>{window.print();},400);</script>
    </body></html>`);
    win.document.close();
  };

  const card = { background:'var(--surface-raised)', border:'1px solid var(--surface-border)', borderRadius:'14px', padding:'1.5rem' };

  return (
    <div className="animate-fade-in" style={{ maxWidth:'1100px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 className="primary-gradient-text" style={{ fontSize:'2rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <Truck size={32}/> Delivery Challans
          </h1>
          <p style={{ color:'var(--text-secondary)', marginTop:'0.25rem' }}>Create challans for dispatch — convert to GST invoice on delivery</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          {view==='new' && <button onClick={()=>setView('list')} style={{ padding:'0.75rem 1.5rem', background:'transparent', border:'1px solid var(--surface-border)', borderRadius:'10px', cursor:'pointer', color:'var(--text-secondary)', font:'inherit' }}>Cancel</button>}
          <button onClick={()=>setView(view==='list'?'new':'list')} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.5rem', background:'var(--primary-light)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:600, font:'inherit' }}>
            <Plus size={17}/> New Challan
          </button>
        </div>
      </div>

      {/* New Challan Form */}
      {view==='new' && (
        <div style={{ ...card, marginBottom:'2rem' }}>
          <h3 style={{ marginBottom:'1.5rem', fontWeight:700 }}>Create Delivery Challan</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
            {[
              { key:'buyerName', label:'Deliver To (Customer/Party)', required:true },
              { key:'buyerContact', label:'Contact Number' },
              { key:'vehicleNo', label:'Vehicle Number', placeholder:'e.g. MH12AB1234' },
              { key:'driverName', label:'Driver Name', placeholder:'Optional' },
            ].map(f=>(
              <div key={f.key} className="input-group">
                <label style={{ fontWeight:600, fontSize:'0.85rem' }}>{f.label}{(f as any).required&&' *'}</label>
                <input className="input-field" placeholder={(f as any).placeholder||''} value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} />
              </div>
            ))}
          </div>
          <div className="input-group" style={{ marginBottom:'1.5rem' }}>
            <label style={{ fontWeight:600, fontSize:'0.85rem' }}>Delivery Address</label>
            <textarea className="input-field" style={{ minHeight:'50px' }} value={form.buyerAddress} onChange={e=>setForm(p=>({...p,buyerAddress:e.target.value}))}/>
          </div>

          <h4 style={{ marginBottom:'0.75rem', fontWeight:700 }}>Items</h4>
          <div style={{ overflowX:'auto', marginBottom:'1rem' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem' }}>
              <thead><tr style={{ background:'var(--surface-base)' }}>
                {['Description','Qty','Unit'].map(h=>(
                  <th key={h} style={{ padding:'0.6rem 0.75rem', textAlign:'left', fontWeight:700, color:'var(--text-secondary)', fontSize:'0.78rem', borderBottom:'1px solid var(--surface-border)' }}>{h}</th>
                ))}
                <th style={{ width:36 }}/>
              </tr></thead>
              <tbody>
                {lines.map((l,i)=>(
                  <tr key={i} style={{ borderBottom:'1px solid var(--surface-border)' }}>
                    <td style={{ padding:'0.4rem 0.5rem' }}><input className="input-field" style={{ margin:0 }} placeholder="Item/product" value={l.description} onChange={e=>{const nl=[...lines]; nl[i]={...nl[i],description:e.target.value}; setLines(nl);}}/></td>
                    <td style={{ padding:'0.4rem 0.5rem', width:80 }}><input type="number" className="input-field" style={{ margin:0 }} value={l.quantity} onChange={e=>{const nl=[...lines]; nl[i]={...nl[i],quantity:Number(e.target.value)}; setLines(nl);}}/></td>
                    <td style={{ padding:'0.4rem 0.5rem', width:80 }}><input className="input-field" style={{ margin:0 }} value={l.unit} onChange={e=>{const nl=[...lines]; nl[i]={...nl[i],unit:e.target.value}; setLines(nl);}}/></td>
                    <td style={{ textAlign:'center', padding:'0.4rem 0.25rem' }}>
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
            <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{lines.filter(l=>l.description).length} item(s)</span>
          </div>
          <div className="input-group" style={{ marginBottom:'1.5rem' }}>
            <label style={{ fontWeight:600, fontSize:'0.85rem' }}>Notes</label>
            <textarea className="input-field" style={{ minHeight:'50px' }} placeholder="Handling instructions..." value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} />
          </div>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'flex-end' }}>
            <button onClick={handleSave} disabled={saving} style={{ padding:'0.75rem 2rem', background:'var(--primary-light)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:700, font:'inherit', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              {saving?<Loader2 className="animate-spin" size={16}/>:<FileText size={16}/>} Save & Print Challan
            </button>
          </div>
        </div>
      )}

      {/* Challans List */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'4rem' }}><Loader2 className="animate-spin" size={36} style={{ margin:'0 auto' }}/></div>
      ) : challans.length===0 ? (
        <div style={{ ...card, textAlign:'center', padding:'4rem' }}>
          <AlertCircle size={48} style={{ color:'var(--text-tertiary)', margin:'0 auto 1rem', opacity:0.4 }}/>
          <h3>No Delivery Challans</h3>
          <p style={{ color:'var(--text-secondary)', marginTop:'0.5rem' }}>Create challans for dispatched goods</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {challans.map(dc=>{
            const sc = STATUS_CFG[dc.status]||STATUS_CFG.pending;
            return (
              <div key={dc.id} style={{ ...card, padding:'1.25rem', display:'grid', gridTemplateColumns:'1fr auto', gap:'1rem', alignItems:'center' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.4rem', flexWrap:'wrap' }}>
                    <span style={{ fontWeight:800, color:'var(--primary-light)' }}>{dc.challanNumber}</span>
                    <span style={{ padding:'0.15rem 0.65rem', borderRadius:'999px', background:sc.bg, color:sc.color, fontSize:'0.76rem', fontWeight:700 }}>{sc.label}</span>
                    <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{dc.challanDate}</span>
                  </div>
                  <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:'0.2rem' }}>{dc.buyerName}</div>
                  <div style={{ fontSize:'0.83rem', color:'var(--text-secondary)' }}>
                    {dc.lines.length} item(s)
                    {dc.vehicleNo && ` • 🚛 ${dc.vehicleNo}`}
                    {dc.buyerContact && ` • 📞 ${dc.buyerContact}`}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', justifyContent:'flex-end' }}>
                  <button onClick={()=>printChallan(dc)} style={{ padding:'0.5rem 0.9rem', background:'transparent', border:'1px solid var(--surface-border)', borderRadius:'8px', cursor:'pointer', color:'var(--text-secondary)', font:'inherit', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:'0.35rem' }}>
                    <FileText size={14}/> Print
                  </button>
                  {dc.status==='pending' && (
                    <button onClick={()=>markDelivered(dc)} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.5rem 0.9rem', background:'#10b981', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:700, font:'inherit', fontSize:'0.82rem' }}>
                      <CheckCircle2 size={14}/> Delivered
                    </button>
                  )}
                  {dc.status==='delivered' && (
                    <button onClick={()=>convertToInvoice(dc)} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.5rem 0.9rem', background:'var(--primary-light)', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:700, font:'inherit', fontSize:'0.82rem' }}>
                      <ArrowRight size={14}/> Convert to Invoice
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
