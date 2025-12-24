'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import {
  getJobApplication,
  getJobApplicationHistory,
  updateJobApplicationStatus,
} from '../../services/jobApplicationsApi';
import {
  getJobStatusLabel,
  type JobApplication,
  JobStatus,
} from '../../types/jobApplication';
import { type JobApplicationHistoryEntry } from '../../types/jobApplicationHistory';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type DetallePostulacionModalProps = {
  applicationId: string;
};

export function DetallePostulacionModal({ applicationId }: DetallePostulacionModalProps) {
  const router = useRouter();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);
  const [history, setHistory] = useState<JobApplicationHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const clearToast = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  };

  const showToast = (message: string) => {
    clearToast();
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUpdateError(null);
    setApplication(null);
    setPendingStatus(null);

    if (!applicationId) {
 console.log('No application ID provided');
      setError('ID de postulacion no proporcionado');
      setLoading(false);
      return;
}
    try {
      if (!applicationId) return;
      const data = await getJobApplication(applicationId);
      if (!isMountedRef.current) return;
      setApplication(data);
      setPendingStatus(data.status);
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Error al cargar la postulacion';
      setError(message);
      setApplication(null);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [applicationId]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    setHistory([]);
    try {
      const data = await getJobApplicationHistory(applicationId);
      if (!isMountedRef.current) return;
      setHistory(data);
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Error al cargar historial';
      setHistoryError(message);
      setHistory([]);
    } finally {
      if (isMountedRef.current) {
        setHistoryLoading(false);
      }
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplication();
    fetchHistory();
  }, [fetchApplication, fetchHistory]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearToast();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleCancelStatus = () => {
    setPendingStatus(application?.status ?? null);
    setUpdateError(null);
  };

  const handleConfirmStatus = async () => {
    if (!application || !pendingStatus || pendingStatus === application.status) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      const updated = await updateJobApplicationStatus(application.id, pendingStatus);
      if (!isMountedRef.current) return;
      setApplication(updated);
      setPendingStatus(updated.status);
      fetchHistory();
      showToast('Estado actualizado');
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el estado';
      setUpdateError(message);
    } finally {
      if (isMountedRef.current) {
        setUpdating(false);
      }
    }
  };

  const formattedDate =
    application?.applicationDate && !Number.isNaN(new Date(application.applicationDate).getTime())
      ? format(new Date(application.applicationDate), 'dd/MM/yyyy')
      : null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-stretch justify-center bg-slate-900/60 px-3 py-6 backdrop-blur-sm sm:px-6"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de postulacion ${applicationId}`}
    >
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Postulacion
            </p>
            {loading ? (
              <div className="space-y-2 pt-1">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900">
                  {application?.position || `Detalle #${applicationId}`}
                </h2>
                <p className="text-sm text-slate-600">
                  {application
                    ? `${application.company} • ${application.source}`
                    : 'Vista superpuesta sobre el dashboard'}
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="ml-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Cerrar detalle"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <DetalleSkeleton />
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-900">No pudimos cargar la postulacion</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchApplication}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : application ? (
            <div className="space-y-5">
              <section className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-4">
                <p className="text-sm font-semibold text-slate-800">Resumen</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Puesto" value={application.position} />
                  <DetailItem label="Empresa" value={application.company} />
                  <DetailItem label="Fuente" value={application.source} />
                  <DetailItem label="Fecha" value={formattedDate ?? application.applicationDate} />
                  <StatusUpdater
                    value={pendingStatus ?? application.status}
                    current={application.status}
                    updating={updating}
                    onChange={(value) => {
                      setPendingStatus(value);
                      setUpdateError(null);
                    }}
                    onCancel={handleCancelStatus}
                    onConfirm={handleConfirmStatus}
                    error={updateError}
                  />
                  <DetailItem
                    label="URL"
                    value={
                      application.jobUrl ? (
                        <a
                          href={application.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-900 underline underline-offset-4 hover:text-slate-700"
                        >
                          Ver oferta
                        </a>
                      ) : (
                        'Sin URL'
                      )
                    }
                  />
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Notas</p>
                  <span className="text-xs uppercase tracking-wide text-slate-500">Solo lectura</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {application.notes?.trim() || 'Sin notas registradas.'}
                </p>
              </section>

              <HistorySection
                history={history}
                loading={historyLoading}
                error={historyError}
                onRetry={fetchHistory}
              />
            </div>
          ) : null}
        </main>
      </div>
      {toastMessage && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50">
          <div className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="text-sm text-slate-900">{value}</div>
    </div>
  );
}

type StatusUpdaterProps = {
  value: JobStatus;
  current: JobStatus;
  updating: boolean;
  onChange: (value: JobStatus) => void;
  onConfirm: () => void;
  onCancel: () => void;
  error: string | null;
};

function StatusUpdater({
  value,
  current,
  updating,
  onChange,
  onConfirm,
  onCancel,
  error,
}: StatusUpdaterProps) {
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
      <Select
        value={value}
        onValueChange={(val) => onChange(val as JobStatus)}
        disabled={updating}
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

type HistorySectionProps = {
  history: JobApplicationHistoryEntry[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

function HistorySection({ history, loading, error, onRetry }: HistorySectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">Historial</p>
        <span className="text-xs uppercase tracking-wide text-slate-500">Linea de tiempo</span>
      </div>

      {loading ? (
        <HistorySkeleton />
      ) : error ? (
        <div className="mt-3 space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <div className="flex items-start justify-between gap-3">
            <span className="font-semibold">No pudimos cargar el historial</span>
            <Button size="sm" variant="outline" onClick={onRetry}>
              Reintentar
            </Button>
          </div>
          <p className="text-xs text-red-700">{error}</p>
        </div>
      ) : history.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">Sin eventos registrados todavia.</p>
      ) : (
        <HistoryTimeline history={history} />
      )}
    </section>
  );
}

function HistoryTimeline({ history }: { history: JobApplicationHistoryEntry[] }) {
  return (
    <ol className="mt-3 space-y-4">
      {history.map((entry, index) => {
        const { title, description } = describeHistoryEntry(entry);
        const createdAt = new Date(entry.createdAt);
        const readableDate = Number.isNaN(createdAt.getTime())
          ? entry.createdAt
          : format(createdAt, 'dd/MM/yyyy HH:mm');
        const isLast = index === history.length - 1;

        return (
          <li key={entry.id} className="relative pl-8">
            <span className="absolute left-3 top-1.5 inline-flex h-3 w-3 items-center justify-center">
              <span className="h-3 w-3 rounded-full bg-slate-400 ring-2 ring-slate-200" />
            </span>
            {!isLast && (
              <span
                className="absolute left-[17px] top-4 h-full w-px bg-slate-200"
                aria-hidden="true"
              />
            )}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              {description ? <p className="text-xs text-slate-600">{description}</p> : null}
              <p className="text-xs text-slate-500">{readableDate}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function describeHistoryEntry(entry: JobApplicationHistoryEntry) {
  if (entry.type === 'STATUS_CHANGED') {
    const from = entry.meta.from ? getJobStatusLabel(entry.meta.from) : 'Sin estado previo';
    const to = entry.meta.to ? getJobStatusLabel(entry.meta.to) : 'Sin estado';
    return {
      title: 'Cambio de estado',
      description: `${from} -> ${to}`,
    };
  }

  return {
    title: 'Postulacion creada',
    description: 'Se registro la postulacion en el sistema.',
  };
}

function HistorySkeleton() {
  return (
    <div className="mt-3 space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

function DetalleSkeleton() {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-4">
        <Skeleton className="h-4 w-24" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <Skeleton className="h-4 w-24" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <Skeleton className="h-4 w-24" />
        <HistorySkeleton />
      </section>
    </div>
  );
}
