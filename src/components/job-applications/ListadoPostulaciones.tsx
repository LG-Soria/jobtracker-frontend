'use client';

// Specification: Table listing job applications with refined UI and stable layout.
// Focuses on elegance, subtle animations, and consistent positioning of controls.

import { Fragment, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getJobStatusLabel, JobApplication, JobStatus } from '../../types/jobApplication';
import { dateKeyUTC, formatDateOnlyUTC, parseDateOnlyUTC } from '../../utils/dateOnly';
import { ApplicationsTableSkeleton } from './Skeletons';
import { Badge, type BadgeProps } from '../ui/badge';
import { Trash2 } from 'lucide-react';

type FiltersProps = {
  status: JobStatus | 'all';
  setStatus: (value: JobStatus | 'all') => void;
  dateRange: 'all' | '7d' | '30d';
  setDateRange: (value: 'all' | '7d' | '30d') => void;
  viewMode: 'byDay' | 'all';
  setViewMode: (value: 'byDay' | 'all') => void;
};

type PaginationControls = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  setPage: (value: number) => void;
  setLimit: (value: number) => void;
};

type SearchControls = {
  term: string;
  setTerm: (value: string) => void;
};

type ListadoPostulacionesProps = {
  applications: JobApplication[];
  loading?: boolean;
  error?: string | null;
  filters: FiltersProps;
  pagination: PaginationControls;
  search: SearchControls;
  onChangeStatus: (id: string, status: JobStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRetry?: () => void;
  success?: string | null;
};

const statusOptions: (JobStatus | 'all')[] = [
  'all',
  JobStatus.ENVIADA,
  JobStatus.EN_PROCESO,
  JobStatus.ENTREVISTA,
  JobStatus.RECHAZADA,
  JobStatus.SIN_RESPUESTA,
];

const dateRangeOptions: { value: 'all' | '7d' | '30d'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: '7d', label: 'Ultimos 7 dias' },
  { value: '30d', label: 'Ultimos 30 dias' },
];

