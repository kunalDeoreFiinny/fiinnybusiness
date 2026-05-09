import React from 'react';
import { useSchema } from '../contexts/SchemaContext';
import type { FieldSchema } from '../types/schema';

interface DynamicTableProps {
    moduleId: string;
    data: any[];
    onRowClick?: (row: any) => void;
    actionsRef?: (row: any) => React.ReactNode;
    selectedIds?: Set<string>;
    onSelectionChange?: (id: string, selected: boolean) => void;
}

export default function DynamicTable({
    moduleId, data, onRowClick,
    actionsRef, selectedIds, onSelectionChange,
}: DynamicTableProps) {
    const { getSchema, loading } = useSchema();

    if (loading) return <div>Loading layout...</div>;

    const schema = getSchema(moduleId);
    if (!schema) return <div>Error: Schema for {moduleId} not found.</div>;

    const visibleColumns = schema.fields
        .filter(f => f.visibleInTable)
        .sort((a, b) => a.order - b.order);

    const renderCell = (field: FieldSchema, rowValue: any) => {
        if (rowValue === undefined || rowValue === null) return '-';
        if (field.type === 'currency') return `Rs. ${rowValue.toLocaleString()}`;
        if (field.type === 'boolean') return rowValue ? 'Yes' : 'No';
        if (field.type === 'date') return new Date(rowValue).toLocaleDateString();
        return String(rowValue);
    };

    const hasSelection = !!onSelectionChange;
    const colSpan = visibleColumns.length + (actionsRef ? 1 : 0) + (hasSelection ? 1 : 0);

    return (
        <div style={{ overflowX: 'auto', background: 'var(--surface-base)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-border)' }}>
                    <tr>
                        {hasSelection && (
                            <th style={{ padding: '1rem', width: '44px' }} />
                        )}
                        {visibleColumns.map(col => (
                            <th key={col.id} style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {col.label}
                            </th>
                        ))}
                        {actionsRef && (
                            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={colSpan} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                No records found.
                            </td>
                        </tr>
                    ) : (
                        data.map((row, idx) => {
                            const isSelected = selectedIds?.has(row.id) ?? false;
                            return (
                                <tr
                                    key={row.id || idx}
                                    onClick={() => onRowClick?.(row)}
                                    style={{
                                        borderBottom: '1px solid var(--surface-border)',
                                        cursor: onRowClick ? 'pointer' : 'default',
                                        transition: 'background 0.15s',
                                        background: isSelected ? 'rgba(99,179,237,0.10)' : 'transparent',
                                        boxShadow: isSelected ? 'inset 3px 0 0 var(--primary-light)' : undefined,
                                    }}
                                    onMouseEnter={e => {
                                        if (!isSelected) e.currentTarget.style.background = 'var(--surface-raised)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = isSelected ? 'rgba(99,179,237,0.10)' : 'transparent';
                                    }}
                                >
                                    {hasSelection && (
                                        <td
                                            style={{ padding: '0.75rem 1rem', width: '44px' }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                onSelectionChange!(row.id, !isSelected);
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {/* handled by td onClick */}}
                                                style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--primary-light)', pointerEvents: 'none' }}
                                            />
                                        </td>
                                    )}
                                    {visibleColumns.map(col => (
                                        <td key={col.id} style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                                            {renderCell(col, row[col.id])}
                                        </td>
                                    ))}
                                    {actionsRef && (
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            {actionsRef(row)}
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
