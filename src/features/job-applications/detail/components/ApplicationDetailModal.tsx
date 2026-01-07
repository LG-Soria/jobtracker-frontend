'use client';

/**
 * DetallePostulacionModal
 * -----------------------
 * Componente Client (Next App Router) que renderiza un overlay full-screen
 * con el detalle de una postulaciÃ³n, ediciÃ³n inline, cambio de estado con confirmaciÃ³n
 * e historial auditable.
 *
 * Consideraciones:
 * - Requiere `applicationId` (proviene de /dashboard/applications/[id]).
 * - Carga 2 recursos: detalle e historial.
 * - Usa `isMountedRef` para evitar setState despuÃ©s del unmount.
 * - Integra guardas de cambios sin guardar (close/back/unload) vÃ­a useUnsavedChangesGuard.
 */

import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, X } from 'lucide-react';

import { deleteJobApplication, updateJobApplicationStatus } from '../../../../services/jobApplicationsApi';
import { cn } from '../../../../lib/utils';

import {
  type JobApplication,
  JobStatus,
} from '../../../../types/jobApplication';

import { useInlineApplicationEdit } from '../hooks/useInlineApplicationEdit';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Textarea } from '../../../../components/ui/textarea';
import { DetalleSkeleton } from './skeletons/ApplicationDetailSkeleton';
import { EditableField } from './EditableField';
import { DetailItem } from './DetailItem';
import { HistorySection } from './ApplicationHistorySection';
import { StatusUpdater } from './ApplicationStatusUpdater';
import { formatApplicationDate } from '../utils/formatters';
import { useApplicationDetail } from '../hooks/useApplicationDetail';
import { useApplicationHistory } from '../hooks/useApplicationHistory';
import { useToast } from '../hooks/useToast';

type DetallePostulacionModalProps = {
  /** ID de la postulaciÃ¯Â¿Â½n a cargar (debe ser un UUID/string vÃ¯Â¿Â½lido). */
  applicationId: string;
};

export function DetallePostulacionModal({ applicationId }: DetallePostulacionModalProps) {
  const router = useRouter();

  /**
   * Estado Ã¯Â¿Â½pendienteÃ¯Â¿Â½ del select de estado.
   * No se persiste al backend hasta presionar Confirmar.
   */
  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);


  // ----------------------
  // Estado de actualizaciÃ¯Â¿Â½n del status (confirmaciÃ¯Â¿Â½n)
  // ----------------------
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);


  // ----------------------
  // Toast simple (sin librerÃ¯Â¿Â½a)
  // ----------------------
  const { toastMessage, isToastVisible, showToast, clearToast } = useToast();

  /**
   * Flag para evitar setState despuÃ¯Â¿Â½s de un unmount.
   * - Se inicializa en true.
   * - En el cleanup se setea false.
   * Importante: si el modal se vuelve a montar en el futuro, el useRef se recrea,
   * por lo que vuelve a empezar en true.
   */


  const resetDetailState = useCallback(() => {
    setUpdateError(null);
    setPendingStatus(null);
  }, []);

  const syncPendingStatus = useCallback((data: JobApplication) => {
    setPendingStatus(data.status);
  }, []);

  const {
    application,
    setApplication,
    loading,
    error,
    refetch: refetchApplication,
  } = useApplicationDetail({
    applicationId,
    onBeforeFetch: resetDetailState,
    onSuccess: syncPendingStatus,
  });

  const {
    formValues,
    saving,
    saveError,
    hasFormChanges,
    handleFieldChange,
    handleDiscardChanges,
    handleSaveChanges,
  } = useInlineApplicationEdit({
    application,
    setApplication,
    setPendingStatus,
    showToast,
  });

  const {
    history,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useApplicationHistory({ applicationId });

  const hasPendingStatusChange =
    application !== null && pendingStatus !== null && pendingStatus !== application.status;

  const hasUnsavedChanges = hasFormChanges || hasPendingStatusChange;
  const unsavedPromptMessage = 'Tenes cambios sin guardar. Â¿Salir sin guardar?';

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const { handleClose, handleBackdropClick } = useUnsavedChangesGuard({
    hasUnsavedChanges,
    promptMessage: unsavedPromptMessage,
    onConfirmClose: navigateBack,
  });

  const handleModalBackdropClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (isDeleting || confirmOpen) return;
      handleBackdropClick(event);
    },
    [confirmOpen, handleBackdropClick, isDeleting],
  );

  const handleCloseClick = useCallback(() => {
    if (isDeleting) return;
    handleClose();
  }, [handleClose, isDeleting]);

  /**
   * Cleanup general.
   * - Marca isMountedRef = false para cortar setState.
   * - Limpia timeouts del toast.
   */


// 2) Si querÃ©s limpiar toast al cerrar modal, hacelo en otro efecto,
// pero SIN tocar isMountedRef
useEffect(() => {
  return () => {
    clearToast();
  };
}, [clearToast]);

  /**
   * Cierre con tecla ESC.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isDeleting) return;
        if (confirmOpen) {
          setConfirmOpen(false);
          return;
        }
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmOpen, handleClose, isDeleting]);


  /**
   * Revertir cambios de estado pendientes.
   */
