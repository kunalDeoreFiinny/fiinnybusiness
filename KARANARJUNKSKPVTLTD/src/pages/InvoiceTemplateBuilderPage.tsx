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

const PRESET_TEMPLATES = [
    { id: 'thermal_80', name: 'Thermal 80mm', icon: '🧾', desc: 'Standard POS receipt, compact', color: '#6366f1', paperSize: '80mm', industry: 'Retail / Any', preview: ['Item', 'Qty', 'Amt'] },
    { id: 'thermal_58', name: 'Thermal 58mm', icon: '🖨️', desc: 'Ultra-compact receipt for small printers', color: '#8b5cf6', paperSize: '58mm', industry: 'Kirana / Tea Stall', preview: ['Item', 'Qty'] },
    { id: 'a4_gst', name: 'A4 GST Invoice', icon: '📄', desc: 'Full A4 with GST breakup, ITC-eligible', color: '#10b981', paperSize: 'A4', industry: 'B2B / Wholesale', preview: ['Item', 'HSN', 'Qty', 'Rate', 'CGST', 'SGST', 'Total'] },
    { id: 'a5_compact', name: 'A5 Compact', icon: '📃', desc: 'Half-A4 with GST, good for SMEs', color: '#0ea5e9', paperSize: 'A5', industry: 'SME / Shops', preview: ['Item', 'Qty', 'Rate', 'GST', 'Total'] },
    { id: 'letterhead', name: 'Letterhead Style', icon: '🏢', desc: 'Company letterhead with logo & bank details', color: '#f59e0b', paperSize: 'A4', industry: 'Corporate / Agency', preview: ['Description', 'Unit', 'Rate', 'Amount'] },
    { id: 'pharma', name: 'Pharma / Medical', icon: '💊', desc: 'Batch no., expiry, MRP, drug licence', color: '#ef4444', paperSize: 'A4', industry: 'Pharma Distributor', preview: ['Drug', 'Batch', 'Expiry', 'MRP', 'Rate', 'Qty', 'GST'] },
    { id: 'restaurant', name: 'Restaurant / Hotel', icon: '🍽️', desc: 'KOT-style with table no., covers, FSSAI', color: '#f97316', paperSize: '80mm / A5', industry: 'F&B / Hotel', preview: ['Item', 'Qty', 'Rate', 'Amount', 'GST'] },
    { id: 'textile', name: 'Textile / Saree', icon: '🧵', desc: 'Design no., colour, meters, rate per meter', color: '#ec4899', paperSize: 'A4 / A5', industry: 'Textile Wholesale', preview: ['Design', 'Color', 'Meters', 'Rate/m', 'Amount'] },
    { id: 'agri', name: 'Agriculture / Seeds', icon: '🌾', desc: 'Crop, variety, bags, per-kg pricing', color: '#84cc16', paperSize: 'A4', industry: 'Agri Distributor', preview: ['Crop', 'Variety', 'Bags', 'Kg', 'Rate', 'Amount'] },
    { id: 'construction', name: 'Construction', icon: '🏗️', desc: 'Material, unit (cft/sqft/rft), with TDS', color: '#78716c', paperSize: 'A4', industry: 'Builder / Contractor', preview: ['Material', 'Unit', 'Qty', 'Rate', 'TDS', 'Amount'] },
    { id: 'export', name: 'Export / LUT', icon: '🌍', desc: 'Invoice with LUT no., USD/EUR amount, HS Code', color: '#1d4ed8', paperSize: 'A4', industry: 'Exporter', preview: ['Item', 'HS Code', 'Qty', 'Unit', 'USD', 'INR'] },
    { id: 'service', name: 'Service / Consulting', icon: '💼', desc: 'Professional services with SAC code, retainer', color: '#7c3aed', paperSize: 'A4', industry: 'CA / IT / Agency', preview: ['Service', 'Description', 'Hours', 'Rate', 'GST', 'Amount'] },
];

export default function InvoiceTemplateBuilderPage() {
    const { tenantId, tenantData } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'gallery' | 'editor'>('gallery');
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
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
                        Pick a style template below, or drag fields to customise your own layout
                    </p>
                </div>
                {activeTab === 'editor' && (
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                        {saving ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={18} /> Save Template</>}
                    </button>
                )}
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'inline-flex', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '4px', gap: '4px', marginBottom: '2rem' }}>
                {(['gallery', 'editor'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.55rem 1.5rem', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: tab === activeTab ? 700 : 500, background: tab === activeTab ? 'var(--primary-light)' : 'transparent', color: tab === activeTab ? '#fff' : 'var(--text-secondary)', font: 'inherit', fontSize: '0.9rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {tab === 'gallery' ? '🎨 Template Gallery' : '⚙️ Field Editor'}
                    </button>
                ))}
            </div>

            {/* ===== GALLERY TAB ===== */}
            {activeTab === 'gallery' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                        {PRESET_TEMPLATES.map(preset => (
                            <div
                                key={preset.id}
                                onClick={() => { setSelectedPreset(preset.id); }}
                                style={{
                                    background: 'var(--surface-raised)',
                                    border: `2px solid ${selectedPreset === preset.id ? preset.color : 'var(--surface-border)'}`,
                                    borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: selectedPreset === preset.id ? `0 4px 20px ${preset.color}30` : 'none',
                                    position: 'relative' as const,
                                }}
                            >
                                {selectedPreset === preset.id && (
                                    <div style={{ position: 'absolute' as const, top: '0.75rem', right: '0.75rem', width: 22, height: 22, background: preset.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>✓</div>
                                )}
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{preset.icon}</div>
                                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem', color: selectedPreset === preset.id ? preset.color : 'var(--text-primary)' }}>{preset.name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{preset.desc}</div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: `${preset.color}15`, color: preset.color, fontWeight: 700 }}>📏 {preset.paperSize}</span>
                                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'var(--surface-base)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}>🏭 {preset.industry}</span>
                                </div>
                                {/* Mini preview of columns */}
                                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                    {preset.preview.map((col, i) => (
                                        <span key={i} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', background: `${preset.color}12`, color: preset.color, borderRadius: '4px', border: `1px solid ${preset.color}30`, fontFamily: 'monospace' }}>{col}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedPreset && (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.25rem', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '14px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>✅ Template Selected: {PRESET_TEMPLATES.find(p => p.id === selectedPreset)?.name}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Switch to Field Editor to customise column labels, toggle fields, or reorder them for this template.</div>
                            </div>
                            <button
                                onClick={() => setActiveTab('editor')}
                                style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-light)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, font: 'inherit', whiteSpace: 'nowrap' as const, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                Customise Fields →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ===== EDITOR TAB ===== */}
            {activeTab === 'editor' && (
            <div>
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
                        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.02em' }}>{branding.businessName || tenantData?.businessName || 'Your Business Name'}</div>
                        <div style={{ textAlign: 'center', fontSize: '9px', color: '#555', marginBottom: '6px' }}>{branding.address || tenantData?.location || 'Address'}</div>
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
            )}
        </div>
    );
}
