interface ProfileProgressProps {
  completeness: number;
  missingFields: string[];
}

export function ProfileProgress({ completeness, missingFields }: ProfileProgressProps) {
  const color = completeness >= 80 ? 'var(--kd-success)' : completeness >= 50 ? 'var(--kd-warning)' : 'var(--kd-danger)';

  return (
    <div style={{
      background: 'var(--kd-surface)',
      border: '1px solid var(--kd-border)',
      borderRadius: 'var(--kd-radius-lg)',
      padding: 'var(--kd-space-5) var(--kd-space-6)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 'var(--kd-fs-sm)', fontWeight: 600 }}>Profile Completeness</span>
        <span style={{ fontSize: 'var(--kd-fs-sm)', fontWeight: 700, color }}>{completeness}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--kd-gray-100)', overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ height: '100%', width: `${completeness}%`, borderRadius: 3, background: color, transition: 'width 0.5s ease' }} />
      </div>
      {missingFields.length > 0 && (
        <div style={{ fontSize: 'var(--kd-fs-xs)', color: 'var(--kd-text-muted)', lineHeight: 1.6 }}>
          Complete: {missingFields.join(', ')}
        </div>
      )}
    </div>
  );
}
