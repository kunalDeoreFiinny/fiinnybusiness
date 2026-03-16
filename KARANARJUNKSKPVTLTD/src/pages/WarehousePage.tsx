import { useState, useEffect } from 'react';
import { addDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { Warehouse, Plus, Trash2, Loader2, Package, ArrowLeftRight, AlertCircle, Check, X } from 'lucide-react';

interface GodownItem { name: string; quantity: number; unit: string; minStock: number; }
interface Godown {
  id: string; name: string; location: string; managerName: string; contact: string;
  items: GodownItem[]; createdAt?: any;
}

export default function WarehousePage() {
  const { tenantId } = useAuth();
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [transferModal, setTransferModal] = useState<{open:boolean; from:string; item:GodownItem|null}>({ open:false, from:'', item:null });
  const [transferTo, setTransferTo] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [form, setForm] = useState({ name:'', location:'', managerName:'', contact:'' });

  const fetchGodowns = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(getTenantCollection(db, tenantId, 'godowns'), orderBy('createdAt','asc')));
      setGodowns(snap.docs.map(d=>({ id:d.id, ...d.data() } as Godown)));
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchGodowns(); }, [tenantId]);

  const handleSave = async () => {
    if (!tenantId || !form.name) return;
    setSaving(true);
    try {
      await addDoc(getTenantCollection(db, tenantId, 'godowns'), {
        ...form, items: [], createdAt: serverTimestamp(),
      });
      setShowForm(false); setForm({ name:'', location:'', managerName:'', contact:'' });
      fetchGodowns();
    } catch(e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!tenantId || !confirm('Delete this godown? All stock data will be lost.')) return;
    await deleteDoc(getTenantDoc(db, tenantId, 'godowns', id) as any);
    fetchGodowns();
  };

  const handleTransfer = async () => {
    if (!tenantId || !transferModal.item || !transferTo || !transferQty) return;
    const qty = Number(transferQty);
    if (qty <= 0 || qty > transferModal.item.quantity) { alert('Invalid quantity'); return; }
    try {
      // Deduct from source
      const fromGodown = godowns.find(g => g.id === transferModal.from);
      if (!fromGodown) return;
      const updatedFromItems = fromGodown.items.map(i =>
        i.name === transferModal.item!.name ? { ...i, quantity: i.quantity - qty } : i
      );
      await updateDoc(getTenantDoc(db, tenantId, 'godowns', transferModal.from) as any, { items: updatedFromItems });

      // Add to destination
      const toGodown = godowns.find(g => g.id === transferTo);
      if (!toGodown) return;
      const existingItem = toGodown.items.find(i => i.name === transferModal.item!.name);
      const updatedToItems = existingItem
        ? toGodown.items.map(i => i.name === transferModal.item!.name ? { ...i, quantity: i.quantity + qty } : i)
        : [...toGodown.items, { ...transferModal.item, quantity: qty }];
      await updateDoc(getTenantDoc(db, tenantId, 'godowns', transferTo) as any, { items: updatedToItems });

      setTransferModal({ open:false, from:'', item:null });
      setTransferTo(''); setTransferQty('');
      fetchGodowns();
    } catch(e) { console.error(e); }
  };

  const totalStockValue = godowns.reduce((s, g) => s + (g.items?.length || 0), 0);
  const lowStockCount = godowns.reduce((s, g) => s + (g.items?.filter(i => i.quantity <= i.minStock).length || 0), 0);

  const card = { background:'var(--surface-raised)', border:'1px solid var(--surface-border)', borderRadius:'14px', padding:'1.5rem' };

  return (
    <div className="animate-fade-in" style={{ maxWidth:'1100px', margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 className="primary-gradient-text" style={{ fontSize:'2rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <Warehouse size={32}/> Warehouses & Godowns
          </h1>
          <p style={{ color:'var(--text-secondary)', marginTop:'0.25rem' }}>Manage multiple storage locations and stock transfers</p>
        </div>
        <button onClick={()=>setShowForm(f=>!f)} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.5rem', background:'var(--primary-light)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:600, font:'inherit' }}>
          <Plus size={17}/> Add Godown
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Total Godowns', value:godowns.length, color:'#6366f1', icon:<Warehouse size={18}/> },
          { label:'Total SKUs Tracked', value:totalStockValue, color:'#10b981', icon:<Package size={18}/> },
          { label:'Low Stock Alerts', value:lowStockCount, color:lowStockCount>0?'#ef4444':'#10b981', icon:<AlertCircle size={18}/> },
        ].map(s=>(
          <div key={s.label} style={{ background:'var(--surface-raised)', border:'1px solid var(--surface-border)', borderLeft:`4px solid ${s.color}`, borderRadius:'14px', padding:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:s.color, marginBottom:'0.4rem', fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.05em' }}>{s.icon}{s.label}</div>
            <div style={{ fontSize:'1.4rem', fontWeight:800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Add Godown Form */}
      {showForm && (
        <div style={{ ...card, marginBottom:'1.5rem', border:'2px dashed var(--primary-light)' }}>
          <h3 style={{ marginBottom:'1.25rem', fontWeight:700 }}>Add New Godown / Warehouse</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            {[
              { key:'name', label:'Godown Name *', placeholder:'e.g. Main Warehouse, Site B' },
              { key:'location', label:'Location / Address', placeholder:'City, Area' },
              { key:'managerName', label:'Manager Name', placeholder:'In-charge person' },
              { key:'contact', label:'Contact Number', placeholder:'10-digit mobile' },
            ].map(f=>(
              <div key={f.key} className="input-group">
                <label style={{ fontWeight:600, fontSize:'0.85rem' }}>{f.label}</label>
                <input className="input-field" placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} />
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'flex-end', marginTop:'1rem' }}>
            <button onClick={()=>setShowForm(false)} style={{ padding:'0.65rem 1.25rem', background:'transparent', border:'1px solid var(--surface-border)', borderRadius:'10px', cursor:'pointer', font:'inherit', color:'var(--text-secondary)' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.65rem 1.5rem', background:'var(--primary-light)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:700, font:'inherit' }}>
              {saving?<Loader2 className="animate-spin" size={16}/>:<Check size={16}/>} Save Godown
            </button>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModal.open && transferModal.item && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ ...card, width:'460px', maxWidth:'90vw' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h3 style={{ fontWeight:700, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <ArrowLeftRight size={20} style={{ color:'var(--primary-light)' }}/> Stock Transfer
              </h3>
              <button onClick={()=>setTransferModal({open:false,from:'',item:null})} style={{ border:'none', background:'transparent', cursor:'pointer', color:'var(--text-secondary)' }}><X size={20}/></button>
            </div>
            <p style={{ fontSize:'0.9rem', color:'var(--text-secondary)', marginBottom:'1rem' }}>
              Transferring: <strong>{transferModal.item.name}</strong> (Available: {transferModal.item.quantity} {transferModal.item.unit})
            </p>
            <div className="input-group" style={{ marginBottom:'1rem' }}>
              <label style={{ fontWeight:600, fontSize:'0.85rem' }}>Transfer To</label>
              <select className="input-field" value={transferTo} onChange={e=>setTransferTo(e.target.value)}>
                <option value="">Select destination godown...</option>
                {godowns.filter(g=>g.id!==transferModal.from).map(g=>(<option key={g.id} value={g.id}>{g.name} — {g.location||'No location'}</option>))}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom:'1.5rem' }}>
              <label style={{ fontWeight:600, fontSize:'0.85rem' }}>Quantity to Transfer</label>
              <input type="number" className="input-field" min={1} max={transferModal.item.quantity} value={transferQty} onChange={e=>setTransferQty(e.target.value)} placeholder={`Max: ${transferModal.item.quantity}`} />
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
              <button onClick={()=>setTransferModal({open:false,from:'',item:null})} style={{ padding:'0.65rem 1.25rem', background:'transparent', border:'1px solid var(--surface-border)', borderRadius:'10px', cursor:'pointer', font:'inherit', color:'var(--text-secondary)' }}>Cancel</button>
              <button onClick={handleTransfer} disabled={!transferTo||!transferQty} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.65rem 1.5rem', background:'var(--primary-light)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:700, font:'inherit' }}>
                <ArrowLeftRight size={16}/> Transfer Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Godowns List */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'4rem' }}><Loader2 className="animate-spin" size={36} style={{ margin:'0 auto' }}/></div>
      ) : godowns.length===0 ? (
        <div style={{ ...card, textAlign:'center', padding:'4rem' }}>
          <Warehouse size={52} style={{ color:'var(--text-tertiary)', margin:'0 auto 1rem', opacity:0.3 }}/>
          <h3>No Godowns Added</h3>
          <p style={{ color:'var(--text-secondary)', marginTop:'0.5rem' }}>Add your first warehouse or storage location</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(460px,1fr))', gap:'1.25rem' }}>
          {godowns.map(g=>(
            <div key={g.id} style={card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:'1.1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <Warehouse size={18} style={{ color:'var(--primary-light)' }}/> {g.name}
                  </div>
                  {g.location && <div style={{ fontSize:'0.83rem', color:'var(--text-secondary)', marginTop:'0.2rem' }}>📍 {g.location}</div>}
                  {g.managerName && <div style={{ fontSize:'0.83rem', color:'var(--text-secondary)' }}>👤 {g.managerName} {g.contact&&`• 📞 ${g.contact}`}</div>}
                </div>
                <button onClick={()=>handleDelete(g.id)} style={{ border:'none', background:'transparent', cursor:'pointer', color:'#ef4444', padding:'4px', opacity:0.6 }}>
                  <Trash2 size={16}/>
                </button>
              </div>

              {/* Stock Items */}
              {g.items && g.items.length > 0 ? (
                <div>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem' }}>Stock Items</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                    {g.items.map((item,i)=>{
                      const isLow = item.quantity <= item.minStock;
                      return (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0.75rem', background:isLow?'hsla(0,84%,60%,0.06)':'var(--surface-base)', borderRadius:'8px', border:isLow?'1px solid hsla(0,84%,60%,0.2)':'1px solid transparent' }}>
                          <div>
                            <span style={{ fontWeight:600, fontSize:'0.88rem' }}>{item.name}</span>
                            {isLow && <span style={{ marginLeft:'0.5rem', fontSize:'0.72rem', color:'#ef4444', fontWeight:700 }}>⚠ LOW</span>}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                            <span style={{ fontWeight:700, fontSize:'0.9rem', color:isLow?'#ef4444':'var(--text-primary)' }}>{item.quantity} {item.unit}</span>
                            <button
                              onClick={()=>setTransferModal({open:true, from:g.id, item})}
                              style={{ display:'flex', alignItems:'center', gap:'0.25rem', padding:'0.3rem 0.6rem', background:'var(--surface-raised)', border:'1px solid var(--surface-border)', borderRadius:'6px', cursor:'pointer', font:'inherit', fontSize:'0.75rem', color:'var(--text-secondary)' }}
                            >
                              <ArrowLeftRight size={12}/> Transfer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--text-tertiary)', fontSize:'0.85rem' }}>
                  <Package size={24} style={{ margin:'0 auto 0.5rem', opacity:0.3 }}/>
                  No stock items. Add products from Inventory to track here.
                </div>
              )}
              <div style={{ borderTop:'1px solid var(--surface-border)', marginTop:'1rem', paddingTop:'0.75rem', display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                <span>{g.items?.length||0} SKUs tracked</span>
                <span style={{ color:lowStockCount>0?'#ef4444':'#10b981', fontWeight:600 }}>
                  {g.items?.filter(i=>i.quantity<=i.minStock).length||0} low stock
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
