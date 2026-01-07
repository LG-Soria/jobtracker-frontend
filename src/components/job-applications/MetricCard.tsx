// Specification: Presentational card for a single metric value.
// Renders a title, main value, and optional hint text with Tailwind styling.

type MetricCardProps = {
  title: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
};

export function MetricCard({ title, value, hint, icon }: MetricCardProps) {
  return (
    <div className="flex min-h-[190px] flex-col rounded-none border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{title}</p>
        {icon ? <span className="text-ink-soft">{icon}</span> : null}
      </div>

      <div className="mt-4 text-[2rem] font-semibold leading-tight text-ink">{value}</div>

      <div className="my-4 h-px bg-border" />

      {hint ? <p className="text-sm text-ink-muted leading-relaxed">{hint}</p> : null}
    </div>
  );
}
