import { Skeleton } from '../../../../../components/ui/skeleton';
import { HistorySkeleton } from './HistorySkeleton';

export function DetalleSkeleton() {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-4">
        <Skeleton className="h-4 w-24" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <Skeleton className="h-4 w-24" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <Skeleton className="h-4 w-24" />
        <HistorySkeleton />
      </section>
    </div>
  );
}