const handleCancelStatus = () => {
  setPendingStatus(application?.status ?? null);
  setUpdateError(null);
};


// arriba en el componente
const updateAbortRef = useRef<AbortController | null>(null);
const updateReqIdRef = useRef(0);
const deleteAbortRef = useRef<AbortController | null>(null);
const deleteReqIdRef = useRef(0);

const handleConfirmStatus = async () => {
  if (!application || !pendingStatus || pendingStatus === application.status) return;
  if (updating) return;

  // cancela update anterior si existÃ­a
  updateAbortRef.current?.abort();
  const controller = new AbortController();
  updateAbortRef.current = controller;

  const myReqId = ++updateReqIdRef.current;

  setUpdating(true);
  setUpdateError(null);

  try {
    const updated = await updateJobApplicationStatus(application.id, pendingStatus, {
      signal: controller.signal,
    });

    // ignora si llegÃ³ tarde
    if (myReqId !== updateReqIdRef.current) return;

    setApplication(updated);
    setPendingStatus(updated.status);

    // ideal: esperar el refetch para que el usuario â€œveaâ€ el cambio ya reflejado
    await refetchHistory();

    showToast('Estado actualizado');
  } catch (err: any) {
    if (controller.signal.aborted) return;
    if (myReqId !== updateReqIdRef.current) return;

    const message =
      err instanceof Error ? err.message : 'No se pudo actualizar el estado';
    setUpdateError(message);
  } finally {
    if (controller.signal.aborted) return;
    if (myReqId !== updateReqIdRef.current) return;
    setUpdating(false);
  }
};

const handleConfirmDelete = async () => {
  if (isDeleting) return;

  deleteAbortRef.current?.abort();
  const controller = new AbortController();
  deleteAbortRef.current = controller;
  const myReqId = ++deleteReqIdRef.current;

  setIsDeleting(true);

  try {
    await deleteJobApplication(applicationId, { signal: controller.signal });

    if (controller.signal.aborted) return;
    if (myReqId !== deleteReqIdRef.current) return;

    showToast('Postulacion eliminada');
    setConfirmOpen(false);
    router.push('/dashboard');
    router.refresh();
  } catch (err: any) {
    if (controller.signal.aborted) return;
    if (myReqId !== deleteReqIdRef.current) return;

    const message =
      err instanceof Error ? err.message : 'No se pudo eliminar la postulacion';
    showToast(message);
  } finally {
    if (controller.signal.aborted) return;
    if (myReqId !== deleteReqIdRef.current) return;
    setIsDeleting(false);
  }
};

