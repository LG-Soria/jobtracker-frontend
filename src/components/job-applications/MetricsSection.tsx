// Specification: Metrics section aggregating MetricCard components.
// Receives precomputed metrics to avoid depending on paginated datasets.

import { MetricCard } from './MetricCard';
import { MetricsSkeleton } from './Skeletons';

type MetricsSectionProps = {
  metrics: {
    total: number;
    last7Days: number;
    today: number;
  };
  loading?: boolean;
};

export function MetricsSection({ metrics, loading = false }: MetricsSectionProps) {
  if (loading) {
    return <MetricsSkeleton />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        title="Total postulaciones"
        value={metrics.total}
        hint="Todo tu esfuerzo acumulado"
      />
      <MetricCard title="Ultimos 7 dias" value={metrics.last7Days} hint="Actividad reciente" />
      <MetricCard title="Hoy" value={metrics.today} hint="Postulaciones en la fecha de hoy" />
    </div>
  );
}
