type MetricTileProps = {
  label: string;
  value: string;
  hint?: string;
};

export function MetricTile({ label, value, hint }: MetricTileProps) {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient">
      <p className="text-sm font-medium text-on-surface-variant">{label}</p>
      <p className="mt-2 text-xl font-bold tabular-nums text-on-surface md:text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-on-surface-variant">{hint}</p> : null}
    </div>
  );
}
