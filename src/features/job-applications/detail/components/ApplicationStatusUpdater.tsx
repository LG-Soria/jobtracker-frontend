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
};

export function StatusUpdater({
  value,
  current,
  updating,
  onChange,
  onConfirm,
  onCancel,
  error,
}: StatusUpdaterProps) {
  // "Dirty" en el control de estado: habilita botones solo si hay diferencia.
  const isDirty = value !== current;

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</p>
          <p className="text-xs text-slate-500">Cambiar estado con confirmacion</p>
        </div>
        {updating && <span className="text-xs font-semibold uppercase text-slate-500">Guardando...</span>}
      </div>

      <Select value={value} onValueChange={(val) => onChange(val as JobStatus)} disabled={updating}>
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
        <Button size="sm" disabled={!isDirty || updating} onClick={onConfirm}>
          Confirmar cambio
        </Button>
        <Button size="sm" variant="outline" disabled={!isDirty || updating} onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
