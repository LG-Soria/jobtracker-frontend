'use client';

// Hook to manage job applications data lifecycle with server-side pagination and search.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CreateJobApplicationPayload,
  createJobApplication,
  deleteJobApplication,
  getJobApplications,
  PaginatedJobApplicationsResponse,
  PaginationMeta,
  updateJobApplicationStatus,
} from '../services/jobApplicationsApi';
import { JobApplication, JobStatus } from '../types/jobApplication';

export type FormSuccessState = {
  message: string;
  company: string;
  position?: string;
} | null;

type DateRangePreset = 'all' | '7d' | '30d';
type ViewMode = 'byDay' | 'all';

const DEFAULT_PAGINATION: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };
const SEARCH_DEBOUNCE_MS = 350;

export function useJobApplications() {
  const toMessage = useCallback((err: unknown, fallback: string) => {
    return err instanceof Error && err.message ? err.message : fallback;
  }, []);

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [metrics, setMetrics] = useState({ total: 0, last7Days: 0, today: 0 });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<FormSuccessState>(null);
  const [listSuccess, setListSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRangePreset>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('byDay');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGINATION.page);
  const [limit, setLimit] = useState(DEFAULT_PAGINATION.limit);
  const [positionOptions, setPositionOptions] = useState<string[]>([]);
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const metricsKeyRef = useRef('');

  const refreshOptions = useCallback((items: JobApplication[]) => {
    const toOptions = (values: string[]) => {
      const counts = new Map<string, { value: string; count: number }>();
      values.forEach((value) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        const key = trimmed.toLowerCase();
        const prev = counts.get(key);
        counts.set(key, { value: prev?.value ?? trimmed, count: (prev?.count ?? 0) + 1 });
      });
      return Array.from(counts.values())
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
        .map((item) => item.value);
    };

    setPositionOptions(toOptions(items.map((app) => app.position)));
    setSourceOptions(toOptions(items.map((app) => app.source)));
  }, []);

  const buildDateFilters = useCallback(() => {
    if (viewMode !== 'all') return {};
    if (dateRange === '7d' || dateRange === '30d') {
      const daysBack = dateRange === '7d' ? 7 : 30;
      const from = new Date();
      from.setUTCHours(0, 0, 0, 0);
      from.setUTCDate(from.getUTCDate() - daysBack);
      const fromDate = from.toISOString().slice(0, 10);
      return { fromDate };
    }
    return {};
  }, [dateRange, viewMode]);

  const refreshMetrics = useCallback(
    async ({
      total,
      status,
      search,
      baseFromDate,
      metricsKey,
    }: {
      total: number;
      status?: JobStatus;
      search?: string;
      baseFromDate?: string;
      metricsKey?: string;
    }) => {
      setMetricsLoading(true);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const todayIso = today.toISOString().slice(0, 10);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setUTCDate(today.getUTCDate() - 7);
      const sevenDaysIso = sevenDaysAgo.toISOString().slice(0, 10);

      const pickMostRecent = (first?: string, second?: string) => {
        if (!first) return second;
        if (!second) return first;
        return new Date(first) > new Date(second) ? first : second;
      };

      try {
        const [last7Response, todayResponse] = await Promise.all([
          getJobApplications({
            status,
            ...(search ? { q: search } : {}),
            fromDate: pickMostRecent(baseFromDate, sevenDaysIso),
            limit: 1,
            page: 1,
          }),
          getJobApplications({
            status,
            ...(search ? { q: search } : {}),
            fromDate: pickMostRecent(baseFromDate, todayIso),
            limit: 1,
            page: 1,
          }),
        ]);

        if (metricsKey && metricsKeyRef.current !== metricsKey) return;
        setMetrics({
          total,
          last7Days: last7Response.meta.total,
          today: todayResponse.meta.total,
        });
      } catch {
        if (metricsKey && metricsKeyRef.current !== metricsKey) return;
        setMetrics((prev) => ({ ...prev, total }));
      } finally {
        if (!metricsKey || metricsKeyRef.current === metricsKey) {
          setMetricsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateRange, viewMode]);

  const load = useCallback(
    async (override: Partial<{ page: number; limit: number; q: string }> = {}) => {
      setLoading(true);
      setError(null);
      const nextPage = override.page ?? page;
      const nextLimit = override.limit ?? limit;
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const { fromDate } = buildDateFilters();
      const search = override.q ?? debouncedSearch;

      try {
        const response: PaginatedJobApplicationsResponse = await getJobApplications({
          page: nextPage,
          limit: nextLimit,
          ...(status ? { status } : {}),
          ...(fromDate ? { fromDate } : {}),
          ...(search ? { q: search } : {}),
        });

        const { meta: responseMeta, items } = response;

        const metricsKey = `${status ?? 'all'}|${search ?? ''}|${fromDate ?? ''}`;
        if (metricsKeyRef.current !== metricsKey) {
          metricsKeyRef.current = metricsKey;
          void refreshMetrics({
            total: responseMeta.total,
            status,
            search,
            baseFromDate: fromDate,
            metricsKey,
          });
        } else {
          setMetrics((prev) => ({ ...prev, total: responseMeta.total }));
          setMetricsLoading(false);
        }

        if (responseMeta.totalPages > 0 && nextPage > responseMeta.totalPages) {
          setMeta(responseMeta);
          setPage(responseMeta.totalPages);
          return;
        }

        setApplications(items);
        setMeta(responseMeta);
        setPage(responseMeta.page);
        setLimit(responseMeta.limit);
        refreshOptions(items);
      } catch (err) {
        setError(toMessage(err, 'No pudimos cargar tus postulaciones. Intenta de nuevo.'));
        setMetricsLoading(false);
      } finally {
        setLoading(false);
        setHasLoadedOnce(true);
      }
    },
    [
      page,
      limit,
      debouncedSearch,
      statusFilter,
      buildDateFilters,
      refreshOptions,
      refreshMetrics,
      toMessage,
    ],
  );

  const create = useCallback(
    async (payload: CreateJobApplicationPayload) => {
      setLoading(true);
      setError(null);
      setFormSuccess(null);
    setListSuccess(null);
    try {
      await createJobApplication(payload);
      setFormSuccess({
        message: 'Postulacion registrada. Seguimos midiendo tu progreso!',
        company: payload.company.trim(),
        position: payload.position.trim() || undefined,
      });
      setPage(1);
      await load({ page: 1 });
    } catch (err) {
      setError(toMessage(err, 'No pudimos guardar la postulacion. Intenta otra vez.'));
      throw err;
      } finally {
        setLoading(false);
      }
    },
    [load, toMessage],
  );

  const updateStatus = useCallback(
    async (id: string, status: JobStatus) => {
      setLoading(true);
      setError(null);
      setFormSuccess(null);
      setListSuccess(null);
      try {
        await updateJobApplicationStatus(id, status);
        setListSuccess('Estado actualizado. Progreso al dia.');
        await load();
      } catch (err) {
        setError(toMessage(err, 'No pudimos actualizar el estado. Reintenta en unos segundos.'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [load, toMessage],
  );

  const removeApplication = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      setFormSuccess(null);
      setListSuccess(null);
      try {
        await deleteJobApplication(id);
        setListSuccess('Postulacion eliminada.');
        await load();
      } catch (err) {
        setError(toMessage(err, 'No pudimos eliminar la postulacion. Intenta de nuevo.'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [load, toMessage],
  );

  useEffect(() => {
    load();
  }, [load]);

  const filteredApplications = useMemo(() => applications, [applications]);

  return {
    applications: filteredApplications,
    rawApplications: applications,
    loading,
    error,
    reload: () => load(),
    create,
    updateStatus,
    remove: removeApplication,
    formSuccess,
    listSuccess,
    meta,
    metrics,
    metricsLoading,
    isInitialLoading: loading && !hasLoadedOnce,
    isRefetching: loading && hasLoadedOnce,
    hasLoadedOnce,
    pagination: {
      page,
      limit,
      total: meta.total,
      totalPages: meta.totalPages,
      setPage,
      setLimit: (value: number) => {
        setLimit(value);
        setPage(1);
      },
    },
    search: {
      term: searchInput,
      setTerm: setSearchInput,
    },
    suggestionOptions: {
      positions: positionOptions,
      sources: sourceOptions,
    },
    filters: {
      status: statusFilter,
      setStatus: setStatusFilter,
      dateRange,
      setDateRange,
      viewMode,
      setViewMode,
    },
  };
}
