import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, AlertCircle, CheckCircle2, LayoutTemplate } from 'lucide-react';
import { useSchema } from '../contexts/SchemaContext';
import type { FieldSchema, ModuleSchema, FieldType } from '../types/schema';

export default function SchemaBuilderPage() {
    const { schemas, updateSchema, loading } = useSchema();
    const [selectedModule, setSelectedModule] = useState<string>('retailers');
    const [editedSchema, setEditedSchema] = useState<ModuleSchema | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Initialize local edit state when module changes
    useEffect(() => {
        if (!loading && schemas[selectedModule]) {
            // Deep clone to avoid mutating context directly before save
            setEditedSchema(JSON.parse(JSON.stringify(schemas[selectedModule])));
        }
    }, [selectedModule, schemas, loading]);

    const handleSave = async () => {
        if (!editedSchema) return;
        try {
            setIsSaving(true);
            setSaveMessage(null);

            // Re-order based on array index before saving
            const finalSchema = {
                ...editedSchema,
                fields: editedSchema.fields.map((f, idx) => ({ ...f, order: idx + 1 }))
            };

            await updateSchema(selectedModule, finalSchema);
            setSaveMessage({ type: 'success', text: 'Schema layout saved successfully!' });
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error: any) {
            setSaveMessage({ type: 'error', text: error.message || 'Failed to save schema' });
        } finally {
            setIsSaving(false);
        }
    };

    const addField = () => {
        if (!editedSchema) return;
        const newField: FieldSchema = {
            id: `custom_field_${Date.now()}`,
            label: 'New Field',
            type: 'text',
            required: false,
            editable: true,
            visibleInTable: true,
            visibleInExport: true,
            order: editedSchema.fields.length + 1
        };
        setEditedSchema({
            ...editedSchema,
            fields: [...editedSchema.fields, newField]
        });
    };

    const updateField = (index: number, key: keyof FieldSchema, value: any) => {
        if (!editedSchema) return;
        const newFields = [...editedSchema.fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setEditedSchema({ ...editedSchema, fields: newFields });
    };

    const removeField = (index: number) => {
        if (!editedSchema) return;
        const field = editedSchema.fields[index];
        if (field.systemOnly) {
            alert('Cannot delete a system required field.');
            return;
        }
        const newFields = [...editedSchema.fields];
        newFields.splice(index, 1);
        setEditedSchema({ ...editedSchema, fields: newFields });
    };

    // Simple Move Up/Down since Drag & Drop needs extra libraries
    const moveField = (index: number, direction: 'up' | 'down') => {
        if (!editedSchema) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === editedSchema.fields.length - 1) return;

        const newFields = [...editedSchema.fields];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        const temp = newFields[index];
        newFields[index] = newFields[swapIndex];
        newFields[swapIndex] = temp;

        setEditedSchema({ ...editedSchema, fields: newFields });
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Schemas...</div>;

    const availableModules = Object.keys(schemas).map(key => ({
        id: key,
        name: schemas[key].moduleName
    }));

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="primary-gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LayoutTemplate size={32} />
                        UI Layout Builder
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Configure exactly what fields appear across your screens and tables.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-base)', color: 'var(--text-primary)' }}
                    >
                        {availableModules.map(mod => (
                            <option key={mod.id} value={mod.id}>{mod.name}</option>
                        ))}
                    </select>

                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={isSaving || !editedSchema}
                    >
                        {isSaving ? 'Saving...' : <><Save size={18} /> Save Layout</>}
                    </button>
                </div>
            </div>

            {saveMessage && (
                <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: saveMessage.type === 'success' ? 'hsla(152, 60%, 40%, 0.1)' : 'hsla(0, 84%, 60%, 0.1)', color: saveMessage.type === 'success' ? 'var(--primary-light)' : 'var(--danger)' }}>
                    {saveMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {saveMessage.text}
                </div>
            )}

            <div style={{ background: 'var(--surface-base)', borderRadius: '12px', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', width: '50px' }}>Ord</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Field ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Display Name</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Required</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Editable</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>In Table</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>In Export</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {editedSchema?.fields.map((field, index) => (
                            <tr key={field.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                <td style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                                    <button onClick={() => moveField(index, 'up')} disabled={index === 0} style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}>▲</button>
                                    <span style={{ fontSize: '0.875rem' }}>{index + 1}</span>
                                    <button onClick={() => moveField(index, 'down')} disabled={index === editedSchema.fields.length - 1} style={{ background: 'none', border: 'none', cursor: index === editedSchema.fields.length - 1 ? 'not-allowed' : 'pointer', opacity: index === editedSchema.fields.length - 1 ? 0.3 : 1 }}>▼</button>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <input
                                        type="text"
                                        value={field.id}
                                        onChange={(e) => updateField(index, 'id', e.target.value)}
                                        disabled={field.systemOnly}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--surface-border)', background: field.systemOnly ? 'var(--surface-raised)' : 'var(--surface-base)', color: 'var(--text-primary)' }}
                                    />
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => updateField(index, 'label', e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'var(--surface-base)', color: 'var(--text-primary)' }}
                                    />
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <select
                                        value={field.type}
                                        onChange={(e) => updateField(index, 'type', e.target.value as FieldType)}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'var(--surface-base)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="email">Email</option>
                                        <option value="phone">Phone</option>
                                        <option value="date">Date</option>
                                        <option value="select">Dropdown</option>
                                        <option value="boolean">Checkbox</option>
                                        <option value="currency">Currency</option>
                                    </select>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, 'required', e.target.checked)} />
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <input type="checkbox" checked={field.editable} onChange={(e) => updateField(index, 'editable', e.target.checked)} />
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <input type="checkbox" checked={field.visibleInTable} onChange={(e) => updateField(index, 'visibleInTable', e.target.checked)} />
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <input type="checkbox" checked={field.visibleInExport} onChange={(e) => updateField(index, 'visibleInExport', e.target.checked)} />
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <button
                                        onClick={() => removeField(index)}
                                        disabled={field.systemOnly}
                                        style={{ background: 'none', border: 'none', color: field.systemOnly ? 'gray' : 'var(--danger)', cursor: field.systemOnly ? 'not-allowed' : 'pointer' }}
                                        title={field.systemOnly ? "System fields cannot be deleted" : "Remove Field"}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ padding: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                    <button className="btn btn-secondary" onClick={addField}>
                        <Plus size={18} /> Add New Field
                    </button>
                </div>
            </div>
        </div>
    );
}
