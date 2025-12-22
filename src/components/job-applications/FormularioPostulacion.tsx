'use client';

// Specification: Form to create a new job application.
// Renders required fields, performs minimal validation, and submits via provided callback.

import { FormEvent, useState } from 'react';
import { CreateJobApplicationPayload } from '../../services/jobApplicationsApi';
import { getJobStatusLabel, JobStatus } from '../../types/jobApplication';
import { SuggestionInput } from './SuggestionInput';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type FormularioPostulacionProps = {
  onSubmit: (payload: CreateJobApplicationPayload) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  suggestions?: {
    positions: string[];
    sources: string[];
  };
};

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);

const initialState = (): CreateJobApplicationPayload => ({
  company: '',
  position: '',
  source: '',
  applicationDate: today(),
  status: JobStatus.ENVIADA,
  notes: '',
  jobUrl: '',
});

export function FormularioPostulacion({
  onSubmit,
  loading = false,
  error = null,
  success = null,
  suggestions = { positions: [], sources: [] },
}: FormularioPostulacionProps) {
  const [form, setForm] = useState<CreateJobApplicationPayload>(initialState());
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!form.company || !form.position || !form.source || !form.applicationDate || !form.status) {
      setLocalError('Completa los campos obligatorios');
      return;
    }

    try {
      await onSubmit({
        ...form,
        notes: form.notes || undefined,
        jobUrl: form.jobUrl || undefined,
      });
      setForm(initialState());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear postulacion';
      setLocalError(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleChange = (field: keyof CreateJobApplicationPayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleValueChange = (field: keyof CreateJobApplicationPayload) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectedDate = form.applicationDate ? parseISO(form.applicationDate) : undefined;
  const [dateOpen, setDateOpen] = useState(false);

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Registrar nueva postulacion</h2>
        <p className="text-sm text-slate-600">Suma tu siguiente paso y mantene tu progreso visible.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SuggestionInput
          label="Puesto"
          value={form.position}
          onChange={handleValueChange('position')}
          options={suggestions.positions}
          persistKey="suggestions-positions-removed"
          required
        />
        <div className="space-y-1">
          <Label>Empresa *</Label>
          <Input
            type="text"
            value={form.company}
            onChange={handleChange('company')}
            required
          />
        </div>
        <SuggestionInput
          label="Fuente"
          value={form.source}
          onChange={handleValueChange('source')}
          options={suggestions.sources}
          persistKey="suggestions-sources-removed"
          required
        />
        <div className="space-y-1">
          <Label>Fecha de postulacion *</Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Elegir una fecha'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={8}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  const value = format(date, 'yyyy-MM-dd');
                  handleValueChange('applicationDate')(value);
                  setDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1">
          <Label>Estado *</Label>
          <Select
            value={form.status}
            onValueChange={(value) => handleValueChange('status')(value)}
          >
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
        </div>

        <div className="space-y-1">
          <Label>URL de la oferta</Label>
          <Input
            type="url"
            value={form.jobUrl}
            onChange={handleChange('jobUrl')}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Notas</Label>
        <Textarea
          value={form.notes}
          onChange={handleChange('notes')}
          rows={3}
          placeholder="Detalles, próximos pasos o recordatorios"
        />
      </div>

      {(localError || error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {localError || error}
        </div>
      )}
      {success && !localError && !error && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Registrar postulacion'}
        </Button>
      </div>
    </form>
  );
}