// cleanup del componente: abort del update si se cierra el modal
useEffect(() => {
  return () => {
    updateAbortRef.current?.abort();
    deleteAbortRef.current?.abort();
  };
}, []);

  // ----------------------
  // Formateo de fecha
  // ----------------------
  const formattedDate = formatApplicationDate(application?.applicationDate);
  const deleteDisabled = loading || saving || updating || isDeleting || !application;
  const formatSalaryNumber = (value?: number | null) => {
    if (value === null || value === undefined) return null;
    return new Intl.NumberFormat('es-AR').format(value);
  };
  const salaryMeta = application
    ? [
        application.salaryCurrency ?? undefined,
        application.salaryPeriod ?? undefined,
        application.salaryType ?? undefined,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';
  const salaryMinValue = formatSalaryNumber(application?.salaryMin);
  const salaryMaxValue = formatSalaryNumber(application?.salaryMax);
  const hasSalaryData =
    !!application && Boolean(salaryMeta || salaryMinValue || salaryMaxValue);
  const salaryAmountLine =
    hasSalaryData && (salaryMinValue || salaryMaxValue)
      ? salaryMinValue && salaryMaxValue
        ? `Mín: ${salaryMinValue} — Máx: ${salaryMaxValue}`
        : salaryMinValue
          ? `Mín: ${salaryMinValue}`
          : `Máx: ${salaryMaxValue}`
      : '';

  // ----------------------
  // Render
  // ----------------------
  return (
    <div
      className="fixed inset-0 z-40 flex items-stretch justify-center bg-ink/20 px-3 py-6 sm:px-6"
      onClick={handleModalBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de postulacion ${applicationId}`}
    >
      <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-card border border-border bg-surface">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-surface px-5 py-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
              Postulacion
            </p>

            {loading ? (
              <div className="space-y-2 pt-1">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : (
              <>
                <h2 className="text-[1.5rem] font-semibold text-ink">
                  {application?.position || `Detalle #${applicationId}`}
                </h2>
                <p className="text-sm text-ink-muted">
                  {application
                    ? `${application.company} - ${application.source}`
                    : 'Vista superpuesta sobre el dashboard'}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={deleteDisabled}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={handleCloseClick}
              disabled={isDeleting}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-soft transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-ink focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Cerrar detalle"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-4 lg:min-h-0 lg:overflow-hidden">
          {loading ? (
            <div className="h-full overflow-y-auto">
              <DetalleSkeleton />
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto rounded-card border border-danger/50 bg-danger-soft px-4 py-6 text-center">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink">No pudimos cargar la postulacion</p>
                <p className="text-sm text-primary">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={refetchApplication}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : application ? (
            <div className="grid min-h-0 grid-cols-1 gap-5 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="space-y-5 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
                <section className="rounded-card border border-border bg-surface px-4 py-4">
                  <div className="flex items-start gap-3">
                    <p className="text-sm font-semibold text-ink">Resumen</p>
                    <div className="ml-auto flex flex-col items-end gap-1">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveChanges}
                          disabled={!hasFormChanges || saving || isDeleting}
                        >
                          {saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDiscardChanges}
                          disabled={!hasFormChanges || saving || isDeleting}
                        >
                          Descartar
                        </Button>
                      </div>
                      <div className="min-h-[16px] text-right">
                        {saveError ? (
                          <span className="text-xs text-primary">{saveError}</span>
                        ) : saving ? (
                          <span className="text-xs uppercase tracking-[0.1em] text-ink-soft">
                            Sincronizando
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <EditableField
                      label="Puesto"
                      value={formValues.position}
                      onChange={(value) => handleFieldChange('position', value)}
                      disabled={saving || isDeleting}
                    />
                    <EditableField
                      label="Empresa"
                      value={formValues.company}
                      onChange={(value) => handleFieldChange('company', value)}
                      disabled={saving || isDeleting}
                    />
                    <EditableField
                      label="Fuente"
                      value={formValues.source}
                      onChange={(value) => handleFieldChange('source', value)}
                      disabled={saving || isDeleting}
                    />
                    <DetailItem label="Fecha" value={formattedDate ?? application.applicationDate} />
                    <div className="sm:col-span-2">
                      <StatusUpdater
                        value={pendingStatus ?? application.status}
                        current={application.status}
                        updating={updating}
                        disabled={isDeleting}
                        onChange={(value) => {
                          setPendingStatus(value);
                          setUpdateError(null);
                        }}
                        onCancel={handleCancelStatus}
                        onConfirm={handleConfirmStatus}
                        error={updateError}
                      />
                    </div>
                    <EditableField
                      label="URL"
                      type="url"
                      value={formValues.jobUrl}
                      onChange={(value) => handleFieldChange('jobUrl', value)}
                      placeholder="https://ejemplo.com/oferta"
                      disabled={saving || isDeleting}
                      helper={
                        formValues.jobUrl.trim() ? (
                          <a
                            href={formValues.jobUrl.trim()}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-ink underline underline-offset-4 hover:text-ink"
                          >
                            Abrir enlace
                          </a>
                        ) : (
                          <span className="text-xs text-ink-soft">Sin URL</span>
                        )
                      }
                    />
                    <div className="sm:col-span-2">
                      <div className="space-y-2 rounded-card border border-border bg-surface px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-soft">
                          Rango salarial
                        </p>
                        {hasSalaryData ? (
                          <div className="space-y-1 text-sm text-ink">
                            {salaryMeta ? (
                              <p className="font-semibold text-ink">{salaryMeta}</p>
                            ) : null}
                            {salaryAmountLine ? (
                              <p className="text-ink-muted">{salaryAmountLine}</p>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-sm text-ink-soft">Sin datos</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex h-full flex-col gap-4 lg:min-h-0">
                <HistorySection
                  history={history}
                  loading={historyLoading}
                  error={historyError}
                  onRetry={refetchHistory}
                  className="max-h-[320px] overflow-hidden lg:max-h-[35vh]"
                />

                <section className="flex flex-1 min-h-[180px] flex-col rounded-card border border-border bg-surface px-4 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink">Notas</p>
                    {saving ? (
                      <span className="text-xs uppercase tracking-[0.1em] text-ink-soft">Guardando...</span>
                    ) : null}
                  </div>
                  <Textarea
                    className="mt-2 flex-1"
                    value={formValues.notes}
                    onChange={(event) => handleFieldChange('notes', event.target.value)}
                    placeholder="Agrega detalles o proximos pasos."
                    disabled={saving || isDeleting}
                    rows={4}
                  />
                </section>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 px-4"
          role="presentation"
          onClick={() => {
            if (isDeleting) return;
            setConfirmOpen(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-description"
            className="w-full max-w-md rounded-card border border-border bg-surface p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft text-primary">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p id="delete-confirm-title" className="text-base font-semibold text-ink">
                  Eliminar postulacion
                </p>
                <p id="delete-confirm-description" className="text-sm text-ink-muted">
                  Esta accion no se puede deshacer. Seguro que queres eliminarla?
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {toastMessage && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50">
          <div
            role="status"
            aria-live="polite"
            className={cn(
              'flex items-start gap-3 rounded-card border border-border bg-surface px-4 py-3 text-sm font-medium text-ink transition-opacity duration-200 ease-out',
              isToastVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            <span className="leading-5">{toastMessage}</span>
            <button
              type="button"
              aria-label="Cerrar notificacion"
              onClick={clearToast}
              className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-ink-soft transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-ink focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

