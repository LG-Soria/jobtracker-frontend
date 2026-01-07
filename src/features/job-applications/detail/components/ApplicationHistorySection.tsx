import { format } from 'date-fns';

import { Button } from '../../../../components/ui/button';
import { type JobApplicationHistoryEntry } from '../../../../types/jobApplicationHistory';
import { describeHistoryEntry } from '../utils/historyDescription';
import { HistorySkeleton } from './skeletons/HistorySkeleton';

type HistorySectionProps = {
  history: JobApplicationHistoryEntry[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  className?: string;
};

export function HistorySection({
  history,
  loading,
  error,
  onRetry,
  className,
}: HistorySectionProps) {
  return (
    <section
      className={`flex h-full flex-col rounded-card border border-border bg-surface ${className ?? ''}`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <p className="text-sm font-semibold text-ink">Historial</p>
        <span className="text-[11px] uppercase tracking-[0.1em] text-ink-soft">Linea de tiempo</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <HistorySkeleton />
        ) : error ? (
          <div className="mt-1 space-y-2 rounded-card border border-danger/50 bg-danger-soft p-3 text-sm text-primary">
            <div className="flex items-start justify-between gap-3">
              <span className="font-semibold text-ink">No pudimos cargar el historial</span>
              <Button size="sm" variant="outline" onClick={onRetry}>
                Reintentar
              </Button>
            </div>
            <p className="text-xs text-primary">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <p className="mt-1 text-sm text-ink-muted">Sin eventos registrados todavia.</p>
        ) : (
          <HistoryTimeline history={history} />
        )}
      </div>
    </section>
  );
}

export function HistoryTimeline({ history }: { history: JobApplicationHistoryEntry[] }) {
  return (
    <ol className="mt-3 space-y-4">
      {history.map((entry, index) => {
        // La descripci¢n se deriva del tipo de evento.
        const { title, description } = describeHistoryEntry(entry);

        // Se intenta formatear la fecha para mostrarla amigable.
        const createdAt = new Date(entry.createdAt);
        const readableDate = Number.isNaN(createdAt.getTime())
          ? entry.createdAt
          : format(createdAt, 'dd/MM/yyyy HH:mm');

        // Para dibujar la l¡nea vertical, se identifica el £ltimo ¡tem.
        const isLast = index === history.length - 1;

        return (
          <li key={entry.id} className="relative pl-8">
            <span className="absolute left-3 top-1.5 inline-flex h-3 w-3 items-center justify-center">
              <span className="h-3 w-3 rounded-full bg-ink-soft ring-2 ring-border" />
            </span>

            {!isLast && (
              <span
                className="absolute left-[17px] top-4 h-full w-px bg-border"
                aria-hidden="true"
              />
            )}

            <div className="space-y-1">
              <p className="text-sm font-semibold text-ink">{title}</p>
              {description ? <p className="text-xs text-ink-muted">{description}</p> : null}
              <p className="text-xs text-ink-soft">{readableDate}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
