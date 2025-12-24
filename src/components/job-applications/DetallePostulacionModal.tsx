'use client';

import { useCallback, useEffect } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

type DetallePostulacionModalProps = {
  applicationId: string;
};

export function DetallePostulacionModal({ applicationId }: DetallePostulacionModalProps) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

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
            <h2 className="text-2xl font-bold text-slate-900">Detalle #{applicationId}</h2>
            <p className="text-sm text-slate-600">
              La vista se abre sobre el dashboard sin perder el contexto. El contenido real se
              completara mas adelante.
            </p>
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
          <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                Resumen pendiente
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Aca se mostrara el detalle de la postulacion, estados, notas y enlaces relevantes.
              </p>
              <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                  <span>Datos de empresa/puesto</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                  <span>Historial y notas</span>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-dashed border-slate-200 px-4 py-5">
              <p className="text-sm font-semibold text-slate-800">Proximo: datos de detalle</p>
              <p className="mt-1 text-sm text-slate-600">
                Este modal ya responde a la ruta /dashboard/applications/{'{id}'}. En el siguiente paso se
                completara con informacion real.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
