'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { getJobApplication } from '../../services/jobApplicationsApi';
import { getJobStatusLabel, type JobApplication } from '../../types/jobApplication';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { format } from 'date-fns';

type DetallePostulacionModalProps = {
  applicationId: string;
};

export function DetallePostulacionModal({ applicationId }: DetallePostulacionModalProps) {
  const router = useRouter();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getJobApplication(applicationId);
      if (!isMountedRef.current) return;
      setApplication(data);
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

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
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
                  <DetailItem label="Estado" value={getJobStatusLabel(application.status)} />
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
            </div>
          ) : null}
        </main>
      </div>
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

function DetalleSkeleton() {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-4">
        <Skeleton className="h-4 w-24" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
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
    </div>
  );
}
