import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileSpreadsheet, Store, Search, Filter, ArrowUpDown, ArrowUpRight } from 'lucide-react';
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

    // Advanced features state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSize, setFilterSize] = useState('All');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, a-z, z-a
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    // File inputs for Bulk imports
    const paymentsFileRef = useRef<HTMLInputElement>(null);
    const followupsFileRef = useRef<HTMLInputElement>(null);
    const [uploadingCSV, setUploadingCSV] = useState(false);

    useEffect(() => {
        const fetchRetailers = async () => {
            if (!tenantId) return;
            try {
                // Fetch all by newest first initially 
                const q = query(getTenantCollection(db, tenantId, 'retailers'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Fetch pending status for each retailer using the unified orders collection
                const retailersWithStatus = await Promise.all(
                    data.map(async (r) => {
                        const ordersQ = query(
                            getTenantCollection(db, tenantId, 'orders'),
                            where('retailerId', '==', r.id)
                        );
                        const ordersSnap = await getDocs(ordersQ);
                        const orders = ordersSnap.docs.map(doc => doc.data());
                        
                        // Fetch salesOrders (B2B Invoices) to see if there are any pending there
                        const salesOrdersQ = query(
                            getTenantCollection(db, tenantId, 'salesOrders'),
                            where('retailerId', '==', r.id)
                        );
                        const salesOrdersSnap = await getDocs(salesOrdersQ);
                        const salesOrders = salesOrdersSnap.docs.map(doc => doc.data());

                        // Retailer has pending if any POS order is NOT delivered, or any B2B invoice is pending,
                        // or if they just have 0 POS orders AND 0 B2B invoices (new retailer).
                        const hasPendingPos = orders.some(o => !o.isDelivered);
                        const hasPendingB2b = salesOrders.some(so => so.status === 'pending');
                        const isBrandNew = orders.length === 0 && salesOrders.length === 0;

                        const hasPending = isBrandNew || hasPendingPos || hasPendingB2b;
                        return { ...r, hasPendingOrders: hasPending };
                    })
                );

                setRetailers(retailersWithStatus);
            } catch (error) {
                console.error("Error fetching retailers: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRetailers();
    }, []);

    // Derived state for filtering and sorting
    const processedRetailers = useMemo(() => {
        let result = [...retailers];

        // 0. Tab Filter
        if (activeTab === 'active') {
            result = result.filter(r => (r as any).hasPendingOrders);
        } else {
            result = result.filter(r => !(r as any).hasPendingOrders);
        }

        // 1. Search Filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(r =>
                r.name?.toLowerCase().includes(lowerSearch) ||
                r.location?.toLowerCase().includes(lowerSearch) ||
                r.number?.includes(searchTerm)
            );
        }

        // 2. Portfolio Size Filter
        if (filterSize !== 'All') {
            result = result.filter(r => r.portfolioSize === filterSize);
        }

        // 3. Sorting
        result.sort((a, b) => {
            if (sortBy === 'a-z') {
                return (a.name || '').localeCompare(b.name || '');
            } else if (sortBy === 'z-a') {
                return (b.name || '').localeCompare(a.name || '');
            } else if (sortBy === 'oldest') {
                const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return timeA - timeB;
            } else {
                // newest (default via initial fetch, but explicit here in case of changes)
                const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return timeB - timeA;
            }
        });

        return result;
    }, [retailers, searchTerm, filterSize, sortBy]);

    const handleExportCSV = () => {
        const schema = getSchema('retailers');
        if (!schema) return;

        const exportFields = schema.fields.filter(f => f.visibleInExport).sort((a, b) => a.order - b.order);
        const headers = exportFields.map(f => f.label);

        // Convert data to CSV format
        const csvRows = processedRetailers.map(r => {
            return exportFields.map(field => {
                const val = (r as any)[field.id];
                return `"${val !== undefined && val !== null ? val : ''}"`;
            }).join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');

        // Trigger download with BOM for Excel compatibility
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `karanarjun-worklist-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Phase 10 CSV Imports ---

    const downloadTemplate = (type: 'payments' | 'followups') => {
        let csvContent = "";
        let filename = "";

        if (type === 'payments') {
            csvContent = "Date,Stake holder,Amount,Stake Holders,Payment Type,Transaction Date,Amount debited,Extra Payment DOne,Pending Amount,Remarks\n" +
                "2026-03-10,John Shop,5000,Owner Name,Cash,2026-03-09,1000,0,4000,Partial payment received\n";
            filename = "payments_import_template.csv";
        } else {
            csvContent = "KSK Name,Shop Owners,Shop Mobile Numbers,Products,Quantity (Box),Total Amount,Amount Paid,Delta Amount,PDF Shop Owner,My transaction Details,Mob No\n" +
                "KaranArjun KSK,Doe Shop,9876543210,Fertilizer X,10,15000,5000,10000,Attached,UPI TR123,9876543210\n";
            filename = "amounts_followups_template.csv";
        }

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'payments' | 'followups') => {
        const file = event.target.files?.[0];
        if (!file || !tenantId) return;

        setUploadingCSV(true);
        // Note: For a fully functioning upload mapping in Phase 10, one would query retailers by matching standard columns (like Shop Mobile Numbers) 
        // to subcollections (transactions/followups). For now, we simulate parsing and success to demonstrate the UI capability request.
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    let count = results.data.length;
                    alert(`Phase 10: Successfully parsed ${count} ${type} records from CSV!\n(Integration into subcollections pending exact data-matching strategy)`);
                } catch (error) {
                    console.error("Upload error:", error);
                    alert("Error processing CSV upload.");
                } finally {
                    setUploadingCSV(false);
                    if (type === 'payments' && paymentsFileRef.current) paymentsFileRef.current.value = '';
                    if (type === 'followups' && followupsFileRef.current) followupsFileRef.current.value = '';
                }
            }
        });
    };

    // -------------------------

    const handlePrintUdhari = () => {
        const schema = getSchema('retailers');
        if (!schema) return;

        const printWindow = window.open('', '_blank', 'width=800,height=800');
        if (!printWindow) return;

        const exportFields = schema.fields.filter(f => f.visibleInExport).sort((a, b) => a.order - b.order);
        const dateStr = new Date().toLocaleString();

        const rows = processedRetailers.map(r => {
            const tds = exportFields.map(field => {
                const val = (r as any)[field.id];
                return `<td style="padding: 8px; border: 1px solid #ddd;">${val !== undefined && val !== null ? val : ''}</td>`;
            }).join('');
            return `<tr>${tds}</tr>`;
        }).join('');

        const headersHtml = exportFields.map(f => `<th>${f.label}</th>`).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print List</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 20px; color: black; background: white; }
                        h2 { text-align: center; margin: 0; font-size: 24px; }
                        p { text-align: center; margin: 5px 0 20px 0; font-size: 14px; color: #555; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
                        th { padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa; text-align: left; }
                        @media print {
                            body { margin: 0; padding: 15mm; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h2>KaranArjun KSK - Dynamics List</h2>
                    <p>Generated on: ${dateStr} | Total Records: ${processedRetailers.length}</p>
                    <table>
                        <thead>
                            <tr>${headersHtml}</tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                    <script>
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="primary-gradient-text" style={{ fontSize: '2rem' }}>{t('worklist.worklist_title')}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('worklist.worklist_desc')}</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'var(--surface-raised)', borderRadius: '10px', padding: '0.25rem', border: '1px solid var(--surface-border)' }}>
                        <button
                            onClick={() => setActiveTab('active')}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
                                background: activeTab === 'active' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'active' ? 'white' : 'var(--text-secondary)'
                            }}
                        >
                            {t('worklist.active_worklist')}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
                                background: activeTab === 'history' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'history' ? 'white' : 'var(--text-secondary)'
                            }}
                        >
                            {t('worklist.history')}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--surface-raised)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                        <input type="file" accept=".csv" ref={paymentsFileRef} style={{ display: 'none' }} onChange={e => handleCSVUpload(e, 'payments')} />
                        <button className="btn btn-secondary btn-sm tooltip" data-tooltip="Payments CSV Template" onClick={() => downloadTemplate('payments')}>
                            <Download size={14} /> T1
                        </button>
                        <button className="btn btn-secondary btn-sm" disabled={uploadingCSV} onClick={() => paymentsFileRef.current?.click()}>
                            <FileSpreadsheet size={16} /> Import Payments
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--surface-raised)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                        <input type="file" accept=".csv" ref={followupsFileRef} style={{ display: 'none' }} onChange={e => handleCSVUpload(e, 'followups')} />
                        <button className="btn btn-secondary btn-sm tooltip" data-tooltip="Followups CSV Template" onClick={() => downloadTemplate('followups')}>
                            <Download size={14} /> T2
                        </button>
                        <button className="btn btn-secondary btn-sm" disabled={uploadingCSV} onClick={() => followupsFileRef.current?.click()}>
                            <FileSpreadsheet size={16} /> Import Followups
                        </button>
                    </div>

                    <button className="btn btn-secondary animate-pulse" onClick={handlePrintUdhari} disabled={processedRetailers.length === 0}>
                        <Download size={18} /> Print List
                    </button>
                    <button className="btn btn-secondary animate-pulse" onClick={handleExportCSV} disabled={processedRetailers.length === 0}>
                        <Download size={18} /> {t('worklist.export_csv')}
                    </button>
                    <button className="btn btn-primary animate-pulse" onClick={() => navigate('/onboarding')}>
                        {t('worklist.add_new')}
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: '1 1 300px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        placeholder={t('worklist.search_worklist_placeholder')}
                        className="input-field"
                        style={{ paddingLeft: '2.5rem', margin: 0 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'hsla(220, 20%, 10%, 0.5)', padding: '0.25rem 0.5rem 0.25rem 1rem', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
                        <Filter size={16} color="var(--text-secondary)" />
                        <select
                            value={filterSize}
                            onChange={(e) => setFilterSize(e.target.value)}
                            style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', padding: '0.5rem', cursor: 'pointer', appearance: 'auto' }}
                        >
                            <option value="All">{t('worklist.all_sizes')}</option>
                            <option value="Big">{t('onboarding.big_distributor')}</option>
                            <option value="Medium">{t('onboarding.medium_retailer')}</option>
                            <option value="Small">{t('onboarding.small_retailer')}</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'hsla(220, 20%, 10%, 0.5)', padding: '0.25rem 0.5rem 0.25rem 1rem', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
                        <ArrowUpDown size={16} color="var(--text-secondary)" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', padding: '0.5rem', cursor: 'pointer', appearance: 'auto' }}
                        >
                            <option value="newest">{t('worklist.newest_first')}</option>
                            <option value="oldest">{t('worklist.oldest_first')}</option>
                            <option value="a-z">{t('worklist.name_az')}</option>
                            <option value="z-a">{t('worklist.name_za')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    {t('common.loading')}
                </div>
            ) : processedRetailers.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                    <Store size={48} color="var(--surface-border)" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
                    <h3>{t('worklist.no_retailers_found')}</h3>
                    <p>{t('worklist.no_retailers_found_desc')}</p>
                </div>
            ) : (
                <DynamicTable
                    moduleId="retailers"
                    data={processedRetailers}
                    onRowClick={(row) => navigate(`/worklist/${row.id}`)}
                    actionsRef={() => (
                        <ArrowUpRight size={20} color="var(--primary-light)" />
                    )}
                />
            )}

            <UdhariUploadModal
                isOpen={showUdhariModal}
                onClose={() => setShowUdhariModal(false)}
                onSuccess={() => {
                    // Page normally auto-updates because of snap or just refetch
                    window.location.reload();
                }}
            />
        </div>
    );
}
