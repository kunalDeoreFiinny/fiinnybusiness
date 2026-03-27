import { useState, useEffect, useMemo } from 'react';
import { getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection } from '../utils/tenantPath';
import { fmtINR } from '../utils/gstCalculator';
import { TrendingUp, TrendingDown, Download, Loader2, Calendar, BarChart3, BookOpen, FileText } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface Order { id:string; netAmount:number; taxableValue:number; totalTax:number; cgst:number; sgst:number; invoiceDate:string; status:string; lineItems?:any[]; }
interface Expense { id:string; amount:number; category:string; date:string; description:string; }

type ReportTab = 'pl' | 'balance' | 'daybook';

export default function FinancialReportsPage() {
  const { tenantId } = useAuth();
  const today = new Date();
  const [tab, setTab] = useState<ReportTab>('pl');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const years = [today.getFullYear(), today.getFullYear()-1, today.getFullYear()-2];

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    const start = new Date(year, month, 1).toISOString().split('T')[0];
    const end = new Date(year, month+1, 0).toISOString().split('T')[0];
    Promise.all([
      getDocs(query(getTenantCollection(db, tenantId, 'salesOrders'), orderBy('createdAt','asc'))),
      getDocs(query(getTenantCollection(db, tenantId, 'expenses'), orderBy('createdAt','asc'))).catch(()=>({ docs:[] as any[] })),
    ]).then(([orderSnap, expSnap]) => {
      setOrders(orderSnap.docs.map(d=>({id:d.id,...d.data()} as Order)).filter(o=>o.invoiceDate>=start&&o.invoiceDate<=end));
      setExpenses((expSnap as any).docs.map((d:any)=>({id:d.id,...d.data()} as Expense)).filter((e:Expense)=>e.date>=start&&e.date<=end));
    }).catch(console.error).finally(()=>setLoading(false));
  }, [tenantId, year, month]);

  // ── P&L Calculations ──
  const pl = useMemo(() => {
    const totalRevenue = orders.reduce((s,o)=>s+(o.netAmount||0), 0);
    const totalTaxable = orders.reduce((s,o)=>s+(o.taxableValue||0), 0);
    const totalGst = orders.reduce((s,o)=>s+(o.totalTax||0), 0);
    const totalExpenses = expenses.reduce((s,e)=>s+(e.amount||0), 0);
    const grossProfit = totalTaxable - totalExpenses;
    const netProfit = totalRevenue - totalExpenses - totalGst;
    const expByCategory: Record<string,number> = {};
    for (const e of expenses) {
      expByCategory[e.category||'Others'] = (expByCategory[e.category||'Others']||0) + e.amount;
    }
    return { totalRevenue, totalTaxable, totalGst, totalExpenses, grossProfit, netProfit, expByCategory, orderCount: orders.length };
  }, [orders, expenses]);

  // ── Day Book ──
  const dayBook = useMemo(() => {
    const entries: { date:string; description:string; debit:number; credit:number; type:string; ref:string }[] = [];
    for (const o of orders) {
      entries.push({ date:o.invoiceDate, description:`Invoice — ${(o as any).retailerName||'Customer'}`, debit:0, credit:o.netAmount||0, type:'sale', ref:(o as any).orderNumber||o.id });
    }
    for (const e of expenses) {
      entries.push({ date:e.date, description:e.description||e.category, debit:e.amount||0, credit:0, type:'expense', ref:e.id });
    }
    entries.sort((a,b)=>a.date.localeCompare(b.date));
    let balance = 0;
    return entries.map(e => { balance = balance + e.credit - e.debit; return { ...e, balance }; });
  }, [orders, expenses]);

  const exportCSV = () => {
    let rows: string[][] = [];
    if (tab === 'pl') {
      rows = [
        ['Profit & Loss Statement', `${MONTHS[month]} ${year}`],[''],
        ['INCOME',''],
        ['Total Revenue (Gross)', String(pl.totalRevenue)],
        ['Taxable Revenue (Ex GST)', String(pl.totalTaxable)],
        ['GST Collected', String(pl.totalGst)],[''],
        ['EXPENSES',''],
        ...Object.entries(pl.expByCategory).map(([k,v])=>[k,String(v)]),
        ['Total Expenses', String(pl.totalExpenses)],[''],
        ['GROSS PROFIT', String(pl.grossProfit)],
        ['NET PROFIT (after GST)', String(pl.netProfit)],
      ];
    } else if (tab === 'daybook') {
      rows = [['Date','Description','Ref','Debit','Credit','Balance'],
        ...dayBook.map(e=>[e.date,e.description,e.ref,String(e.debit),String(e.credit),String(e.balance)])];
    } else if (tab === 'balance') {
      rows = [
        ['Balance Sheet', `As of ${MONTHS[month]} ${year}`],[''],
        ['ASSETS',''],
        ['Accounts Receivable (Outstanding)', String(orders.filter(o=>o.status!=='paid').reduce((s,o)=>s+(o.netAmount||0),0))],
        ['Cash / Bank (Received Invoices)', String(orders.filter(o=>o.status==='paid').reduce((s,o)=>s+(o.netAmount||0),0))],
        ['GST Input Credit (ITC)', `0.00`],
        ['TOTAL ASSETS', String(pl.totalRevenue)],[''],
        ['LIABILITIES & EQUITY',''],
        ['GST Payable (Output Tax)', String(pl.totalGst)],
        ['Accounts Payable (Expenses)', String(pl.totalExpenses)],
        ['Retained Earnings (Net Profit)', String(pl.netProfit)],
        ['TOTAL LIABILITIES + EQUITY', String(pl.totalRevenue)],
      ];
    }
    const blob = new Blob(['\uFEFF'+rows.map(r=>r.join(',')).join('\n')],{type:'text/csv;charset=utf-8'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`${tab.toUpperCase()}_${MONTHS[month]}_${year}.csv`; a.click();
  };

  const card = { background:'var(--surface-raised)', border:'1px solid var(--surface-border)', borderRadius:'14px', padding:'1.5rem' };
  const tabBtn = (t: ReportTab, label: string, icon: React.ReactNode) => (
    <button onClick={()=>setTab(t)} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.65rem 1.25rem', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:tab===t?700:400, background:tab===t?'var(--primary-light)':'transparent', color:tab===t?'#fff':'var(--text-secondary)', font:'inherit', fontSize:'0.9rem', transition:'all 0.2s' }}>
      {icon}{label}
    </button>
  );

  const profitColor = pl.netProfit >= 0 ? '#10b981' : '#ef4444';

  return (
    <div className="animate-fade-in" style={{ maxWidth:'1100px', margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 className="primary-gradient-text" style={{ fontSize:'2rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <BarChart3 size={32}/> Financial Reports
          </h1>
          <p style={{ color:'var(--text-secondary)', marginTop:'0.25rem' }}>P&L Statement · Balance Sheet · Day Book</p>
        </div>
        <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.5rem', background:'var(--primary-light)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:600, font:'inherit' }}>
          <Download size={17}/> Export CSV
        </button>
      </div>

      {/* Controls */}
      <div style={{ ...card, marginBottom:'1.5rem', display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap' }}>
        <Calendar size={20} style={{ color:'var(--primary-light)' }}/>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="input-field" style={{ width:'auto', minWidth:'140px' }}>
          {MONTHS.map((m,i)=><option key={m} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} className="input-field" style={{ width:'auto' }}>
          {years.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <div style={{ marginLeft:'auto', display:'flex', gap:'0.4rem', background:'var(--surface-base)', borderRadius:'12px', padding:'0.25rem' }}>
          {tabBtn('pl','P&L',<TrendingUp size={16}/>)}
          {tabBtn('balance','Balance Sheet',<FileText size={16}/>)}
          {tabBtn('daybook','Day Book',<BookOpen size={16}/>)}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'4rem' }}><Loader2 className="animate-spin" size={36} style={{ margin:'0 auto' }}/></div>
      ) : (
        <>
          {/* ── P&L Tab ── */}
          {tab==='pl' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              {/* Summary Cards */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:'1rem' }}>
                {[
                  { label:'Total Revenue', value:`₹${fmtINR(pl.totalRevenue)}`, color:'#10b981', icon:<TrendingUp size={18}/> },
                  { label:'Taxable (Ex GST)', value:`₹${fmtINR(pl.totalTaxable)}`, color:'#6366f1', icon:<BarChart3 size={18}/> },
                  { label:'GST Collected', value:`₹${fmtINR(pl.totalGst)}`, color:'#f59e0b', icon:<FileText size={18}/> },
                  { label:'Total Expenses', value:`₹${fmtINR(pl.totalExpenses)}`, color:'#ef4444', icon:<TrendingDown size={18}/> },
                  { label:'Net Profit', value:`₹${fmtINR(pl.netProfit)}`, color:profitColor, icon: pl.netProfit>=0?<TrendingUp size={18}/>:<TrendingDown size={18}/> },
                ].map(s=>(
                  <div key={s.label} style={{ background:'var(--surface-raised)', border:'1px solid var(--surface-border)', borderLeft:`4px solid ${s.color}`, borderRadius:'14px', padding:'1.25rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:s.color, marginBottom:'0.4rem', fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.05em' }}>{s.icon}{s.label}</div>
                    <div style={{ fontSize:'1.25rem', fontWeight:800, color:s.label==='Net Profit'?profitColor:'inherit' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* P&L Table */}
              <div style={card}>
                <h3 style={{ marginBottom:'1.5rem', fontWeight:800, fontSize:'1.1rem' }}>
                  Profit & Loss Statement — {MONTHS[month]} {year}
                </h3>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
                  <tbody>
                    {/* INCOME */}
                    <tr style={{ background:'hsla(152,60%,40%,0.06)' }}>
                      <td colSpan={2} style={{ padding:'0.75rem 1rem', fontWeight:800, fontSize:'0.85rem', textTransform:'uppercase' as const, letterSpacing:'0.06em', color:'#10b981' }}>INCOME</td>
                    </tr>
                    {[
                      ['Total Sales (Invoiced)', `₹${fmtINR(pl.totalRevenue)}`],
                      ['  Taxable Value (Ex-GST)', `₹${fmtINR(pl.totalTaxable)}`],
                      ['  GST Collected', `₹${fmtINR(pl.totalGst)}`],
                      [`  Number of Invoices`, `${pl.orderCount}`],
                    ].map(([k,v])=>(
                      <tr key={k} style={{ borderBottom:'1px solid var(--surface-border)' }}>
                        <td style={{ padding:'0.75rem 1.25rem', color:'var(--text-secondary)' }}>{k}</td>
                        <td style={{ padding:'0.75rem 1rem', textAlign:'right', fontWeight:600 }}>{v}</td>
                      </tr>
                    ))}
                    {/* EXPENSES */}
                    <tr style={{ background:'hsla(0,84%,60%,0.06)' }}>
                      <td colSpan={2} style={{ padding:'0.75rem 1rem', fontWeight:800, fontSize:'0.85rem', textTransform:'uppercase' as const, letterSpacing:'0.06em', color:'#ef4444', borderTop:'2px solid var(--surface-border)' }}>EXPENSES</td>
                    </tr>
                    {Object.entries(pl.expByCategory).length > 0 ? Object.entries(pl.expByCategory).map(([k,v])=>(
                      <tr key={k} style={{ borderBottom:'1px solid var(--surface-border)' }}>
                        <td style={{ padding:'0.75rem 1.25rem', color:'var(--text-secondary)' }}>{k}</td>
                        <td style={{ padding:'0.75rem 1rem', textAlign:'right', fontWeight:600, color:'#ef4444' }}>₹{fmtINR(v)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={2} style={{ padding:'0.75rem 1.25rem', color:'var(--text-tertiary)', fontStyle:'italic' }}>No expenses recorded this month</td></tr>
                    )}
                    <tr style={{ borderTop:'1px solid var(--surface-border)' }}>
                      <td style={{ padding:'0.75rem 1.25rem', fontWeight:700 }}>Total Expenses</td>
                      <td style={{ padding:'0.75rem 1rem', textAlign:'right', fontWeight:700, color:'#ef4444' }}>₹{fmtINR(pl.totalExpenses)}</td>
                    </tr>
                    {/* PROFIT */}
                    <tr style={{ background:'var(--surface-base)', borderTop:'3px solid var(--surface-border)' }}>
                      <td colSpan={2} style={{ padding:'0.75rem 1rem', fontWeight:800, fontSize:'0.85rem', textTransform:'uppercase' as const, letterSpacing:'0.06em', color:profitColor }}>PROFIT</td>
                    </tr>
                    <tr style={{ borderBottom:'1px solid var(--surface-border)' }}>
                      <td style={{ padding:'0.75rem 1.25rem', color:'var(--text-secondary)' }}>Gross Profit (Revenue − Expenses)</td>
                      <td style={{ padding:'0.75rem 1rem', textAlign:'right', fontWeight:700, color:pl.grossProfit>=0?'#10b981':'#ef4444' }}>₹{fmtINR(pl.grossProfit)}</td>
                    </tr>
                    <tr style={{ background:pl.netProfit>=0?'hsla(160,84%,39%,0.08)':'hsla(0,84%,60%,0.08)' }}>
                      <td style={{ padding:'1rem 1.25rem', fontWeight:900, fontSize:'1.05rem' }}>NET PROFIT (after GST payout)</td>
                      <td style={{ padding:'1rem', textAlign:'right', fontWeight:900, fontSize:'1.2rem', color:profitColor }}>₹{fmtINR(pl.netProfit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Balance Sheet Tab ── */}
          {tab==='balance' && (
            <div style={card}>
              <h3 style={{ marginBottom:'1.5rem', fontWeight:800, fontSize:'1.1rem' }}>Balance Sheet — As of {MONTHS[month]} {year}</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem' }}>
                {/* Assets */}
                <div>
                  <h4 style={{ color:'#10b981', fontWeight:700, marginBottom:'1rem', padding:'0.5rem 0', borderBottom:'2px solid #10b981', fontSize:'0.9rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>ASSETS</h4>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
                    <tbody>
                      {[
                        ['Current Assets',''],
                        ['  Accounts Receivable (Outstanding)', `₹${fmtINR(orders.filter(o=>o.status!=='paid').reduce((s,o)=>s+(o.netAmount||0),0))}`],
                        ['  Cash / Bank (Received Invoices)', `₹${fmtINR(orders.filter(o=>o.status==='paid').reduce((s,o)=>s+(o.netAmount||0),0))}`],
                        ['  GST Input Credit (ITC)', `₹0.00`],
                        ['TOTAL ASSETS', `₹${fmtINR(pl.totalRevenue)}`],
                      ].map(([k,v],i)=>(
                        <tr key={i} style={{ borderBottom:'1px solid var(--surface-border)', background:k.startsWith('TOTAL')||k.startsWith('Current')?'var(--surface-base)':'transparent' }}>
                          <td style={{ padding:'0.65rem 0.75rem', color:k.startsWith('TOTAL')?'var(--text-primary)':k.startsWith('Current')?'var(--text-secondary)':'var(--text-secondary)', fontWeight:k.startsWith('TOTAL')?800:400 }}>{k}</td>
                          <td style={{ padding:'0.65rem 0.75rem', textAlign:'right', fontWeight:k.startsWith('TOTAL')?800:600, color:k.startsWith('TOTAL')?'#10b981':'inherit' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Liabilities */}
                <div>
                  <h4 style={{ color:'#ef4444', fontWeight:700, marginBottom:'1rem', padding:'0.5rem 0', borderBottom:'2px solid #ef4444', fontSize:'0.9rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>LIABILITIES & EQUITY</h4>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
                    <tbody>
                      {[
                        ['Current Liabilities',''],
                        ['  GST Payable (Output Tax)', `₹${fmtINR(pl.totalGst)}`],
                        ['  Accounts Payable (Expenses)', `₹${fmtINR(pl.totalExpenses)}`],
                        ['Equity',''],
                        ['  Retained Earnings (Net Profit)', `₹${fmtINR(pl.netProfit)}`],
                        ['TOTAL LIABILITIES + EQUITY', `₹${fmtINR(pl.totalRevenue)}`],
                      ].map(([k,v],i)=>(
                        <tr key={i} style={{ borderBottom:'1px solid var(--surface-border)', background:k.startsWith('TOTAL')||k==='Current Liabilities'||k==='Equity'?'var(--surface-base)':'transparent' }}>
                          <td style={{ padding:'0.65rem 0.75rem', color:'var(--text-secondary)', fontWeight:k.startsWith('TOTAL')?800:400 }}>{k}</td>
                          <td style={{ padding:'0.65rem 0.75rem', textAlign:'right', fontWeight:k.startsWith('TOTAL')?800:600, color:k.startsWith('TOTAL')?'#ef4444':'inherit' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{ marginTop:'1.5rem', padding:'1rem', background:'hsla(45,93%,47%,0.08)', borderRadius:'10px', border:'1px solid hsla(45,93%,47%,0.2)', fontSize:'0.83rem', color:'var(--text-secondary)' }}>
                ⚠️ This is a simplified balance sheet based on invoice and expense data. Verify with your CA for formal accounting purposes.
              </div>
            </div>
          )}

          {/* ── Day Book Tab ── */}
          {tab==='daybook' && (
            <div style={card}>
              <h3 style={{ marginBottom:'1.5rem', fontWeight:800, fontSize:'1.1rem' }}>Day Book / Cash Book — {MONTHS[month]} {year}</h3>
              {dayBook.length===0 ? (
                <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-secondary)' }}>
                  <BookOpen size={40} style={{ margin:'0 auto 1rem', opacity:0.3 }}/>
                  <p>No transactions recorded this month</p>
                </div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.87rem' }}>
                    <thead>
                      <tr style={{ background:'var(--surface-base)' }}>
                        {['Date','Description','Ref','Debit','Credit','Balance'].map(h=>(
                          <th key={h} style={{ padding:'0.75rem 0.9rem', textAlign:['Debit','Credit','Balance'].includes(h)?'right':'left', fontWeight:700, color:'var(--text-secondary)', fontSize:'0.78rem', textTransform:'uppercase' as const, borderBottom:'2px solid var(--surface-border)', whiteSpace:'nowrap' as const }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dayBook.map((e,i)=>(
                        <tr key={i} style={{ borderBottom:'1px solid var(--surface-border)', background:e.type==='expense'?'hsla(0,84%,60%,0.03)':'transparent' }}>
                          <td style={{ padding:'0.65rem 0.9rem', whiteSpace:'nowrap' as const }}>{e.date}</td>
                          <td style={{ padding:'0.65rem 0.9rem', maxWidth:'280px' }}>{e.description}</td>
                          <td style={{ padding:'0.65rem 0.9rem', fontFamily:'monospace', fontSize:'0.76rem', color:'var(--text-tertiary)' }}>{e.ref.slice(0,12)}</td>
                          <td style={{ padding:'0.65rem 0.9rem', textAlign:'right', color:e.debit?'#ef4444':'var(--text-tertiary)' }}>{e.debit?`₹${fmtINR(e.debit)}`:'—'}</td>
                          <td style={{ padding:'0.65rem 0.9rem', textAlign:'right', color:e.credit?'#10b981':'var(--text-tertiary)' }}>{e.credit?`₹${fmtINR(e.credit)}`:'—'}</td>
                          <td style={{ padding:'0.65rem 0.9rem', textAlign:'right', fontWeight:700, color:e.balance>=0?'#10b981':'#ef4444' }}>₹{fmtINR(e.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background:'var(--surface-base)', fontWeight:800, borderTop:'2px solid var(--surface-border)' }}>
                        <td colSpan={3} style={{ padding:'0.75rem 0.9rem' }}>CLOSING BALANCE</td>
                        <td style={{ padding:'0.75rem 0.9rem', textAlign:'right', color:'#ef4444' }}>₹{fmtINR(dayBook.reduce((s,e)=>s+e.debit,0))}</td>
                        <td style={{ padding:'0.75rem 0.9rem', textAlign:'right', color:'#10b981' }}>₹{fmtINR(dayBook.reduce((s,e)=>s+e.credit,0))}</td>
                        <td style={{ padding:'0.75rem 0.9rem', textAlign:'right', color:dayBook[dayBook.length-1]?.balance>=0?'#10b981':'#ef4444' }}>₹{fmtINR(dayBook[dayBook.length-1]?.balance||0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
