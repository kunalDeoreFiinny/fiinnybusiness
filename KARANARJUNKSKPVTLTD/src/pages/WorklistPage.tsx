import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileSpreadsheet, Store, Search, Filter, ArrowUpDown, ArrowUpRight, Users, Building2, UserPlus, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import Papa from 'papaparse';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection } from '../utils/tenantPath';
import UdhariUploadModal from '../components/UdhariUploadModal';
import { useSchema } from '../contexts/SchemaContext';
import DynamicTable from '../components/DynamicTable';

interface Retailer {
    id: string;
    name?: string;
    location?: string;
    number?: string;
    alternateNumber?: string;
    portfolioSize?: string;
    email?: string;
    bookName?: string;
    billBookPageNo?: string;
    createdAt?: any;
    totalSales?: number;
    totalPaid?: number;
    outstandingAmount?: number;
}

export default function WorklistPage() {
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const { t } = useTranslation();
    const { getSchema } = useSchema();
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUdhariModal, setShowUdhariModal] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterSize, setFilterSize] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    const paymentsFileRef = useRef<HTMLInputElement>(null);
    const followupsFileRef = useRef<HTMLInputElement>(null);
    const [uploadingCSV, setUploadingCSV] = useState(false);

    useEffect(() => {
        const fetchRetailers = async () => {
            if (!tenantId) return;
            try {
                const q = query(getTenantCollection(db, tenantId, 'retailers'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const retailersWithStatus: any[] = [];
                const chunkSize = 5;
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data.slice(i, i + chunkSize);
                    const chunkResults = await Promise.all(
                        chunk.map(async (r) => {
                            const ordersQ = query(getTenantCollection(db, tenantId, 'orders'), where('retailerId', '==', r.id));
                            const ordersSnap = await getDocs(ordersQ);
                            const orders = ordersSnap.docs.map(doc => doc.data());

                            const salesOrdersQ = query(getTenantCollection(db, tenantId, 'salesOrders'), where('retailerId', '==', r.id));
                            const salesOrdersSnap = await getDocs(salesOrdersQ);
                            const salesOrders = salesOrdersSnap.docs.map(doc => doc.data());

                            const hasPendingPos = orders.some(o => !o.isDelivered);
                            const hasPendingB2b = salesOrders.some(so => so.status === 'pending');
                            const isBrandNew = orders.length === 0 && salesOrders.length === 0;
                            const hasPending = isBrandNew || hasPendingPos || hasPendingB2b;
                            return { ...r, hasPendingOrders: hasPending };
                        })
                    );
                    retailersWithStatus.push(...chunkResults);
                }
                setRetailers(retailersWithStatus);
            } catch (error) {
                console.error('Error fetching retailers: ', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRetailers();
    }, []);

    const processedRetailers = useMemo(() => {
        let result = [...retailers];
        if (activeTab === 'active') result = result.filter(r => (r as any).hasPendingOrders);
        else result = result.filter(r => !(r as any).hasPendingOrders);

        if (searchTerm) {
            const ls = searchTerm.toLowerCase();
            result = result.filter(r =>
                r.name?.toLowerCase().includes(ls) ||
                r.location?.toLowerCase().includes(ls) ||
                r.number?.includes(searchTerm)
            );
        }
        if (filterSize !== 'All') result = result.filter(r => r.portfolioSize === filterSize);

        result.sort((a, b) => {
            if (sortBy === 'a-z') return (a.name || '').localeCompare(b.name || '');
            if (sortBy === 'z-a') return (b.name || '').localeCompare(a.name || '');
            const tA = a.createdAt?.toMillis?.() ?? 0;
            const tB = b.createdAt?.toMillis?.() ?? 0;
            return sortBy === 'oldest' ? tA - tB : tB - tA;
        });
        return result;
    }, [retailers, searchTerm, filterSize, sortBy, activeTab]);

    const handleExportCSV = () => {
        const schema = getSchema('retailers');
        if (!schema) return;
        const exportFields = schema.fields.filter(f => f.visibleInExport).sort((a, b) => a.order - b.order);
        const csvRows = processedRetailers.map(r =>
            exportFields.map(field => {
                const val = (r as any)[field.id];
                return `"${val !== undefined && val !== null ? val : ''}"`;
            }).join(',')
        );
        const csvContent = [exportFields.map(f => f.label).join(','), ...csvRows].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `karanarjun-worklist-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadTemplate = (type: 'payments' | 'followups') => {
        const csvContent = type === 'payments'
            ? 'Date,Stake holder,Amount,Payment Type,Pending Amount,Remarks\n2026-03-10,John Shop,5000,Cash,4000,Partial payment received\n'
            : 'KSK Name,Shop Owners,Shop Mobile Numbers,Products,Total Amount,Amount Paid,Delta Amount\nKaranArjun KSK,Doe Shop,9876543210,Fertilizer X,15000,5000,10000\n';
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', type === 'payments' ? 'payments_import_template.csv' : 'amounts_followups_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'payments' | 'followups') => {
        const file = event.target.files?.[0];
        if (!file || !tenantId) return;
        setUploadingCSV(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try { alert(`Parsed ${results.data.length} ${type} records.`); }
                catch { alert('Error processing CSV.'); }
                finally {
                    setUploadingCSV(false);
                    if (type === 'payments' && paymentsFileRef.current) paymentsFileRef.current.value = '';
                    if (type === 'followups' && followupsFileRef.current) followupsFileRef.current.value = '';
                }
            }
        });
    };

    const handlePrintUdhari = () => {
        const schema = getSchema('retailers');
        if (!schema) return;
        const printWindow = window.open('', '_blank', 'width=800,height=800');
        if (!printWindow) return;
        const exportFields = schema.fields.filter(f => f.visibleInExport).sort((a, b) => a.order - b.order);
        const rows = processedRetailers.map(r =>
            `<tr>${exportFields.map(f => { const v = (r as any)[f.id]; return `<td style="padding:8px;border:1px solid #ddd">${v ?? ''}</td>`; }).join('')}</tr>`
        ).join('');
        printWindow.document.write(`<html><head><title>Partner Worklist</title>
            <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;font-size:13px}th{padding:10px;border:1px solid #ddd;background:#f8f9fa;text-align:left}@media print{button{display:none}}</style>
            </head><body><h2 style="text-align:center;margin:0">KaranArjun KSK - Partner Worklist</h2>
            <p style="text-align:center;color:#555;font-size:13px">Generated: ${new Date().toLocaleString()} | ${processedRetailers.length} records</p>
            <table><thead><tr>${exportFields.map(f => `<th>${f.label}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
            <script>setTimeout(()=>window.print(),400)</script></body></html>`);
        printWindow.document.close();
    };

    const kpi = useMemo(() => {
        const total = retailers.length;
        const active = retailers.filter(r => (r as any).hasPendingOrders).length;
        return {
            total, active, cleared: total - active,
            big: retailers.filter(r => r.portfolioSize === 'Big').length,
            medium: retailers.filter(r => r.portfolioSize === 'Medium').length,
            small: retailers.filter(r => r.portfolioSize === 'Small').length,
        };
    }, [retailers]);

    const sizeColor = (size?: string) =>
        size === 'Big' ? '#0ea5e9' : size === 'Medium' ? '#f59e0b' : '#10b981';

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="primary-gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <Building2 size={28} /> Partner Worklist
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>B2B wholesale partners — orders, dues and follow-ups.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input type="file" accept=".csv" ref={paymentsFileRef} style={{ display: 'none' }} onChange={e => handleCSVUpload(e, 'payments')} />
                    <input type="file" accept=".csv" ref={followupsFileRef} style={{ display: 'none' }} onChange={e => handleCSVUpload(e, 'followups')} />
                    <button className="btn btn-secondary btn-sm tooltip" data-tooltip="Payments CSV Template" onClick={() => downloadTemplate('payments')}><Download size={13} /> T1</button>
                    <button className="btn btn-secondary btn-sm" disabled={uploadingCSV} onClick={() => paymentsFileRef.current?.click()}><FileSpreadsheet size={14} /> Payments</button>
                    <button className="btn btn-secondary btn-sm tooltip" data-tooltip="Followups CSV Template" onClick={() => downloadTemplate('followups')}><Download size={13} /> T2</button>
                    <button className="btn btn-secondary btn-sm" disabled={uploadingCSV} onClick={() => followupsFileRef.current?.click()}><FileSpreadsheet size={14} /> Followups</button>
                    <button className="btn btn-secondary" onClick={handlePrintUdhari} disabled={processedRetailers.length === 0}><Download size={16} /> Print</button>
                    <button className="btn btn-secondary" onClick={handleExportCSV} disabled={processedRetailers.length === 0}><Download size={16} /> {t('worklist.export_csv')}</button>
                    <button className="btn btn-primary" onClick={() => navigate('/onboarding')}><UserPlus size={16} /> {t('worklist.add_new')}</button>
                </div>
            </div>

            {/* KPI Cards */}
            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Partners',    value: kpi.total,   icon: Users,        border: '#38bdf8', bg: 'rgba(56,189,248,0.07)' },
                        { label: 'Active / Pending',  value: kpi.active,  icon: AlertCircle,  border: '#f59e0b', bg: 'rgba(245,158,11,0.07)' },
                        { label: 'Cleared',           value: kpi.cleared, icon: CheckCircle2, border: '#10b981', bg: 'rgba(16,185,129,0.07)' },
                        { label: 'Big Distributors',  value: kpi.big,     icon: TrendingUp,   border: '#0ea5e9', bg: 'rgba(14,165,233,0.07)' },
                        { label: 'Medium Retailers',  value: kpi.medium,  icon: Store,        border: '#a78bfa', bg: 'rgba(167,139,250,0.07)' },
                        { label: 'Small Retailers',   value: kpi.small,   icon: Building2,    border: '#34d399', bg: 'rgba(52,211,153,0.07)' },
                    ].map(c => (
                        <div key={c.label} className="glass-panel" style={{ padding: '1rem 1.25rem', borderLeft: `4px solid ${c.border}`, background: c.bg }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{c.label}</p>
                                    <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.75rem', color: c.border }}>{c.value}</h2>
                                </div>
                                <div style={{ background: `${c.border}22`, borderRadius: '10px', padding: '0.55rem', flexShrink: 0 }}>
                                    <c.icon size={18} color={c.border} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters Bar */}
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {([['active', '⏳ Active'], ['history', '✅ Cleared']] as const).map(([val, label]) => (
                        <button key={val} onClick={() => setActiveTab(val)}
                            style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: `1px solid ${activeTab === val ? 'var(--primary-light)' : 'var(--surface-border)'}`, background: activeTab === val ? 'var(--primary-light)' : 'transparent', color: activeTab === val ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                            {label}
                        </button>
                    ))}
                </div>
                <div style={{ flex: '1 1 240px', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input type="text" placeholder={t('worklist.search_worklist_placeholder')} className="input-field"
                        style={{ paddingLeft: '2.2rem', margin: 0, height: '38px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface-base)', padding: '0.25rem 0.75rem', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
                    <Filter size={14} color="var(--text-secondary)" />
                    <select value={filterSize} onChange={e => setFilterSize(e.target.value)} style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', padding: '0.35rem 0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <option value="All">{t('worklist.all_sizes')}</option>
                        <option value="Big">{t('onboarding.big_distributor')}</option>
                        <option value="Medium">{t('onboarding.medium_retailer')}</option>
                        <option value="Small">{t('onboarding.small_retailer')}</option>
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface-base)', padding: '0.25rem 0.75rem', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
                    <ArrowUpDown size={14} color="var(--text-secondary)" />
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', padding: '0.35rem 0.25rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <option value="newest">{t('worklist.newest_first')}</option>
                        <option value="oldest">{t('worklist.oldest_first')}</option>
                        <option value="a-z">{t('worklist.name_az')}</option>
                        <option value="z-a">{t('worklist.name_za')}</option>
                    </select>
                </div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginLeft: 'auto' }}>{processedRetailers.length} partners</span>
            </div>

            {/* List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>{t('common.loading')}</div>
            ) : processedRetailers.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                    <Store size={48} color="var(--surface-border)" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
                    <h3>{t('worklist.no_retailers_found')}</h3>
                    <p>{t('worklist.no_retailers_found_desc')}</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/onboarding')}>
                        <UserPlus size={16} /> Onboard a Partner
                    </button>
                </div>
            ) : (
                <>
                    {/* Partner Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {processedRetailers.map(r => {
                            const hasPending = (r as any).hasPendingOrders;
                            const color = sizeColor(r.portfolioSize);
                            return (
                                <div key={r.id} className="glass-panel" onClick={() => navigate(`/worklist/${r.id}`)}
                                    style={{ cursor: 'pointer', padding: '1.25rem', borderLeft: `4px solid ${color}`, transition: 'transform 0.15s, box-shadow 0.15s', position: 'relative', overflow: 'hidden' }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                    <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: hasPending ? '#f59e0b22' : '#10b98122', color: hasPending ? '#f59e0b' : '#10b981', padding: '0.15rem 0.6rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700 }}>
                                        {hasPending ? '⏳ Pending' : '✅ Cleared'}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Store size={22} color={color} />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name || 'Unnamed Partner'}</h3>
                                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>📍 {r.location || '—'}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', fontSize: '0.8rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
                                        <span>📞 {r.number || '—'}</span>
                                        <span style={{ marginLeft: 'auto', background: `${color}22`, color, padding: '0.1rem 0.5rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.72rem' }}>
                                            {r.portfolioSize || 'Small'}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'flex-end' }}>
                                        <span style={{ color: 'var(--primary-light)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            View Details <ArrowUpRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Collapsible tabular view */}
                    <details style={{ marginTop: '0.5rem' }}>
                        <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem 0', userSelect: 'none' }}>
                            📋 Show tabular / export view
                        </summary>
                        <div style={{ marginTop: '1rem' }}>
                            <DynamicTable moduleId="retailers" data={processedRetailers}
                                onRowClick={(row) => navigate(`/worklist/${row.id}`)}
                                actionsRef={() => <ArrowUpRight size={20} color="var(--primary-light)" />} />
                        </div>
                    </details>
                </>
            )}

            <UdhariUploadModal isOpen={showUdhariModal} onClose={() => setShowUdhariModal(false)} onSuccess={() => window.location.reload()} />
        </div>
    );
}
