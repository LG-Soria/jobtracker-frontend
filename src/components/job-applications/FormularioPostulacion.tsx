'use client';

// Specification: Form to create a new job application.
// Renders required fields, performs minimal validation, and submits via provided callback.

import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  SalaryCurrency,
  SalaryPeriod,
  SalaryType,
} from '../../types/jobApplication';
import { getJobStatusLabel, JobStatus } from '../../types/jobApplication';
import { SuggestionInput } from './SuggestionInput';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import type { FormSuccessState } from '../../hooks/useJobApplications';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { CreateJobApplicationPayload } from '../../services/jobApplicationsApi';

type FormularioPostulacionProps = {
  onSubmit: (payload: CreateJobApplicationPayload) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  success?: FormSuccessState;
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

const DEFAULT_SALARY_CURRENCY: SalaryCurrency = 'ARS';
const DEFAULT_SALARY_PERIOD: SalaryPeriod = 'Mensual';

export function FormularioPostulacion({
  onSubmit,
  loading = false,
  error = null,
  success = null,
  suggestions = { positions: [], sources: [] },
}: FormularioPostulacionProps) {
  const [form, setForm] = useState<CreateJobApplicationPayload>(initialState());
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccessDismissed, setIsSuccessDismissed] = useState(false);
  const [includeSalaryRange, setIncludeSalaryRange] = useState(false);
  const [salaryInputs, setSalaryInputs] = useState({ min: '', max: '' });
  const [showSalaryBlock, setShowSalaryBlock] = useState(false);
  const [salaryAnimatingOut, setSalaryAnimatingOut] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [salaryContainerHeight, setSalaryContainerHeight] = useState(0);
  const salaryContentRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const formatNumber = (value?: number) => {
    if (value === undefined || Number.isNaN(value)) return '';
    return new Intl.NumberFormat('es-AR').format(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!form.company || !form.position || !form.source || !form.applicationDate || !form.status) {
      setLocalError('Completa los campos obligatorios');
      return;
    }

    if (includeSalaryRange) {
      const { salaryMin, salaryMax } = form;
      if (salaryMin !== undefined && salaryMin < 0) {
        setLocalError('El salario minimo no puede ser negativo');
        return;
      }
      if (salaryMax !== undefined && salaryMax < 0) {
        setLocalError('El salario maximo no puede ser negativo');
        return;
      }
      if (
        salaryMin !== undefined &&
        salaryMax !== undefined &&
        salaryMax < salaryMin
      ) {
        setLocalError('El salario maximo debe ser mayor o igual al minimo');
        return;
      }
    }

    try {
      await onSubmit({
        ...form,
        notes: form.notes || undefined,
        jobUrl: form.jobUrl || undefined,
        ...(includeSalaryRange
          ? {}
          : {
              salaryMin: undefined,
              salaryMax: undefined,
              salaryCurrency: undefined,
              salaryPeriod: undefined,
              salaryType: undefined,
            }),
      });
      setForm(initialState());
      setSalaryInputs({ min: '', max: '' });
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (showSalaryBlock) {
        setSalaryAnimatingOut(true);
        hideTimeoutRef.current = setTimeout(() => {
          setShowSalaryBlock(false);
          setSalaryAnimatingOut(false);
        }, 220);
      }
      setIncludeSalaryRange(false);
      firstInputRef.current?.focus();
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

  const handleNumberChange = (field: 'salaryMin' | 'salaryMax') => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/[^\d]/g, '');
    const numeric = digitsOnly ? Number(digitsOnly) : undefined;
    const formatted = digitsOnly ? formatNumber(numeric) : '';
    const key = field === 'salaryMin' ? 'min' : 'max';

    setSalaryInputs((prev) => ({ ...prev, [key]: formatted }));
    setForm((prev) => ({
      ...prev,
      [field]: numeric,
    }));
  };

  const handleValueChange = (field: keyof CreateJobApplicationPayload) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectedDate = form.applicationDate ? parseISO(form.applicationDate) : undefined;
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    if (success) {
      setIsSuccessDismissed(false);
    }
  }, [success]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showSalaryBlock) {
      setSalaryContainerHeight(0);
      return;
    }
    const measure = () => {
      if (salaryContentRef.current) {
        const nextHeight = salaryContentRef.current.scrollHeight;
        setSalaryContainerHeight(nextHeight);
        if (salaryAnimatingOut) {
          requestAnimationFrame(() => setSalaryContainerHeight(0));
        }
      }
    };
    measure();
  }, [
    showSalaryBlock,
    salaryAnimatingOut,
    salaryInputs.min,
    salaryInputs.max,
    form.salaryCurrency,
    form.salaryPeriod,
    form.salaryType,
  ]);

  const toggleSalaryRange = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    const next = !includeSalaryRange;
    setIncludeSalaryRange(next);
    setForm((current) => {
      if (next) {
        setSalaryAnimatingOut(false);
        setShowSalaryBlock(true);
        const updated = {
          ...current,
          salaryCurrency: current.salaryCurrency ?? DEFAULT_SALARY_CURRENCY,
          salaryPeriod: current.salaryPeriod ?? DEFAULT_SALARY_PERIOD,
        };
        setSalaryInputs({
          min: formatNumber(updated.salaryMin),
          max: formatNumber(updated.salaryMax),
        });
        return updated;
      }
      setSalaryAnimatingOut(true);
      setShowSalaryBlock(true);
      setSalaryInputs({ min: '', max: '' });
      hideTimeoutRef.current = setTimeout(() => {
        setShowSalaryBlock(false);
        setSalaryAnimatingOut(false);
      }, 220);
      return {
        ...current,
        salaryMin: undefined,
        salaryMax: undefined,
        salaryCurrency: undefined,
        salaryPeriod: undefined,
        salaryType: undefined,
      };
    });
  };

  return (
    <>
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
           inputRef={firstInputRef as unknown as React.RefObject<HTMLInputElement>}
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
          placeholder="Detalles, proximos pasos o recordatorios"
        />
      </div>

      <div
        className="overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: showSalaryBlock ? salaryContainerHeight : 0 }}
      >
        {showSalaryBlock && (
          <div
            ref={salaryContentRef}
            className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
            style={{
              animation: `${salaryAnimatingOut ? 'fadeSlideOut' : 'fadeSlideIn'} 220ms ease-out`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-900">Rango salarial</p>
                <p className="text-xs text-slate-600">Completa solo si lo tenes disponible.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Salario minimo</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={salaryInputs.min}
                  onChange={handleNumberChange('salaryMin')}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label>Salario maximo</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={salaryInputs.max}
                  onChange={handleNumberChange('salaryMax')}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label>Moneda</Label>
                <Select
                  value={form.salaryCurrency ?? DEFAULT_SALARY_CURRENCY}
                  onValueChange={(value) => handleValueChange('salaryCurrency')(value as SalaryCurrency)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Selecciona moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS">ARS</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Periodo</Label>
                <Select
                  value={form.salaryPeriod ?? DEFAULT_SALARY_PERIOD}
                  onValueChange={(value) => handleValueChange('salaryPeriod')(value as SalaryPeriod)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Selecciona periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensual">Mensual</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                    <SelectItem value="Hora">Hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Tipo (opcional)</Label>
                <Select
                  value={form.salaryType ?? undefined}
                  onValueChange={(value) => handleValueChange('salaryType')(value as SalaryType)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Selec. tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bruto">Bruto</SelectItem>
                    <SelectItem value="Neto">Neto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {(localError || error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {localError || error}
        </div>
      )}
      {success && !localError && !error && !isSuccessDismissed && (
        <div className="relative rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-800">
          <div className="space-y-1 pr-6">
            <p className="font-medium text-green-900">{success.message}</p>
            <p className="text-xs text-green-800">
              Ultima empresa: <span className="font-semibold">{success.company}</span>
              {success.position ? ` - Puesto: ${success.position}` : ''}
            </p>
          </div>
          <button
            type="button"
            className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-600"
            onClick={() => setIsSuccessDismissed(true)}
            aria-label="Cerrar mensaje de exito"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-end">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Agregar rango salarial</span>
            <button
              type="button"
              role="switch"
              aria-checked={includeSalaryRange}
              onClick={toggleSalaryRange}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${
                includeSalaryRange ? 'bg-slate-900' : 'bg-slate-200'
              }`}
            >
              <span
                className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                style={{
                  transform: includeSalaryRange ? 'translateX(1.25rem)' : 'translateX(0)',
                }}
              />
              <span className="sr-only">Toggle salary range</span>
            </button>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Registrar postulacion'}
          </Button>
        </div>
      </form>
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeSlideOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(8px);
          }
        }
      `}</style>
    </>
  );
}
