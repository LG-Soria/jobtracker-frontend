'use client';

// Specification: Table listing job applications with basic filters and actions.
// Renders list grouped by fecha seleccionada, with status change, delete action, and friendly states.

import { Fragment, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getJobStatusLabel, JobApplication, JobStatus } from '../../types/jobApplication';
import { dateKeyUTC, formatDateOnlyUTC, parseDateOnlyUTC } from '../../utils/dateOnly';
import { ApplicationsTableSkeleton } from './Skeletons';

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
    if (!(target instanceof HTMLElement)) return false;
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
        return (
          parseDateOnlyUTC(b.applicationDate).getTime() -
          parseDateOnlyUTC(a.applicationDate).getTime()
        );
      }),
    [applications],
  );

  const uniqueDates = useMemo(() => {
    const dateSet = new Set<string>();
    sorted.forEach((app) => dateSet.add(dateKeyUTC(app.applicationDate)));
    return Array.from(dateSet).sort(
      (a, b) => parseDateOnlyUTC(b).getTime() - parseDateOnlyUTC(a).getTime(),
    );
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

  const handleDelete = async (id: string) => {
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

  const isPrevDisabled = !selectedDate || uniqueDates.indexOf(selectedDate) === uniqueDates.length - 1;
  const isNextDisabled = !selectedDate || uniqueDates.indexOf(selectedDate) <= 0;
  const byDayView = filters.viewMode === 'byDay';
  const trimmedSearch = search.term.trim();
  const isPrevPageDisabled = pagination.page <= 1 || loading || pagination.totalPages === 0;
  const isNextPageDisabled =
    loading || pagination.totalPages === 0 || pagination.page >= pagination.totalPages;
  const hasResults = sorted.length > 0;
  const showInitialSkeleton = loading && !hasResults && !error;
  const showRefetchOverlay = loading && hasResults;
  const showEmptyState = !loading && !error && !hasResults;
  const emptyState = buildEmptyState({ searchTerm: trimmedSearch, byDayView });
  const safeTotalPages = Math.max(pagination.totalPages || 0, 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Postulaciones en curso</h3>
            <p className="text-sm text-slate-600">Seguimiento de tus oportunidades y proximos pasos</p>
          </div>
          {byDayView && selectedDate && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <button
                className="rounded-md border border-slate-200 px-2 py-1 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handlePrevDate}
                disabled={isPrevDisabled || loading}
                type="button"
                aria-label="Ver fecha anterior"
              >
                &#8592;
              </button>
              <span className="font-semibold">{formatDateOnlyUTC(selectedDate)}</span>
              <button
                className="rounded-md border border-slate-200 px-2 py-1 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleNextDate}
                disabled={isNextDisabled || loading}
                type="button"
                aria-label="Ver fecha siguiente"
              >
                &#8594;
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search.term}
            onChange={(e) => search.setTerm(e.target.value)}
            placeholder="Buscar por empresa o puesto"
            className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-700">
            <button
              className={`rounded-md px-3 py-1 transition ${
                byDayView
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
              type="button"
              onClick={() => filters.setViewMode('byDay')}
            >
              Ver por dia
            </button>
            <button
              className={`rounded-md px-3 py-1 transition ${
                !byDayView
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
              type="button"
              onClick={() => filters.setViewMode('all')}
            >
              Todas las publicaciones
            </button>
          </div>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            value={filters.status}
            onChange={(e) => filters.setStatus(e.target.value as JobStatus | 'all')}
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'all' ? 'Todos los estados' : getJobStatusLabel(opt)}
              </option>
            ))}
          </select>
          {!byDayView && (
            <select
              className="rounded-lg border border-slate-200 px-3 pr-8 py-2 text-sm focus:border-slate-400 focus:outline-none"
              value={filters.dateRange}
              onChange={(e) => filters.setDateRange(e.target.value as 'all' | '7d' | '30d')}
            >
              {dateRangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {success && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      {error ? <ErrorCallout message={error} onRetry={onRetry} /> : null}

      {showInitialSkeleton ? (
        <ApplicationsTableSkeleton />
      ) : showEmptyState ? (
        <EmptyState title={emptyState.title} description={emptyState.description} />
      ) : hasResults ? (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
            <div>
              Mostrando {applications.length} de {pagination.total} postulaciones
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                <span>Por pagina</span>
                <select
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-slate-400 focus:outline-none"
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
              </label>
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                <button
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
                  disabled={isPrevPageDisabled}
                  type="button"
                >
                  Anterior
                </button>
                <span className="px-1 text-xs">
                  Pagina {pagination.page} de {safeTotalPages}
                </span>
                <button
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => pagination.setPage(pagination.page + 1)}
                  disabled={isNextPageDisabled}
                  type="button"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <div className="relative overflow-hidden rounded-lg border border-slate-200">
              {showRefetchOverlay ? <TableLoadingOverlay /> : null}
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white">
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-3 py-2">Empresa</th>
                    <th className="px-3 py-2">Puesto</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Fuente</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                    <th className="w-12 px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {byDayView && selectedDate ? (
                    <>
                      <tr>
                        <td
                          colSpan={6}
                          className="bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                          {formatDateOnlyUTC(selectedDate)}
                        </td>
                      </tr>
                      {appsForSelectedDate.map((app) => (
                        <tr
                          key={app.id}
                          className="border-b border-slate-100 text-slate-800 transition hover:bg-slate-50 focus-within:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 cursor-pointer"
                          onClick={(event) => navigateToDetail(event, app.id)}
                          onKeyDown={(event) => navigateToDetail(event, app.id)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Ver detalle de ${app.company} - ${app.position}`}
                        >
                          <td className="px-3 py-2">{app.company}</td>
                          <td className="px-3 py-2">{app.position}</td>
                          <td className="px-3 py-2">{getJobStatusLabel(app.status)}</td>
                          <td className="px-3 py-2">{app.source}</td>
                          <td className="px-3 py-2 text-right">
                            <select
                              className="rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-slate-400 focus:outline-none"
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              disabled={loading}
                              data-row-ignore
                            >
                              {Object.values(JobStatus).map((status) => (
                                <option key={status} value={status}>
                                  {getJobStatusLabel(status)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              onClick={() => handleDelete(app.id)}
                              disabled={loading}
                              type="button"
                              aria-label="Eliminar postulacion"
                              data-row-ignore
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M5 6l1 14h12l1-14" />
                              </svg>
                            </button>
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
                            className="bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                          >
                            {formatDateOnlyUTC(dateKey)}
                          </td>
                        </tr>
                        {(appsByDate.get(dateKey) ?? []).map((app) => (
                          <tr
                            key={app.id}
                            className="border-b border-slate-100 text-slate-800 transition hover:bg-slate-50 focus-within:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 cursor-pointer"
                            onClick={(event) => navigateToDetail(event, app.id)}
                            onKeyDown={(event) => navigateToDetail(event, app.id)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Ver detalle de ${app.company} - ${app.position}`}
                          >
                            <td className="px-3 py-2">{app.company}</td>
                            <td className="px-3 py-2">{app.position}</td>
                            <td className="px-3 py-2">{getJobStatusLabel(app.status)}</td>
                            <td className="px-3 py-2">{app.source}</td>
                            <td className="px-3 py-2 text-right">
                              <select
                                className="rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-slate-400 focus:outline-none"
                                value={app.status}
                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                disabled={loading}
                                data-row-ignore
                              >
                                {Object.values(JobStatus).map((status) => (
                                  <option key={status} value={status}>
                                    {getJobStatusLabel(status)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                onClick={() => handleDelete(app.id)}
                                disabled={loading}
                                type="button"
                                aria-label="Eliminar postulacion"
                                data-row-ignore
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                  <path d="M5 6l1 14h12l1-14" />
                                </svg>
                              </button>
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
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      <div>{message}</div>
      {onRetry ? (
        <button
          className="mt-2 rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white"
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
    <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
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
      description: `No encontramos coincidencias para "${searchTerm}". Ajusta la palabra clave o quita filtros.`,
    };
  }

  if (byDayView) {
    return {
      title: 'Sin datos en el dia seleccionado',
      description:
        'Todavia no registraste postulaciones para esta fecha. Proba cambiar la vista o agregar una nueva.',
    };
  }

  return {
    title: 'Aun no hay postulaciones',
    description:
      'Registra tu primera postulacion para empezar a medir tu avance y ver las metricas arriba.',
  };
}

function TableLoadingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 bg-white/70 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </div>
  );
}
