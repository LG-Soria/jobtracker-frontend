import type React from 'react';

export function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-card border border-border bg-surface px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-soft">{label}</p>
      <div className="text-sm text-ink">{value}</div>
    </div>
  );
}
