type InsightCardProps = {
  title: string;
  body: string;
};

export function InsightCard({ title, body }: InsightCardProps) {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 md:p-5">
      <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{body}</p>
    </div>
  );
}
