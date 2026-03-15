import { useState, useEffect } from 'react';
import { Save, Loader2, Printer } from 'lucide-react';
import {
    query, onSnapshot, addDoc,
    serverTimestamp, updateDoc,
    runTransaction, getDoc, getDocs, limit, orderBy, where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { fetchInvoiceTemplate, fetchInvoiceBranding } from '../services/invoiceTemplateService';

interface Product {
    id: string;
    name: string;
    maxRetailPrice: number;
    retailerPrice: number;
    sellingPrice: number;
    boxCapacity: number;
    baseUnit: string;
    quantity: number;
    loosePieces: number;
    gstPct?: number;
}

interface PosRow {
    productId: string;
    productName: string;
    packing: string;
    rate: string;
    quantity: string;
    total: number;
    notes?: string;
}

export default function POSPage() {
    const { tenantId } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const [headerData, setHeaderData] = useState({
        lcfRd: '',
        gsin: '',
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        customerMobile: '',
        address: '',
        pin: ''
    });

    const [templateFields, setTemplateFields] = useState<any[]>([]);
    const [branding, setBranding] = useState<any>(null);
    const [nextBillNumber, setNextBillNumber] = useState<string>('');

    // 14 Fixed Rows
    const [rows, setRows] = useState<PosRow[]>(
        Array.from({ length: 14 }, () => ({
            productId: '',
            productName: '',
            packing: '',
            rate: '',
            quantity: '',
            total: 0
        }))
    );

    const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!tenantId) return;

        // Fetch Products for dropdown
        const qProducts = query(getTenantCollection(db, tenantId, 'products'));
        const unsubProducts = onSnapshot(qProducts, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
        });

        const loadSettings = async () => {
            try {
                const [tmpl, brd] = await Promise.all([
                    fetchInvoiceTemplate(tenantId, 'retailer_customer'),
                    fetchInvoiceBranding(tenantId)
                ]);
                const sortedFields = tmpl.fields.filter(f => f.show).sort((a, b) => a.order - b.order);
                setTemplateFields(sortedFields);
                setBranding(brd);

                const counterRef = getTenantDoc(db, tenantId, 'counters', 'posBillCounter');
                const counterSnap = await getDoc(counterRef);
                let currentSeq = 0;
                if (counterSnap.exists()) {
                    currentSeq = counterSnap.data().lastBillNumber || 0;
                }
                setNextBillNumber(`KA-${(currentSeq + 1).toString().padStart(4, '0')}`);

                setHeaderData(prev => ({
                    ...prev,
                    lcfRd: brd.licenseNumbers || prev.lcfRd,
                    gsin: brd.gstin || prev.gsin,
                }));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();

        return () => {
            unsubProducts();
        };
    }, [tenantId]);

    const handleRowChange = (index: number, field: keyof PosRow, value: string) => {
        const newRows = [...rows];

        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                newRows[index].productId = value;
                newRows[index].productName = product.name;
                // Determine rate (using sellingPrice natively or maxRetailPrice)
                const rate = product.sellingPrice || product.retailerPrice || product.maxRetailPrice || 0;
                newRows[index].rate = rate.toString();
                newRows[index].packing = product.baseUnit || ''; // e.g. "ML" or "KG"

                const qty = Number(newRows[index].quantity) || 0;
                newRows[index].total = rate * qty;
            } else {
                newRows[index].productId = '';
                newRows[index].productName = '';
                newRows[index].rate = '';
                newRows[index].packing = '';
                newRows[index].total = 0;
            }
        } else {
            // Provide a manual fallback for productName if they just type
            if (field === 'productName' && value) {
                newRows[index].productId = ''; // custom product
                newRows[index].productName = value;
            } else {
                (newRows[index][field] as string) = value;
            }

            if (field === 'rate' || field === 'quantity') {
                const r = Number(newRows[index].rate) || 0;
                const q = Number(newRows[index].quantity) || 0;
                newRows[index].total = r * q;
            }
        }

        setRows(newRows);
    };

    const handlePhoneBlur = async () => {
        if (!tenantId || !headerData.customerMobile || headerData.customerMobile.length < 5) return;
        try {
            // Priority 1: Check Master Retailers List
            const retailerQuery = query(
                getTenantCollection(db, tenantId, 'retailers'),
                where('number', '==', headerData.customerMobile),
                limit(1)
            );
            const retailerSnaps = await getDocs(retailerQuery);
            
            if (!retailerSnaps.empty) {
                const data = retailerSnaps.docs[0].data();
                setHeaderData(prev => ({
                    ...prev,
                    customerName: data.name || prev.customerName,
                    address: data.atPost || prev.address,
                    pin: data.pin || prev.pin
                }));
                return; // Finished
            }

            // Priority 2: Fallback to searching past orders if they were a walk-in before the master list update
            const orderQuery = query(
                getTenantCollection(db, tenantId, 'salesOrders'),
                where('phoneNumber', '==', headerData.customerMobile),
                orderBy('createdAt', 'desc'),
                limit(1)
            );
            const orderSnaps = await getDocs(orderQuery);
            if (!orderSnaps.empty) {
                const data = orderSnaps.docs[0].data();
                setHeaderData(prev => ({
                    ...prev,
                    customerName: data.retailerName || prev.customerName,
                    address: data.address || prev.address,
                    pin: data.pin || prev.pin
                }));
            }
        } catch (err) {
            console.error("Error fetching customer config by phone:", err);
            // Ignore index errors if composite index isn't ready yet, or fail silently
        }
    };

    const grandTotal = rows.reduce((sum, row) => sum + (row.total || 0), 0);

    const generateBillNumber = async (): Promise<string> => {
        if (!tenantId) return `POS-${Date.now().toString().slice(-6)}`;

        const counterRef = getTenantDoc(db, tenantId, 'counters', 'posBillCounter');
        let newSeq = 1;
        try {
            await runTransaction(db, async (transaction) => {
                const docSnap = await transaction.get(counterRef);
                if (!docSnap.exists()) {
                    transaction.set(counterRef, { lastBillNumber: 1 });
                    newSeq = 1;
                } else {
                    newSeq = (docSnap.data().lastBillNumber || 0) + 1;
                    transaction.update(counterRef, { lastBillNumber: newSeq });
                }
            });
        } catch (e) {
            console.error("Counter transaction failed", e);
            return `POS-${Date.now().toString().slice(-6)}`;
        }
        return `KA-${newSeq.toString().padStart(4, '0')}`;
    };

    const handleSave = async (isPrint = false) => {
        if (!tenantId) return;
        setIsProcessing(true);

        try {
            const activeRows = rows.filter(r => r.productName || r.quantity || r.rate);
            if (activeRows.length === 0) {
                alert("Please add at least one item.");
                setIsProcessing(false);
                return;
            }

            const billNumber = await generateBillNumber();

            // Format line items
            const lineItems = activeRows.map(row => ({
                productId: row.productId,
                productName: row.productName,
                quantity: Number(row.quantity) || 0,
                unit: row.packing,
                amount: row.total,
                mrp: Number(row.rate) || 0,
                gstPct: 0
            }));

            // Save Order Document
            await addDoc(getTenantCollection(db, tenantId, 'salesOrders'), {
                orderNumber: billNumber,
                retailerId: 'walk-in',
                retailerName: headerData.customerName || 'Walk-in Customer',
                phoneNumber: headerData.customerMobile,
                lcfRd: headerData.lcfRd,
                gsin: headerData.gsin,
                address: headerData.address,
                pin: headerData.pin,
                lineItems,
                subtotal: grandTotal,
                gstAmount: 0,
                grandTotal: grandTotal,
                paymentStatus: 'Paid',
                amountPaid: grandTotal,
                status: 'delivered',
                createdAt: serverTimestamp(),
                notes: 'POS B2C Form Entry',
                invoiceDate: headerData.date
            });

            // Automatically Register Walk-in Customer into Master Retailers list if Phone is provided
            if (headerData.customerMobile && headerData.customerMobile.length >= 5) {
                const rQuery = query(
                    getTenantCollection(db, tenantId, 'retailers'),
                    where('number', '==', headerData.customerMobile),
                    limit(1)
                );
                const rSnaps = await getDocs(rQuery);
                if (rSnaps.empty) {
                    await addDoc(getTenantCollection(db, tenantId, 'retailers'), {
                        name: headerData.customerName || 'Walk-in Customer',
                        number: headerData.customerMobile,
                        atPost: headerData.address || '',
                        district: '',
                        taluka: '',
                        pin: headerData.pin || '',
                        status: 'active',
                        createdAt: serverTimestamp(),
                        source: 'POS'
                    });
                }
            }

            // Update Inventory
            for (const item of activeRows) {
                if (!item.productId) continue;
                const productRef = getTenantDoc(db, tenantId, 'products', item.productId);
                const product = products.find(p => p.id === item.productId);
                const qty = Number(item.quantity) || 0;

                if (product && qty > 0) {
                    // Deduct as LOOSE PIECES
                    let newLoose = (product.loosePieces || 0) - qty;
                    let newBoxes = product.quantity || 0;
                    while (newLoose < 0 && newBoxes > 0) {
                        newBoxes -= 1;
                        newLoose += (product.boxCapacity || 1);
                    }
                    await updateDoc(productRef, {
                        quantity: newBoxes >= 0 ? newBoxes : 0,
                        loosePieces: newBoxes >= 0 ? newLoose : 0
                    });
                }
            }

            const resetForm = () => {
                setHeaderData({
                    ...headerData,
                    customerName: '',
                    customerMobile: '',
                    address: '',
                    pin: ''
                });
                setRows(Array.from({ length: 14 }, () => ({
                    productId: '', productName: '', packing: '', rate: '', quantity: '', total: 0
                })));
                setNextBillNumber(`KA-${(parseInt(billNumber.split('-')[1] || '0') + 1).toString().padStart(4, '0')}`);
            };

            if (!isPrint) {
                alert(`Bill ${billNumber} created successfully!`);
                resetForm();
                setIsProcessing(false);
            } else {
                // Allow React to clear the processing state spinner before printing
                setIsProcessing(false);
                setTimeout(() => {
                    window.print();
                    resetForm();
                }, 100);
            }

        } catch (error) {
            console.error("Save Error:", error);
            alert("Error saving the bill.");
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin m-auto" /></div>;

    return (
        <div style={{ background: 'var(--surface-base)', padding: '2rem', minHeight: '100vh' }} className="pos-page-wrapper">
            <div style={{ 
                padding: '1.5rem', 
                maxWidth: '1000px', 
                margin: '0 auto', 
                background: '#fff', 
                color: '#000', 
                fontFamily: 'serif',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05), 0 20px 48px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.1)',
                borderRadius: '16px',
                border: '1px solid var(--surface-border)'
            }} className="pos-print-container">
            {/* Styles for print mode */}
            <style>{`
                @media print {
                    .pos-print-container {
                        width: 100%;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                    }
                    /* Reduce table heights & paddings to squeeze into 1 page */
                    .pos-box {
                        padding: 2px !important;
                    }
                    .pos-table th, .pos-table td {
                        padding: 2px !important;
                        height: 24px !important;
                        font-size: 0.85rem !important;
                    }
                    .pos-input {
                        font-size: 0.85rem !important;
                    }
                    h1 {
                        font-size: 1.25rem !important;
                        margin-bottom: 4px !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .pos-page-wrapper {
                        padding: 0 !important;
                        background: transparent !important;
                    }
                    input, select, textarea {
                        border: none !important;
                        background: transparent !important;
                        -webkit-appearance: none;
                        -moz-appearance: none;
                        appearance: none;
                        font-family: inherit;
                        font-size: inherit;
                        color: #000;
                        padding: 0;
                    }
                    /* Ensure dropdown arrows are hidden during print */
                    select {
                        background-image: none !important;
                    }
                }
                .pos-table th, .pos-table td {
                    border: 1px solid #000;
                    padding: 4px;
                    text-align: center;
                }
                .pos-input {
                    width: 100%;
                    border: none;
                    background: transparent;
                    outline: none;
                    font-family: inherit;
                    color: inherit;
                }
                .pos-box {
                    border: 1px solid #000;
                }
                .pos-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    max-height: 200px;
                    overflow-y: auto;
                    background: #fff;
                    border: 1px solid #ccc;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    z-index: 1000;
                }
                .pos-dropdown-item {
                    padding: 8px;
                    cursor: pointer;
                    text-align: left;
                    font-size: 0.9rem;
                    border-bottom: 1px solid #eee;
                }
                .pos-dropdown-item:hover {
                    background-color: #f0f0f0;
                }
                /* Print button specific colors so they show well on standard dark/light themes */
                .print-btn {
                    background-color: #2196F3 !important;
                    color: white !important;
                    border: none;
                }
                .save-btn {
                    background-color: #4CAF50 !important;
                    color: white !important;
                    border: none;
                }
            `}</style>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                Credit Memo
            </div>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {branding ? `${branding.businessName}${branding.address ? ` - ${branding.address}` : ''}` : 'Karan Arjun Krushi Seva Kendra Mob No : 9307199040'}
                </h1>
            </div>

            {/* Header info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 1fr', gap: '0', marginBottom: '8px' }}>
                <div className="pos-box" style={{ padding: '4px', fontWeight: 'bold', borderRight: 'none', borderBottom: 'none' }}>LCF RD :</div>
                <div className="pos-box" style={{ padding: '4px', borderRight: 'none', borderBottom: 'none' }}><input className="pos-input" value={headerData.lcfRd} onChange={e => setHeaderData({ ...headerData, lcfRd: e.target.value })} /></div>

                <div className="pos-box" style={{ padding: '4px', fontWeight: 'bold', borderRight: 'none', borderBottom: 'none' }}>GSIN :</div>
                <div className="pos-box" style={{ padding: '4px', borderBottom: 'none' }}><input className="pos-input" value={headerData.gsin} onChange={e => setHeaderData({ ...headerData, gsin: e.target.value })} /></div>

                <div className="pos-box" style={{ padding: '4px', fontWeight: 'bold', borderRight: 'none', borderBottom: 'none' }}>Bill No :</div>
                <div className="pos-box" style={{ padding: '4px', borderRight: 'none', borderBottom: 'none' }}>
                    <div className="pos-input" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>{nextBillNumber || 'Auto-generated'}</div>
                </div>

                <div className="pos-box" style={{ padding: '4px', fontWeight: 'bold', borderRight: 'none', borderBottom: 'none' }}>Date :</div>
                <div className="pos-box" style={{ padding: '4px', borderBottom: 'none' }}><input type="date" className="pos-input" value={headerData.date} onChange={e => setHeaderData({ ...headerData, date: e.target.value })} /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 3fr', gap: '0', marginBottom: '8px', marginTop: '-8px' }}>
                <div className="pos-box" style={{ padding: '2px', fontWeight: 'bold', borderRight: 'none', height: '28px', display: 'flex', alignItems: 'center' }}>Customer Signature</div>
                <div className="pos-box" style={{ padding: '2px', borderBottom: 'none' }}></div>

                <div className="pos-box" style={{ padding: '2px', fontWeight: 'bold', borderRight: 'none', borderTop: 'none', height: '28px', display: 'flex', alignItems: 'center' }}>Seller Signature</div>
                <div className="pos-box" style={{ padding: '2px' }}></div>
            </div>

            {/* Customer Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 200px', marginBottom: '8px', alignItems: 'center' }}>
                <div className="pos-box" style={{ padding: '6px', fontWeight: 'bold', borderRight: 'none', textAlign: 'center' }}>Name</div>
                <div className="pos-box" style={{ padding: '6px', borderRight: 'none' }}><input className="pos-input" value={headerData.customerName} onChange={e => setHeaderData({ ...headerData, customerName: e.target.value })} /></div>
                <div className="pos-box" style={{ padding: '6px', fontWeight: 'bold', borderRight: 'none', textAlign: 'center' }}>Mob No :</div>
                <div className="pos-box" style={{ padding: '6px' }}><input className="pos-input" value={headerData.customerMobile} onBlur={handlePhoneBlur} onChange={e => setHeaderData({ ...headerData, customerMobile: e.target.value })} /></div>
            </div>

            {/* Products Table */}
            <table className="pos-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                <thead>
                    <tr style={{ fontWeight: 'bold', background: '#f9f9f9' }}>
                        <th style={{ width: '60px' }}>Sr No</th>
                        {templateFields.map(f => (
                            <th key={f.id} style={{ width: f.sourceKey === 'productName' ? 'auto' : '100px' }}>
                                {f.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={idx}>
                            <td>{idx + 1}</td>
                            {templateFields.map(field => {
                                if (field.sourceKey === 'productName') {
                                    return (
                                        <td key={field.id} style={{ textAlign: 'left' }}>
                                            <div style={{ position: 'relative', display: 'flex' }}>
                                                <input
                                                    className="pos-input"
                                                    value={row.productName}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        handleRowChange(idx, 'productName', val);
                                                        if (val.length > 0) setActiveRowIndex(idx);
                                                        else setActiveRowIndex(null);
                                                    }}
                                                    onFocus={() => row.productName.length > 0 && setActiveRowIndex(idx)}
                                                    onBlur={() => setTimeout(() => setActiveRowIndex(null), 200)}
                                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                                    placeholder="Search product..."
                                                />
                                                {activeRowIndex === idx && (
                                                    <div className="pos-dropdown no-print">
                                                        {products
                                                            .filter(p => p.name.toLowerCase().includes(row.productName.toLowerCase()))
                                                            .slice(0, 50) // limit items to avoid rendering 3000 elements
                                                            .map(p => (
                                                                <div 
                                                                    key={p.id} 
                                                                    className="pos-dropdown-item"
                                                                    onMouseDown={() => {
                                                                        handleRowChange(idx, 'productId', p.id);
                                                                    }}
                                                                >
                                                                    {p.name}
                                                                </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                }
                                if (field.sourceKey === 'unit') {
                                    return <td key={field.id}><input className="pos-input" style={{ textAlign: 'center' }} value={row.packing} onChange={e => handleRowChange(idx, 'packing', e.target.value)} /></td>;
                                }
                                if (field.sourceKey === 'mrp') {
                                    return <td key={field.id}><input type="number" className="pos-input" style={{ textAlign: 'center' }} value={row.rate} onChange={e => handleRowChange(idx, 'rate', e.target.value)} /></td>;
                                }
                                if (field.sourceKey === 'quantity') {
                                    return <td key={field.id}><input type="number" className="pos-input" style={{ textAlign: 'center' }} value={row.quantity} onChange={e => handleRowChange(idx, 'quantity', e.target.value)} /></td>;
                                }
                                if (field.sourceKey === 'amount') {
                                    return <td key={field.id} style={{ textAlign: 'center' }}>{row.total || 0}</td>;
                                }
                                if (field.sourceKey === 'notes') {
                                    return <td key={field.id}><input className="pos-input" style={{ textAlign: 'center' }} value={row.notes || ''} onChange={e => handleRowChange(idx, 'notes', e.target.value)} /></td>;
                                }
                                return <td key={field.id}></td>;
                            })}
                        </tr>
                    ))}
                    {/* Grand Total Row */}
                    <tr>
                        <td colSpan={templateFields.length} style={{ textAlign: 'left', fontWeight: 'bold' }}>Grand Total</td>
                        <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{grandTotal}</td>
                    </tr>
                </tbody>
            </table>

            {/* Footer Form */}
            <div style={{ border: '1px solid #000', borderBottom: 'none' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}>
                    <div style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>From</div>
                    <div style={{ padding: '6px', borderBottom: '1px solid #000', fontWeight: 'bold' }}>Karan Arjun Krushi Seva Kendra Mob No : 9307199040</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 200px' }}>
                    <div style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>To</div>
                    <div style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px' }}><input className="pos-input" value={headerData.customerName} onChange={e => setHeaderData({ ...headerData, customerName: e.target.value })} placeholder="Match with top Name" /></div>
                    <div style={{ borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Mob No</div>
                    <div style={{ padding: '6px', borderBottom: '1px solid #000' }}><input className="pos-input" value={headerData.customerMobile} onBlur={handlePhoneBlur} onChange={e => setHeaderData({ ...headerData, customerMobile: e.target.value })} placeholder="Match with top Mob No" /></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 200px' }}>
                    <div style={{ borderRight: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Address</div>
                    <div style={{ borderRight: '1px solid #000', padding: '6px' }}>
                        <textarea className="pos-input" rows={2} value={headerData.address} onChange={e => setHeaderData({ ...headerData, address: e.target.value })} style={{ resize: 'none' }} />
                    </div>
                    <div>
                        <div style={{ height: '50%', borderBottom: '1px solid #000', borderRight: '1px solid #000' }}></div>
                        <div style={{ height: '50%', borderRight: '1px solid #000', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>Pin</div>
                    </div>
                    <div>
                        <div style={{ height: '50%', borderBottom: '1px solid #000' }}></div>
                        <div style={{ height: '50%', padding: '6px' }}><input className="pos-input" value={headerData.pin} onChange={e => setHeaderData({ ...headerData, pin: e.target.value })} /></div>
                    </div>
                </div>
            </div>
            
            <div style={{ borderTop: '1px solid #000', marginBottom: '8px' }}></div>
            
            {/* Note text */}
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center' }}>
                Note : The product is delivered on the consumer responsibility. Sold product won't be taken back.
            </div>

            {/* Action Buttons (HIDDEN IN PRINT) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button
                    onClick={() => handleSave(true)}
                    disabled={isProcessing}
                    className="btn print-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontSize: '1.1rem', borderRadius: '8px' }}
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Printer size={20} />} Print Form
                </button>
                <button
                    onClick={() => handleSave(false)}
                    disabled={isProcessing}
                    className="btn save-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontSize: '1.1rem', borderRadius: '8px' }}
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Save size={20} />} Complete & Save Bill
                </button>
            </div>
        </div>
        </div>
    );
}
