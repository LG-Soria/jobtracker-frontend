import { Skeleton } from '../../../../../components/ui/skeleton';

export function HistorySkeleton() {
  return (
    <div className="mt-3 space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
