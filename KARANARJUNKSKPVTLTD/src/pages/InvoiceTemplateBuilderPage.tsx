import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, GripVertical, Eye, FileText, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { InvoiceTemplate, InvoiceField, InvoiceTemplateType } from '../types/invoiceTemplate';
import {
    fetchInvoiceTemplate,
    fetchInvoiceBranding,
    saveInvoiceTemplate,
    DEFAULT_DISTRIBUTOR_RETAILER_TEMPLATE,
} from '../services/invoiceTemplateService';

const TEMPLATE_TYPES: { id: InvoiceTemplateType; label: string; icon: string; desc: string; color: string }[] = [
    { id: 'distributor_retailer', label: 'Distributor → Retailer', icon: '🏭', desc: 'Tax invoice KaranArjun issues to retailers', color: 'var(--primary)' },
    { id: 'retailer_customer', label: 'Retailer → Customer', icon: '🛒', desc: 'Bill your retailer issues to end customers', color: 'var(--secondary-dark)' },
];

export default function InvoiceTemplateBuilderPage() {
    const { tenantId } = useAuth();
    const { showToast } = useToast();
    const [selectedType, setSelectedType] = useState<InvoiceTemplateType>('distributor_retailer');
    const [template, setTemplate] = useState<InvoiceTemplate>(DEFAULT_DISTRIBUTOR_RETAILER_TEMPLATE);
    const [branding, setBranding] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Drag state
    const dragIndex = useRef<number | null>(null);
    const [dragOver, setDragOver] = useState<number | null>(null);

    useEffect(() => {
        if (!tenantId) return;
        setLoading(true);
        Promise.all([
            fetchInvoiceTemplate(tenantId, selectedType),
            fetchInvoiceBranding(tenantId),
        ]).then(([tmpl, brd]) => {
            setTemplate(JSON.parse(JSON.stringify(tmpl)));
            setBranding(brd);
        }).finally(() => setLoading(false));
    }, [tenantId, selectedType]);

    const handleSave = async () => {
        if (!tenantId) return;
        setSaving(true);
        try {
            const ordered = { ...template, fields: template.fields.map((f, i) => ({ ...f, order: i + 1 })) };
            await saveInvoiceTemplate(tenantId, ordered);
            setTemplate(ordered);
            showToast(`"${template.name}" template saved!`, 'success');
        } catch {
            showToast('Failed to save template.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (index: number, key: keyof InvoiceField, value: any) => {
        const f = [...template.fields];
        f[index] = { ...f[index], [key]: value };
        setTemplate({ ...template, fields: f });
    };

    const addField = () => {
        const newField: InvoiceField = {
            id: `custom_${Date.now()}`,
            label: 'New Field',
            sourceKey: 'customField',
            show: true,
            bold: false,
            order: template.fields.length + 1,
        };
        setTemplate({ ...template, fields: [...template.fields, newField] });
    };

    const deleteField = (index: number) => {
        if (template.fields[index].systemOnly) { showToast('System fields cannot be deleted.', 'warning'); return; }
        const f = [...template.fields];
        f.splice(index, 1);
        setTemplate({ ...template, fields: f });
    };

    // Drag & Drop Handlers
    const onDragStart = (e: React.DragEvent, index: number) => {
        dragIndex.current = index;
        e.dataTransfer.effectAllowed = 'move';
        (e.currentTarget as HTMLElement).style.opacity = '0.4';
    };
    const onDragEnd = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).style.opacity = '1';
        setDragOver(null);
        dragIndex.current = null;
    };
    const onDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOver(index);
    };
    const onDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (dragIndex.current === null || dragIndex.current === dropIndex) return;
        const f = [...template.fields];
        const [moved] = f.splice(dragIndex.current, 1);
        f.splice(dropIndex, 0, moved);
        setTemplate({ ...template, fields: f });
        setDragOver(null);
    };

    const visibleFields = template.fields.filter(f => f.show).sort((a, b) => a.order - b.order);
    const sampleOrder = { productName: 'Organic Fertilizer 50kg', quantity: 10, unit: 'Bags', amount: 4500, paymentStatus: 'Unpaid', talkedTo: 'Ravi', notes: 'Deliver by Friday', customField: '...' };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--surface-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--text-tertiary)' }}>Loading templates...</p>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="primary-gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Layers size={32} /> Invoice Template Builder
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                        Drag fields to reorder • Toggle visibility • Customise labels — changes apply to all invoices
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                    {saving ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={18} /> Save Template</>}
                </button>
            </div>

            {/* Template Type Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {TEMPLATE_TYPES.map(t => (
                    <motion.button
                        key={t.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedType(t.id)}
                        style={{
                            padding: '1.5rem', borderRadius: '16px',
                            border: `2px solid ${selectedType === t.id ? t.color : 'var(--surface-border)'}`,
                            background: selectedType === t.id ? `${t.color}18` : 'var(--surface-base)',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                            boxShadow: selectedType === t.id ? `0 0 0 4px ${t.color}20` : 'none',
                        }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: selectedType === t.id ? t.color : 'var(--text-primary)', marginBottom: '0.25rem' }}>{t.label}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>{t.desc}</div>
                        {selectedType === t.id && <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: t.color }}><CheckCircle2 size={12} /> Editing now</div>}
                    </motion.button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Drag & Drop Field List */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
                            <GripVertical size={16} /> Drag rows to reorder fields
                        </div>
                        <button className="btn btn-secondary" onClick={addField} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                            <Plus size={15} /> Add Field
                        </button>
                    </div>

                    <div style={{ borderRadius: '14px', border: '1px solid var(--surface-border)', overflow: 'hidden', background: 'var(--surface-base)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 140px 52px 52px 52px 40px', gap: '0', background: 'var(--surface-raised)', borderBottom: '2px solid var(--surface-border)', padding: '0.75rem 0', alignItems: 'center' }}>
                            {['', 'Label (on Invoice)', 'Data Source Key', 'Show', 'Bold', '₹', ''].map((h, i) => (
                                <div key={i} style={{ padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i >= 3 ? 'center' : 'left' }}>{h}</div>
                            ))}
                        </div>

                        {/* Draggable Rows */}
                        {template.fields.map((field, idx) => (
                            <div
                                key={field.id}
                                draggable
                                onDragStart={e => onDragStart(e, idx)}
                                onDragEnd={onDragEnd}
                                onDragOver={e => onDragOver(e, idx)}
                                onDrop={e => onDrop(e, idx)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '36px 1fr 140px 52px 52px 52px 40px',
                                    alignItems: 'center',
                                    borderBottom: idx < template.fields.length - 1 ? '1px solid var(--surface-border)' : 'none',
                                    background: dragOver === idx ? 'hsla(152,60%,40%,0.08)' : 'transparent',
                                    borderLeft: dragOver === idx ? '3px solid var(--primary)' : '3px solid transparent',
                                    transition: 'background 0.15s, border-color 0.15s',
                                    cursor: 'grab',
                                }}
                            >
                                {/* Grip handle */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', padding: '0 4px' }}>
                                    <GripVertical size={16} />
                                </div>

                                {/* Label */}
                                <div style={{ padding: '0.6rem 0.5rem' }}>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={e => updateField(idx, 'label', e.target.value)}
                                        style={{ width: '100%', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--surface-border)', background: 'var(--surface-base)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'inherit' }}
                                        onClick={e => e.stopPropagation()}
                                    />
                                </div>

                                {/* Source key */}
                                <div style={{ padding: '0.6rem 0.5rem' }}>
                                    <input
                                        type="text"
                                        value={field.sourceKey}
                                        onChange={e => updateField(idx, 'sourceKey', e.target.value)}
                                        disabled={field.systemOnly}
                                        onClick={e => e.stopPropagation()}
                                        style={{ width: '100%', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--surface-border)', background: field.systemOnly ? 'var(--surface-raised)' : 'var(--surface-base)', color: field.systemOnly ? 'var(--text-tertiary)' : 'var(--primary-light)', fontSize: '0.75rem', fontFamily: 'monospace' }}
                                    />
                                </div>

                                {/* Show toggle */}
                                <div style={{ textAlign: 'center' }}>
                                    <input type="checkbox" checked={field.show} onChange={e => updateField(idx, 'show', e.target.checked)} style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: 'var(--primary)' }} />
                                </div>

                                {/* Bold toggle */}
                                <div style={{ textAlign: 'center' }}>
                                    <input type="checkbox" checked={field.bold} onChange={e => updateField(idx, 'bold', e.target.checked)} style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: 'var(--primary)' }} />
                                </div>

                                {/* Currency toggle */}
                                <div style={{ textAlign: 'center' }}>
                                    <input type="checkbox" checked={!!field.isCurrency} onChange={e => updateField(idx, 'isCurrency', e.target.checked)} style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: 'var(--secondary-dark)' }} />
                                </div>

                                {/* Delete */}
                                <div style={{ textAlign: 'center' }}>
                                    <button
                                        onClick={() => deleteField(idx)}
                                        disabled={field.systemOnly}
                                        title={field.systemOnly ? 'System field — cannot delete' : 'Delete field'}
                                        style={{ background: 'none', border: 'none', cursor: field.systemOnly ? 'not-allowed' : 'pointer', color: field.systemOnly ? 'var(--text-tertiary)' : 'var(--danger)', padding: '4px', borderRadius: '4px', transition: 'background 0.1s' }}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {template.fields.length === 0 && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                <FileText size={32} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                                <p>No fields yet. Click "Add Field" to get started.</p>
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--surface-border)', fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><GripVertical size={12} /> Drag to reorder</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Show = appears on invoice</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> System fields cannot be deleted</span>
                        <span>₹ = format as Indian currency</span>
                        <span>Data key = field name from the order record</span>
                    </div>
                </div>

                {/* Live 80mm Preview */}
                <div style={{ position: 'sticky', top: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>
                        <Eye size={16} /> Live Preview (80mm thermal)
                    </div>
                    <motion.div
                        layout
                        style={{ background: 'white', color: '#111', padding: '16px', borderRadius: '10px', border: '2px dashed #ccc', fontFamily: "'Courier New', monospace", fontSize: '11px', maxWidth: '300px', boxShadow: '0 6px 24px rgba(0,0,0,0.15)' }}
                    >
                        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.02em' }}>{branding.businessName || 'Your Business Name'}</div>
                        <div style={{ textAlign: 'center', fontSize: '9px', color: '#555', marginBottom: '6px' }}>{branding.address || 'Address'}</div>
                        {branding.gstin && <div style={{ textAlign: 'center', fontSize: '8px', color: '#777', marginBottom: '4px' }}>GSTIN: {branding.gstin}</div>}
                        <div style={{ borderTop: '1px dashed #bbb', borderBottom: '1px dashed #bbb', padding: '5px 0', margin: '6px 0', fontSize: '10px' }}>
                            <div><strong>{template.name}</strong></div>
                            <div>Inv No: <strong>INV-DEMO</strong> | Date: {new Date().toLocaleDateString('en-IN')}</div>
                            <div>Bill To: <strong>Sample Retailer</strong></div>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '6px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                    {visibleFields.map(f => <th key={f.id} style={{ textAlign: 'left', padding: '2px 3px', fontSize: '9px', fontWeight: f.bold ? 'bold' : 'normal' }}>{f.label}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {visibleFields.map(f => (
                                        <td key={f.id} style={{ padding: '3px', fontWeight: f.bold ? 'bold' : 'normal', fontSize: '10px' }}>
                                            {f.isCurrency ? `₹ ${Number(sampleOrder[f.sourceKey as keyof typeof sampleOrder] || 0).toLocaleString('en-IN')}` : String(sampleOrder[f.sourceKey as keyof typeof sampleOrder] || '—')}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                        <div style={{ borderTop: '2px solid #000', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                            <span>TOTAL</span><span>₹ 4,500</span>
                        </div>
                        {branding.bankDetails && <div style={{ fontSize: '8px', color: '#666', marginTop: '8px', whiteSpace: 'pre-line' }}>{branding.bankDetails}</div>}
                        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '9px', borderTop: '1px dashed #bbb', paddingTop: '6px', color: '#555' }}>
                            *** Thank You! Visit Again ***<br />{branding.signatureName ? `Authorised: ${branding.signatureName}` : ''}
                        </div>
                    </motion.div>

                    {/* Field count pill */}
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: '999px', background: 'hsla(152,60%,40%,0.1)', color: 'var(--primary-light)', border: '1px solid hsla(152,60%,40%,0.2)' }}>
                            {visibleFields.length} visible fields
                        </span>
                        <span style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: '999px', background: 'hsla(220,20%,50%,0.1)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}>
                            {template.fields.length} total fields
                        </span>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