export function ListadoPostulaciones({
  applications,
  loading = false,
  error = null,
  filters,
  pagination,
  search,
  onChangeStatus,
  onDelete,
  onRetry,
  success = null,
}: ListadoPostulacionesProps) {
  const router = useRouter();

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest('select') ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[data-row-ignore]'),
    );
  };

  const navigateToDetail = (
    event: ReactMouseEvent<HTMLTableRowElement> | ReactKeyboardEvent<HTMLTableRowElement>,
    id: string,
  ) => {
    if (isInteractiveTarget(event.target)) return;
    if ('key' in event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
    }
    router.push(`/dashboard/applications/${id}`, { scroll: false });
  };

  const sorted = useMemo(
    () =>
      [...applications].sort((a, b) => {
        const createdDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (createdDiff !== 0) return createdDiff;
        const dateB = parseDateOnlyUTC(b.applicationDate);
        const dateA = parseDateOnlyUTC(a.applicationDate);
        return (dateB?.getTime() ?? 0) - (dateA?.getTime() ?? 0);
      }),
    [applications],
  );

  const uniqueDates = useMemo(() => {
    const dateSet = new Set<string>();
    sorted.forEach((app) => {
      const key = dateKeyUTC(app.applicationDate);
      if (key) dateSet.add(key);
    });
    return Array.from(dateSet).sort((a, b) => {
      const dateB = parseDateOnlyUTC(b);
      const dateA = parseDateOnlyUTC(a);
      return (dateB?.getTime() ?? 0) - (dateA?.getTime() ?? 0);
    });
  }, [sorted]);

  const [selectedDate, setSelectedDate] = useState<string | null>(uniqueDates[0] ?? null);
  const appsByDate = useMemo(() => {
    const map = new Map<string, JobApplication[]>();
    sorted.forEach((app) => {
      const key = dateKeyUTC(app.applicationDate);
      const current = map.get(key) ?? [];
      current.push(app);
      map.set(key, current);
    });
    return map;
  }, [sorted]);

  const todayKey = dateKeyUTC(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!uniqueDates.length) {
      setSelectedDate(null);
      return;
    }
    if (!selectedDate || !uniqueDates.includes(selectedDate)) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [uniqueDates, selectedDate]);

  const appsForSelectedDate = useMemo(
    () => (selectedDate ? appsByDate.get(selectedDate) ?? [] : []),
    [appsByDate, selectedDate],
  );

  const handleStatusChange = async (id: string, status: string) => {
    await onChangeStatus(id, status as JobStatus);
  };

  const handleDelete = async (e: ReactMouseEvent | ReactKeyboardEvent, id: string) => {
    e.stopPropagation();
    await onDelete(id);
  };

  const handlePrevDate = () => {
    if (!selectedDate) return;
    const idx = uniqueDates.indexOf(selectedDate);
    if (idx === -1 || idx === uniqueDates.length - 1) return;
    setSelectedDate(uniqueDates[idx + 1]);
  };

  const handleNextDate = () => {
    if (!selectedDate) return;
    const idx = uniqueDates.indexOf(selectedDate);
    if (idx <= 0) return;
    setSelectedDate(uniqueDates[idx - 1]);
  };

  const handleGoToToday = () => {
    if (uniqueDates.includes(todayKey)) {
      setSelectedDate(todayKey);
    } else if (uniqueDates.length > 0) {
      setSelectedDate(uniqueDates[0]);
    }
  };

  const isPrevDisabled = !selectedDate || uniqueDates.indexOf(selectedDate) === uniqueDates.length - 1;
  const isNextDisabled = !selectedDate || uniqueDates.indexOf(selectedDate) <= 0;
  const isTodaySelected = selectedDate === todayKey;
  const byDayView = filters.viewMode === 'byDay';
  const isPrevPageDisabled = pagination.page <= 1 || loading || pagination.totalPages === 0;
  const isNextPageDisabled =
    loading || pagination.totalPages === 0 || pagination.page >= pagination.totalPages;
  const hasResults = sorted.length > 0;
  const showInitialSkeleton = loading && !hasResults && !error;
  const showRefetchOverlay = loading && hasResults;
  const showEmptyState = !loading && !error && !hasResults;
  const safeTotalPages = Math.max(pagination.totalPages || 0, 1);
  const statusVariant = (status: JobStatus): BadgeProps['variant'] => {
    if (status === JobStatus.ENVIADA) return 'info';
    if (status === JobStatus.EN_PROCESO) return 'warning';
    if (status === JobStatus.RECHAZADA) return 'danger';
    return 'neutral';
  };

  return (
    <div className="space-y-10 rounded-none border border-border/50 bg-white p-10 transition-all duration-500 ease-in-out">
      <div className="flex flex-col gap-10">
        {/* Superior Row: Title, Date Nav (if byDay), and View Toggle (Fixed) */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2 flex-1 min-w-[250px]">
            <h3 className="text-3xl font-light tracking-tight text-ink">Postulaciones en curso</h3>
            <p className="text-sm font-light text-ink-muted leading-relaxed truncate">Seguimiento de tus oportunidades y próximos pasos</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Date Navigator in Row 1 */}
            <div
              className={`flex items-center gap-5 transition-all duration-300 ease-in-out ${byDayView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none w-0 overflow-hidden'}`}
              style={{ width: byDayView ? 'auto' : '0' }}
            >
              <div className="flex items-center gap-4 py-1.5 px-5 rounded-full border border-border/20 bg-surface-muted/20">
                <button
                  className="text-ink-soft transition-all duration-300 hover:text-ink disabled:opacity-10 transform hover:scale-110 active:scale-90"
                  onClick={handlePrevDate}
                  disabled={isPrevDisabled || loading}
                  type="button"
                  aria-label="Ver fecha anterior"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <span className="text-[13px] font-medium tracking-tight text-ink-muted min-w-[85px] text-center">
                  {selectedDate ? formatDateOnlyUTC(selectedDate) : '-'}
                </span>
                <button
                  className="text-ink-soft transition-all duration-300 hover:text-ink disabled:opacity-10 transform hover:scale-110 active:scale-90"
                  onClick={handleNextDate}
                  disabled={isNextDisabled || loading}
                  type="button"
                  aria-label="Ver fecha siguiente"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>

              {!isTodaySelected && (
                <button
                  onClick={handleGoToToday}
                  className="px-3 py-1.5 rounded-full border border-ink/10 bg-white text-[11px] font-bold uppercase tracking-widest text-ink/60 hover:text-ink hover:border-ink/20 transition-all duration-300 active:scale-95 shadow-sm"
                  type="button"
                >
                  Hoy
                </button>
              )}
            </div>

            {/* View Toggle - Stable positioning */}
            <div className="flex items-center gap-1 rounded-card border border-border/30 bg-surface-muted/30 p-1 text-[10px] font-bold uppercase tracking-widest">
              <button
                className={`rounded px-5 py-2.5 transition-all duration-300 ${byDayView
                  ? 'bg-ink text-white shadow-md'
                  : 'text-ink-soft hover:text-ink-muted'
                  }`}
                type="button"
                onClick={() => filters.setViewMode('byDay')}
              >
                Ver por día
              </button>
              <button
                className={`rounded px-5 py-2.5 transition-all duration-300 ${!byDayView
                  ? 'bg-ink text-white shadow-md'
                  : 'text-ink-soft hover:text-ink-muted'
                  }`}
                type="button"
                onClick={() => filters.setViewMode('all')}
              >
                Todas las publicaciones
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar: Search (Left) and Selects (Right) */}
        <div className="flex flex-wrap items-center justify-between gap-8 border-b border-border/10 pb-6">
          <div className="flex-1 min-w-[350px] group transition-all duration-300">
            <div className="relative">
              <input
                type="search"
                value={search.term}
                onChange={(e) => search.setTerm(e.target.value)}
                placeholder="Buscar por empresa o puesto"
                className="w-full bg-transparent py-3 text-base font-light text-ink placeholder:text-ink-soft/40 focus:outline-none transition-all duration-300 border-b border-transparent focus:border-ink/20"
              />
              <div className="absolute bottom-[-1px] left-0 h-[1px] w-0 bg-ink transition-all duration-700 group-focus-within:w-full" />
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* Select Filters (Horizontal) */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <select
                  className="appearance-none rounded border border-border/20 bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-ink transition-all duration-300 hover:border-border/60 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/5 pr-10"
                  value={filters.status}
                  onChange={(e) => filters.setStatus(e.target.value as JobStatus | 'all')}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === 'all' ? 'Todos los estados' : getJobStatusLabel(opt)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft group-hover:text-ink transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>

              {!byDayView && (
                <div className="relative group animate-in fade-in slide-in-from-right-2">
                  <select
                    className="appearance-none rounded border border-border/20 bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-ink transition-all duration-300 hover:border-border/60 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/5 pr-10"
                    value={filters.dateRange}
                    onChange={(e) => filters.setDateRange(e.target.value as 'all' | '7d' | '30d')}
                  >
                    {dateRangeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft group-hover:text-ink transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="mt-6 rounded border border-success-text/10 bg-success-bg/20 px-6 py-4 text-sm text-success-text animate-in fade-in duration-500">
          {success}
        </div>
      )}

      {error ? <ErrorCallout message={error} onRetry={onRetry} /> : null}

      {showInitialSkeleton ? (
        <ApplicationsTableSkeleton />
      ) : showEmptyState ? (
        <EmptyState
          title={buildEmptyState({ searchTerm: search.term.trim(), byDayView }).title}
          description={buildEmptyState({ searchTerm: search.term.trim(), byDayView }).description}
        />
      ) : hasResults ? (
        <>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 text-sm text-ink-muted animate-in fade-in duration-700">
            <div className="font-light tracking-tight">
              Mostrando <span className="text-ink font-medium">{applications.length}</span> de <span className="text-ink font-medium">{pagination.total}</span> postulaciones
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Por página</span>
                <div className="relative group">
                  <select
                    className="appearance-none rounded border border-border/20 bg-white px-5 pr-10 py-2.5 text-[11px] font-bold text-ink transition-all duration-300 hover:border-border/60 focus:border-ink focus:outline-none"
                    value={pagination.limit}
                    onChange={(e) => pagination.setLimit(Number(e.target.value))}
                    disabled={loading}
                  >
                    {[20, 50].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft group-hover:text-ink transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center rounded border border-border/20 overflow-hidden bg-white shadow-sm ring-1 ring-border/5">
                <button
                  className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted transition-all duration-300 hover:bg-surface-muted hover:text-ink disabled:opacity-10 disabled:hover:bg-transparent"
                  onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
                  disabled={isPrevPageDisabled}
                  type="button"
                >
                  Anterior
                </button>
                <div className="h-4 w-[1px] bg-border/20" />
                <span className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft/60 bg-surface-muted/10">
                  {pagination.page} <span className="text-border mx-2">/</span> {safeTotalPages}
                </span>
                <div className="h-4 w-[1px] bg-border/20" />
                <button
                  className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted transition-all duration-300 hover:bg-surface-muted hover:text-ink disabled:opacity-10 disabled:hover:bg-transparent"
                  onClick={() => pagination.setPage(pagination.page + 1)}
                  disabled={isNextPageDisabled}
                  type="button"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-card border border-border/20 bg-white shadow-xl shadow-ink/5">
            <div className="relative overflow-hidden">
              {showRefetchOverlay ? <TableLoadingOverlay /> : null}
              <table className="min-w-full text-left text-sm border-separate border-spacing-0">
                <thead>
                  <tr className="border-b border-border text-[9px] uppercase font-bold tracking-[0.2em] text-ink-soft bg-surface-muted/10">
                    <th className="px-10 py-6 border-b border-border/10">Empresa</th>
                    <th className="px-10 py-6 border-b border-border/10">Puesto</th>
                    <th className="px-10 py-6 border-b border-border/10">Estado</th>
                    <th className="px-10 py-6 border-b border-border/10">Fuente</th>
                    <th colSpan={2} className="px-10 py-6 border-b border-border/10 text-right pr-20">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {byDayView && selectedDate ? (
                    <>
                      <tr>
                        <td
                          colSpan={6}
                          className="px-10 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40 bg-surface-muted/40 border-b border-border/5"
                        >
                          {formatDateOnlyUTC(selectedDate)}
                        </td>
                      </tr>
                      {appsForSelectedDate.map((app) => (
                        <tr
                          key={app.id}
                          className="text-ink transition-all duration-500 ease-out hover:bg-surface-muted/20 group border-b border-border/10 last:border-0 cursor-pointer animate-in fade-in slide-in-from-left-1"
                          onClick={(event) => navigateToDetail(event, app.id)}
                          onKeyDown={(event) => navigateToDetail(event, app.id)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Ver detalle de ${app.company} - ${app.position}`}
                        >
                          <td className="px-10 py-7">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold tracking-tight text-[15px] text-ink">{app.company}</span>
                            </div>
                          </td>
                          <td className="px-10 py-7">
                            <span className="font-normal text-ink-muted text-[14px]">{app.position}</span>
                          </td>
                          <td className="px-10 py-7">
                            <Badge variant={statusVariant(app.status)}>
                              {getJobStatusLabel(app.status)}
                            </Badge>
                          </td>
                          <td className="px-10 py-7 text-ink-soft/70 font-normal text-[13px]">{app.source}</td>
                          <td className="px-10 py-7 text-right" colSpan={2}>
                            <div className="flex items-center justify-end gap-3 pr-4">
                              <div className="relative group/select">
                                <select
                                  className="appearance-none rounded border border-border/40 bg-white px-4 pr-10 py-2 text-[12px] font-medium text-ink-muted transition-all duration-300 hover:border-ink-soft/30 hover:bg-surface-muted/30 focus:outline-none cursor-pointer"
                                  value={app.status}
                                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  disabled={loading}
                                  data-row-ignore
                                >
                                  {Object.values(JobStatus).map((status) => (
                                    <option key={status} value={status} className="bg-white text-ink font-sans">
                                      {getJobStatusLabel(status)}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft/50 group-hover/select:text-ink-soft transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                              </div>
                              <button
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-danger/10 bg-danger-soft/5 text-danger transition-all duration-300 hover:bg-danger-soft/20 hover:border-danger/30 focus-visible:outline-none disabled:opacity-10 active:scale-90"
                                onClick={(e) => handleDelete(e, app.id)}
                                disabled={loading}
                                type="button"
                                aria-label="Eliminar postulacion"
                                data-row-ignore
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : null}
                  {!byDayView &&
                    uniqueDates.map((dateKey) => (
                      <Fragment key={dateKey}>
                        <tr>
                          <td
                            colSpan={6}
                            className="px-10 py-5 text-[11px] font-bold uppercase tracking-[0.25em] text-ink/40 bg-surface-muted/60 border-y border-border/20 shadow-inner"
                          >
                            {formatDateOnlyUTC(dateKey)}
                          </td>
                        </tr>
                        {(appsByDate.get(dateKey) ?? []).map((app) => (
                          <tr
                            key={app.id}
                            className="text-ink transition-all duration-500 ease-out hover:bg-surface-muted/20 group border-b border-border/10 last:border-0 cursor-pointer animate-in fade-in slide-in-from-left-1"
                            onClick={(event) => navigateToDetail(event, app.id)}
                            onKeyDown={(event) => navigateToDetail(event, app.id)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Ver detalle de ${app.company} - ${app.position}`}
                          >
                            <td className="px-10 py-7">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold tracking-tight text-[15px] text-ink">{app.company}</span>
                              </div>
                            </td>
                            <td className="px-10 py-7">
                              <span className="font-normal text-ink-muted text-[14px]">{app.position}</span>
                            </td>
                            <td className="px-10 py-7">
                              <Badge variant={statusVariant(app.status)}>
                                {getJobStatusLabel(app.status)}
                              </Badge>
                            </td>
                            <td className="px-10 py-7 text-ink-soft/70 font-normal text-[13px]">{app.source}</td>
                            <td className="px-10 py-7 text-right" colSpan={2}>
                              <div className="flex items-center justify-end gap-3 pr-4">
                                <div className="relative group/select">
                                  <select
                                    className="appearance-none rounded border border-border/40 bg-white px-4 pr-10 py-2 text-[12px] font-medium text-ink-muted transition-all duration-300 hover:border-ink-soft/30 hover:bg-surface-muted/30 focus:outline-none cursor-pointer"
                                    value={app.status}
                                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    disabled={loading}
                                    data-row-ignore
                                  >
                                    {Object.values(JobStatus).map((status) => (
                                      <option key={status} value={status} className="bg-white text-ink font-sans">
                                        {getJobStatusLabel(status)}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft/50 group-hover/select:text-ink-soft transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                  </div>
                                </div>
                                <button
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-danger/10 bg-danger-soft/5 text-danger transition-all duration-300 hover:bg-danger-soft/20 hover:border-danger/30 focus-visible:outline-none disabled:opacity-10 active:scale-90"
                                  onClick={(e) => handleDelete(e, app.id)}
                                  disabled={loading}
                                  type="button"
                                  aria-label="Eliminar postulacion"
                                  data-row-ignore
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function ErrorCallout({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mt-8 rounded border border-danger/20 bg-danger-soft/10 px-6 py-4 text-sm text-primary animate-in fade-in slide-in-from-top-1 duration-500">
      <div>{message}</div>
      {onRetry ? (
        <button
          className="mt-4 rounded bg-danger px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary-hover active:scale-95 shadow-lg shadow-danger/20"
          onClick={onRetry}
          type="button"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-12 rounded-card border border-dashed border-border/30 bg-surface-muted/10 px-10 py-16 text-center animate-in fade-in duration-700">
      <p className="text-xl font-light text-ink tracking-tight">{title}</p>
      <p className="mt-4 text-sm font-light text-ink-muted leading-relaxed max-w-sm mx-auto">{description}</p>
    </div>
  );
}

function buildEmptyState({
  searchTerm,
  byDayView,
}: {
  searchTerm: string;
  byDayView: boolean;
}) {
  if (searchTerm) {
    return {
      title: 'Sin resultados por busqueda',
      description: `No encontramos coincidencias para "${searchTerm}". Ajusta la palabra clave o quita filtros para ampliar la búsqueda.`,
    };
  }

  if (byDayView) {
    return {
      title: 'Sin datos en el dia seleccionado',
      description:
        'Todavía no registraste postulaciones para esta fecha. Probá cambiar la vista o agregar una nueva para empezar el seguimiento.',
    };
  }

  return {
    title: 'Aun no hay postulaciones',
    description:
      'Registra tu primera postulación para empezar a medir tu avance y ver las métricas de tu carrera.',
  };
}

function TableLoadingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] transition-all duration-500">
      <div className="absolute inset-x-0 top-0 h-1 overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-ink/20 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}
