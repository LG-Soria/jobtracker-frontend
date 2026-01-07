import type React from 'react';

import { Input } from '../../../../components/ui/input';

export function EditableField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  helper?: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-card border border-border bg-surface px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-soft">{label}</p>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {helper ? <div>{helper}</div> : null}
    </div>
  );
}
