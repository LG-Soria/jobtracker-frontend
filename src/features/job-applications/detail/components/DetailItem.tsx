import type React from 'react';

export function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="text-sm text-slate-900">{value}</div>
    </div>
  );
}
