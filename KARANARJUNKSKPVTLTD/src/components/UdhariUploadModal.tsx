import { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection } from '../utils/tenantPath';
import { useSchema } from '../contexts/SchemaContext';

interface UdhariUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UdhariUploadModal({ isOpen, onClose, onSuccess }: UdhariUploadModalProps) {
    const { tenantId } = useAuth();
    const { getSchema } = useSchema();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successCount, setSuccessCount] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const schema = getSchema('retailers');

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setSuccessCount(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !tenantId) return;
        setIsUploading(true);
        setError(null);
        setSuccessCount(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const data = results.data as any[];

                    if (data.length === 0) {
                        setError('The CSV file is empty.');
                        setIsUploading(false);
                        return;
                    }



                    if (!schema) throw new Error("Schema not loaded");

                    let count = 0;
                    const exportFields = schema.fields.filter(f => f.visibleInExport).sort((a, b) => a.order - b.order);

                    for (const row of data) {
                        const rowValues = Object.values(row);

                        // Build new Retailer object dynamically based on schema
                        const newRetailerData: any = {};
                        let remainingAmount = 0;
                        let dueAmount = 0;
                        let receivedAmount = 0;
                        let name = '';
                        let number = '';

                        exportFields.forEach((field, index) => {
                            const rawVal = row[field.label] || rowValues[index] || '';

                            // Specific type coercions
                            let val: any = rawVal;
                            if (field.type === 'currency' || field.type === 'number') {
                                val = parseFloat(String(rawVal).replace(/,/g, '')) || 0;
                            }

                            newRetailerData[field.id] = val;

                            // Grab special keys for logic tracking
                            if (field.id === 'outstandingAmount') remainingAmount = val;
                            if (field.id === 'totalSales') dueAmount = val;
                            if (field.id === 'totalPaid') receivedAmount = val;
                            if (field.id === 'name') name = String(val);
                            if (field.id === 'number') number = String(val);
                        });

                        if (!name && !number && remainingAmount === 0) continue;

                        // 1. Check if retailer exists by name/number
                        const retailersCol = getTenantCollection(db, tenantId, 'retailers');
                        const qName = query(retailersCol, where('name', '==', name));
                        const nameSnap = await getDocs(qName);

                        let retailerId = '';

                        if (!nameSnap.empty) {
                            retailerId = nameSnap.docs[0].id;
                        } else {
                            // Create Retailer
                            const newRetailerRef = await addDoc(retailersCol, {
                                ...newRetailerData,
                                portfolioSize: 'Small',
                                createdAt: serverTimestamp(),
                            });
                            retailerId = newRetailerRef.id;
                        }

                        // 2. Create an Order in 'orders' to track the due balance as an 'Unpaid' bill
                        if (remainingAmount > 0) {
                            await addDoc(getTenantCollection(db, tenantId, 'orders'), {
                                retailerId,
                                retailerName: name,
                                productId: 'UDHARI_IMPORT',
                                productName: `Imported Opening Balance`,
                                quantity: 1,
                                unit: 'N/A',
                                amount: remainingAmount,
                                paymentStatus: 'Unpaid',
                                isDelivered: true,
                                createdAt: serverTimestamp(),
                                notes: `Uploaded via CSV. Due: ${dueAmount}, Rcvd: ${receivedAmount}`
                            });
                        }

                        count++;
                    }

                    setSuccessCount(count);
                    onSuccess();

                } catch (err: any) {
                    console.error("Error uploading CSV:", err);
                    setError(err.message || 'Failed to parse and upload CSV data.');
                } finally {
                    setIsUploading(false);
                }
            },
            error: (err) => {
                setError(`Parse Error: ${err.message}`);
                setIsUploading(false);
            }
        });
    };

    return (
        <div className="modal-overlay animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
            <div className="modal-content animate-slide-up glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
                <button
                    onClick={onClose}
                    className="btn-icon"
                    style={{ position: 'absolute', top: '1rem', right: '1rem' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Upload className="primary-gradient-text" />
                    Upload Udhari CSV
                </h2>

                {!successCount && (
                    <div style={{ marginBottom: '1.5rem', background: 'var(--surface-raised)', borderRadius: '12px', border: '1px dashed var(--surface-border)', padding: '2rem', textAlign: 'center' }}>
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <button
                            className="btn btn-secondary"
                            onClick={() => fileInputRef.current?.click()}
                            style={{ margin: '0 auto 1rem auto' }}
                        >
                            Select CSV File
                        </button>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                            {file ? `Selected: ${file.name}` : `Upload format must match the UI Builder table configuration.`}
                        </p>
                    </div>
                )}

                {error && (
                    <div style={{ padding: '1rem', background: 'hsla(0, 100%, 50%, 0.1)', color: '#ff4d4f', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={18} />
                        <span style={{ fontSize: '0.875rem' }}>{error}</span>
                    </div>
                )}

                {successCount !== null && (
                    <div style={{ padding: '1.5rem', background: 'hsla(152, 60%, 40%, 0.1)', color: 'var(--primary-light)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                        <CheckCircle2 size={48} />
                        <div>
                            <strong style={{ fontSize: '1.25rem', display: 'block' }}>Upload Successful!</strong>
                            <span>Imported {successCount} udhari records.</span>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    {successCount !== null ? (
                        <button className="btn btn-primary" onClick={onClose}>
                            Close
                        </button>
                    ) : (
                        <>
                            <button className="btn btn-secondary" onClick={onClose} disabled={isUploading}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {isUploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : 'Start Upload'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
