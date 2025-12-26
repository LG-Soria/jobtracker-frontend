import { Button } from '../../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { getJobStatusLabel, JobStatus } from '../../../../types/jobApplication';

type StatusUpdaterProps = {
  value: JobStatus;
  current: JobStatus;
  updating: boolean;
  onChange: (value: JobStatus) => void;
  onConfirm: () => void;
  onCancel: () => void;
  error: string | null;
  disabled?: boolean;
};

export function StatusUpdater({
  value,
  current,
  updating,
  disabled = false,
  onChange,
  onConfirm,
  onCancel,
  error,
}: StatusUpdaterProps) {
  // "Dirty" en el control de estado: habilita botones solo si hay diferencia.
  const isDirty = value !== current;
  const isBusy = updating || disabled;
  const helperText = updating ? 'Guardando...' : disabled ? 'Eliminando...' : null;

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</p>
          <p className="text-xs text-slate-500">Cambiar estado con confirmacion</p>
        </div>
        {helperText && (
          <span className="text-xs font-semibold uppercase text-slate-500">{helperText}</span>
        )}
      </div>

      <Select value={value} onValueChange={(val) => onChange(val as JobStatus)} disabled={isBusy}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona estado" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(JobStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {getJobStatusLabel(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={!isDirty || isBusy} onClick={onConfirm}>
          Confirmar cambio
        </Button>
        <Button size="sm" variant="outline" disabled={!isDirty || isBusy} onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
