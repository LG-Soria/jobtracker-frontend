// Specification: Metrics section aggregating MetricCard components.
// Receives precomputed metrics to avoid depending on paginated datasets.

import { Briefcase, Calendar, Clock } from 'lucide-react';
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Total postulaciones"
        value={metrics.total}
        hint="Todo tu esfuerzo acumulado"
        icon={<Briefcase className="h-4 w-4" />}
      />
      <MetricCard
        title="Ultimos 7 dias"
        value={metrics.last7Days}
        hint="Actividad reciente"
        icon={<Clock className="h-4 w-4" />}
      />
      <MetricCard
        title="Hoy"
        value={metrics.today}
        hint="Postulaciones en la fecha de hoy"
        icon={<Calendar className="h-4 w-4" />}
      />
    </div>
  );
}
