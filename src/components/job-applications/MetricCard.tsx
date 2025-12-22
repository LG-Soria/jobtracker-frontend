// Specification: Presentational card for a single metric value.
// Renders a title, main value, and optional hint text with Tailwind styling.

type MetricCardProps = {
  title: string;
  value: string | number;
  hint?: string;
};

export function MetricCard({ title, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}
