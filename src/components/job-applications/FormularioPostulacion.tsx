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
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
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
  const [open, setOpen] = useState(true);
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
  const companyInputRef = useRef<HTMLInputElement>(null);

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
      <div className="rounded-none border border-border bg-surface transition-all duration-300 hover:border-ink-soft/30 shadow-sm">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="group flex w-full items-start justify-between gap-3 px-6 py-5 text-left"
          aria-expanded={open}
          aria-controls="registro-postulacion-body"
        >
          <div className="space-y-1.5">
            <h2 className="text-[1.1rem] font-semibold tracking-tight text-ink">
              Registrar nueva postulacion
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-ink-muted/70">
              Suma tu siguiente paso y mantene tu progreso visible.
            </p>
          </div>
          <ChevronDown
            className={`mt-1 h-5 w-5 text-ink-soft transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        <div
          className={`grid transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            }`}
        >
          <div className="overflow-hidden">
            <div className="mx-6 h-[1px] bg-border/40" />
            <form
              id="registro-postulacion-body"
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className={`space-y-8 px-6 py-8 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'translate-y-0' : '-translate-y-4'
                }`}
            >
              <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
                {[
                  <SuggestionInput
                    key="puesto"
                    label="Puesto"
                    value={form.position}
                    onChange={handleValueChange('position')}
                    options={suggestions.positions}
                    persistKey="suggestions-positions-removed"
                    required
                    inputRef={firstInputRef as unknown as React.RefObject<HTMLInputElement>}
                    onEnter={() => companyInputRef.current?.focus()}
                    onTab={() => companyInputRef.current?.focus()}
                  />,
                  <div key="empresa" className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted/70">
                      Empresa *
                    </Label>
                    <Input
                      type="text"
                      className="border-border/60 bg-surface/50 transition-all duration-200 focus:bg-surface focus:shadow-sm"
                      value={form.company}
                      onChange={handleChange('company')}
                      placeholder="Ej. Acme Corp"
                      required
                      ref={companyInputRef}
                    />
                  </div>,
                  <SuggestionInput
                    key="fuente"
                    label="Fuente"
                    value={form.source}
                    onChange={handleValueChange('source')}
                    options={suggestions.sources}
                    persistKey="suggestions-sources-removed"
                    required
                  />,
                  <div key="fecha" className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted/70">
                      Fecha de postulacion *
                    </Label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-border/60 bg-surface/50 text-left font-normal transition-all duration-200 hover:border-ink-soft/40 hover:bg-surface"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-ink-soft" />
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
                            setForm((prev) => ({ ...prev, applicationDate: value }));
                            setDateOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>,
                  <div key="estado" className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted/70">
                      Estado *
                    </Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as JobStatus }))}
                    >
                      <SelectTrigger id="status" className="border-border/60 bg-surface/50 transition-all duration-200 hover:border-ink-soft/40 hover:bg-surface" aria-label="Estado de la postulacion">
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(JobStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {getJobStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>,
                  <div key="url" className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted/70">
                      URL de la oferta
                    </Label>
                    <Input
                      type="url"
                      className="border-border/60 bg-surface/50 transition-all duration-200 focus:bg-surface"
                      value={form.jobUrl}
                      onChange={handleChange('jobUrl')}
                      placeholder="https://..."
                    />
                  </div>,
                  <div key="notas" className="space-y-2 lg:col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted/70">
                      Notas
                    </Label>
                    <Textarea
                      className="min-h-[100px] border-border/60 bg-surface/50 transition-all duration-200 focus:bg-surface"
                      value={form.notes}
                      onChange={handleChange('notes')}
                      rows={3}
                      placeholder="Detalles, proximos pasos o recordatorios"
                    />
                  </div>
                ].map((item, i) => (
                  <div
                    key={i}
                    className="stagger-item relative"
                    style={{
                      '--delay': `${(i + 1) * 40}ms`,
                      zIndex: 50 - i,
                    } as React.CSSProperties}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {(localError || error) && (
                <div className="animate-in fade-in slide-in-from-top-1 rounded-card border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-primary shadow-sm duration-300">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    {localError || error}
                  </div>
                </div>
              )}
              {success && !localError && !error && !isSuccessDismissed && (
                <div className="animate-in fade-in slide-in-from-top-2 relative overflow-hidden rounded-card border border-success-text/10 bg-success-bg/20 px-4 py-4 text-sm text-success-text shadow-sm duration-500 ease-out">
                  <div className="absolute left-0 top-0 h-full w-0.5 bg-success-text opacity-40" />
                  <div className="space-y-1 pr-8">
                    <p className="font-semibold text-success-text">{success.message}</p>
                    <p className="text-xs text-ink-muted/80">
                      Ultima empresa: <span className="font-medium text-ink">{success.company}</span>
                      {success.position ? ` · Puesto: ${success.position}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="absolute right-3 top-4 inline-flex h-6 w-6 items-center justify-center rounded-md text-ink-soft transition-all duration-200 hover:bg-surface hover:text-ink hover:shadow-sm"
                    onClick={() => setIsSuccessDismissed(true)}
                    aria-label="Cerrar mensaje de exito"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-col items-end pt-8 pb-2">
                <div
                  className="flex items-center gap-4 group cursor-pointer"
                  onClick={toggleSalaryRange}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted/50 transition-colors group-hover:text-ink">
                    Agregar rango salarial
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={includeSalaryRange}
                    className={`relative flex h-[18px] w-9 items-center rounded-[3px] border transition-all duration-300 ease-out ${includeSalaryRange ? 'border-ink bg-ink' : 'border-border bg-surface'
                      }`}
                  >
                    <span
                      className={`absolute left-[2px] h-3 w-3 rounded-[1px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${includeSalaryRange
                        ? 'translate-x-[19px] bg-white'
                        : 'translate-x-0 bg-ink-soft/30 group-hover:bg-ink-soft/50'
                        }`}
                    />
                    <span className="sr-only">Toggle salary range</span>
                  </button>
                </div>
              </div>

              <div
                className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${includeSalaryRange ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
              >
                <div className="overflow-hidden">
                  <div className={`space-y-6 pt-2 pb-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${includeSalaryRange ? 'translate-y-0' : '-translate-y-4'}`}>
                    <div className="grid gap-6 md:grid-cols-4">
                      {[
                        <div key="min" className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted/70">
                            Salario minimo
                          </Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            className="border-border/60 bg-surface/50 focus:bg-surface"
                            value={salaryInputs.min}
                            onChange={handleNumberChange('salaryMin')}
                            placeholder="0"
                          />
                        </div>,
                        <div key="max" className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted/70">
                            Salario maximo
                          </Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            className="border-border/60 bg-surface/50 focus:bg-surface"
                            value={salaryInputs.max}
                            onChange={handleNumberChange('salaryMax')}
                            placeholder="0"
                          />
                        </div>,
                        <div key="curr" className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted/70">
                            Moneda
                          </Label>
                          <Select
                            value={form.salaryCurrency ?? DEFAULT_SALARY_CURRENCY}
                            onValueChange={(value) => handleValueChange('salaryCurrency')(value as SalaryCurrency)}
                          >
                            <SelectTrigger className="border-border/60 bg-surface/50 hover:bg-surface">
                              <SelectValue placeholder="Selecciona moneda" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ARS">ARS</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>,
                        <div key="per" className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted/70">
                            Periodo
                          </Label>
                          <Select
                            value={form.salaryPeriod ?? DEFAULT_SALARY_PERIOD}
                            onValueChange={(value) => handleValueChange('salaryPeriod')(value as SalaryPeriod)}
                          >
                            <SelectTrigger className="border-border/60 bg-surface/50 hover:bg-surface">
                              <SelectValue placeholder="Selecciona periodo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mensual">Mensual</SelectItem>
                              <SelectItem value="Anual">Anual</SelectItem>
                              <SelectItem value="Hora">Hora</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ]}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-0">
                <div className="h-[1px] w-full bg-border/40" />
                <div className="mt-8 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="group w-full px-8 py-6 lg:w-auto shadow-sm active:scale-[0.98] transition-all duration-200"
                  >
                    <span className="flex items-center justify-center gap-2 font-semibold tracking-wide">
                      {loading ? 'Guardando...' : 'Registrar postulacion'}
                    </span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .stagger-item {
          opacity: 0;
          transform: translateY(10px);
          transition: all 500ms cubic-bezier(0.16, 1, 0.3, 1);
          transition-delay: var(--delay);
        }
        [aria-expanded="true"] + div .stagger-item {
          opacity: 1;
          transform: translateY(0);
        }
        
        [aria-expanded="false"] + div .stagger-item {
          transition: all 250ms ease-in-out;
          transition-delay: 0ms !important;
          opacity: 0;
          transform: translateY(-5px);
        }
      `}</style>
    </>
  );
}
