import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSchema } from '../contexts/SchemaContext';
import type { FieldSchema } from '../types/schema';

interface DynamicFormProps {
    moduleId: string;
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
    readOnly?: boolean;
}

export default function DynamicForm({ moduleId, initialData, onSubmit, onCancel, readOnly = false }: DynamicFormProps) {
    const { getSchema, loading } = useSchema();
    const { t } = useTranslation();
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Setup defaults
            const schema = getSchema(moduleId);
            if (schema) {
                const defaults: any = {};
                schema.fields.forEach(f => {
                    if (f.defaultValue !== undefined) {
                        defaults[f.id] = f.defaultValue;
                    } else if (f.type === 'number' || f.type === 'currency') {
                        // defaults[f.id] = 0; // Better to leave undefined for empty inputs
                    } else if (f.type === 'boolean') {
                        defaults[f.id] = false;
                    } else {
                        defaults[f.id] = '';
                    }
                });
                setFormData(defaults);
            }
        }
    }, [initialData, moduleId, getSchema]);

    if (loading) return <div>Loading form configuration...</div>;

    const schema = getSchema(moduleId);
    if (!schema) return <div>Error: Schema not found for {moduleId}</div>;

    const handleChange = (fieldId: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderInput = (field: FieldSchema) => {
        const value = formData[field.id] !== undefined ? formData[field.id] : '';
        const disabled = readOnly || (!field.editable && !!initialData);

        if (field.type === 'select' && field.options) {
            return (
                <select
                    className="input-field"
                    value={value}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    required={field.required}
                    disabled={disabled}
                >
                    <option value="">Select an option</option>
                    {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            );
        }

        if (field.type === 'boolean') {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '100%', padding: '0.5rem 0' }}>
                    <input
                        type="checkbox"
                        checked={value || false}
                        onChange={(e) => handleChange(field.id, e.target.checked)}
                        disabled={disabled}
                        style={{ width: '1.2rem', height: '1.2rem' }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>{field.label}</span>
                </div>
            );
        }

        let inputType = 'text';
        if (field.type === 'number' || field.type === 'currency') inputType = 'number';
        if (field.type === 'email') inputType = 'email';
        if (field.type === 'phone') inputType = 'tel';
        if (field.type === 'date') inputType = 'date';

        return (
            <input
                type={inputType}
                className="input-field"
                value={value}
                onChange={(e) => handleChange(field.id, inputType === 'number' ? Number(e.target.value) : e.target.value)}
                required={field.required}
                disabled={disabled}
                placeholder={`Enter ${field.label}`}
                step={field.type === 'currency' ? '0.01' : '1'}
            />
        );
    };

    const orderedFields = schema.fields.sort((a, b) => a.order - b.order);

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {orderedFields.map(field => (
                    <div key={field.id} className="input-group">
                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                            {field.label}
                            {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                        </label>
                        {renderInput(field)}
                    </div>
                ))}
            </div>

            {!readOnly && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                    {onCancel && (
                        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                            {t('common.cancel')}
                        </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            )}
        </form>
    );
}
