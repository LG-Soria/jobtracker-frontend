'use client';

import { Fragment } from 'react';
import { Skeleton } from '../ui/skeleton';

type ApplicationsTableSkeletonProps = {
  rows?: number;
};

export function ApplicationsTableSkeleton({ rows = 6 }: ApplicationsTableSkeletonProps) {
  const skeletonRows = Array.from({ length: rows });

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
        <Skeleton className="h-4 w-56" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="overflow-hidden rounded-card border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-transparent text-[11px] uppercase tracking-[0.1em] text-ink-muted">
            <tr>
              <th className="px-4 py-4">Empresa</th>
              <th className="px-4 py-4">Puesto</th>
              <th className="px-4 py-4">Estado</th>
              <th className="px-4 py-4">Fuente</th>
              <th className="px-4 py-4 text-right">Acciones</th>
              <th className="w-12 px-4 py-4"></th>
            </tr>
          </thead>
          <tbody className="bg-surface">
            {skeletonRows.map((_, idx) => (
              <Fragment key={idx}>
                {idx % 3 === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="bg-surface-muted px-3 py-2 text-sm font-semibold text-ink"
                    >
                      <Skeleton className="h-4 w-32" />
                    </td>
                  </tr>
                )}
                <tr className="border-b border-border/70">
                  <td className="px-3 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-3 py-3">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="px-3 py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-3 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Skeleton className="ml-auto h-8 w-28" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Skeleton className="mx-auto h-8 w-8" />
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((idx) => (
        <div
          key={idx}
          className="rounded-card border border-border bg-surface p-6"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-4 h-9 w-20" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
