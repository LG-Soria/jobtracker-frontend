'use client';

/**
 * DetallePostulacionModal
 * -----------------------
 * Componente Client (Next App Router) que renderiza un overlay full-screen
 * mostrando el detalle de una postulaciï¿½n + ediciï¿½n inline + actualizaciï¿½n de estado
 * con confirmaciï¿½n + historial auditable.
 *
 * Puntos importantes:
 * - Se apoya en `applicationId` (viene desde la ruta /dashboard/applications/[id]).
 * - Hace 2 cargas asï¿½ncronas: detalle y historial.
 * - Usa `isMountedRef` para evitar setState cuando el componente ya se desmontï¿½.
 * - Implementa guardas de cambios sin guardar (close, back, unload).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import {
  getJobApplication,
  type UpdateJobApplicationPayload,
  updateJobApplication,
  updateJobApplicationStatus,
} from '../../services/jobApplicationsApi';

import {
  type JobApplication,
  JobStatus,
} from '../../types/jobApplication';

import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';
import { DetalleSkeleton } from '../../features/job-applications/detail/components/skeletons/ApplicationDetailSkeleton';
import { EditableField } from '../../features/job-applications/detail/components/EditableField';
import { DetailItem } from '../../features/job-applications/detail/components/DetailItem';
import { HistorySection } from '../../features/job-applications/detail/components/ApplicationHistorySection';
import { StatusUpdater } from '../../features/job-applications/detail/components/ApplicationStatusUpdater';
import { formatApplicationDate } from '../../features/job-applications/detail/utils/formatters';
import { useApplicationHistory } from '../../features/job-applications/detail/hooks/useApplicationHistory';
import { useToast } from '../../features/job-applications/detail/hooks/useToast';

type DetallePostulacionModalProps = {
  /** ID de la postulaciï¿½n a cargar (debe ser un UUID/string vï¿½lido). */
  applicationId: string;
};

export function DetallePostulacionModal({ applicationId }: DetallePostulacionModalProps) {
  const router = useRouter();

  // ----------------------
  // Estado principal (detalle)
  // ----------------------
  const [application, setApplication] = useState<JobApplication | null>(null);

  /**
   * Estado ï¿½pendienteï¿½ del select de estado.
   * No se persiste al backend hasta presionar Confirmar.
   */
  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);

  // ----------------------
  // Estado de carga / error del detalle
  // ----------------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ----------------------
  // Estado de actualizaciï¿½n del status (confirmaciï¿½n)
  // ----------------------
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // ----------------------
  // Estado del formulario editable (ediciï¿½n inline)
  // ----------------------
  const [formValues, setFormValues] = useState({
    company: '',
    position: '',
    source: '',
    jobUrl: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ----------------------
  // Toast simple (sin librerï¿½a)
  // ----------------------
  const { toastMessage, showToast, clearToast } = useToast();

  /**
   * Flag para evitar setState despuï¿½s de un unmount.
   * - Se inicializa en true.
   * - En el cleanup se setea false.
   * Importante: si el modal se vuelve a montar en el futuro, el useRef se recrea,
   * por lo que vuelve a empezar en true.
   */
  const isMountedRef = useRef(true);

  /**
   * Flag para evitar el prompt de ï¿½cambios sin guardarï¿½ cuando el cierre se disparï¿½
   * desde un flujo controlado (por ejemplo, handleClose que hace router.back()).
   */
  const skipUnsavedPromptRef = useRef(false);

  const {
    history,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useApplicationHistory({ applicationId, isMountedRef });

  // ----------------------
  // Helpers de toast
  // ----------------------

  // ----------------------
  // Fetch del detalle
  // ----------------------
  const fetchApplication = useCallback(async () => {
    // Se resetea el estado para mostrar skeleton y evitar data vieja.
    setLoading(true);
    setError(null);
    setUpdateError(null);
    setApplication(null);
    setPendingStatus(null);

    // Guard clause: evita pegarle al backend con undefined/empty.
    if (!applicationId) {
      console.log('No application ID provided');
      setError('ID de postulacion no proporcionado');
      setLoading(false);
      return;
    }

    try {
      // Segundo guard (redundante). Se puede dejar uno solo.
      if (!applicationId) return;

      const data = await getJobApplication(applicationId);

      // Evita setState si el componente ya se desmontï¿½.
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


  /**
   * Efecto de carga inicial (detalle).
   * Se dispara en mount y cuando cambia applicationId.
   *
   * Importante:
   * - Esta bien que dependa de fetchApplication porque es useCallback
   *   (se recrea solo cuando cambia applicationId).
   * - Si se viera una tormenta de requests, la causa tipica seria que applicationId
   *   cambia repetidamente o que el componente se monta/desmonta en loop.
   */
  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  // ----------------------
  // Sincronizaciï¿½n application -> formValues
  // ----------------------
  useEffect(() => {
    if (!application) return;

    // Se hidrata el formulario con los valores actuales del backend.
    setFormValues({
      company: application.company ?? '',
      position: application.position ?? '',
      source: application.source ?? '',
      jobUrl: application.jobUrl ?? '',
      notes: application.notes ?? '',
    });

    setSaveError(null);
  }, [application]);

  // ----------------------
  // Detecciï¿½n de ï¿½dirty stateï¿½ (cambios sin guardar)
  // ----------------------
  const hasFormChanges =
    application !== null &&
    (formValues.company !== application.company ||
      formValues.position !== application.position ||
      formValues.source !== application.source ||
      formValues.jobUrl !== (application.jobUrl ?? '') ||
      formValues.notes !== (application.notes ?? ''));

  const hasPendingStatusChange =
    application !== null && pendingStatus !== null && pendingStatus !== application.status;

  const hasUnsavedChanges = hasFormChanges || hasPendingStatusChange;
  const unsavedPromptMessage = 'Tenes cambios sin guardar. ï¿½Salir sin guardar?';

  /**
   * Confirmaciï¿½n centralizada para salir si hay cambios sin guardar.
   */
  const confirmExitIfDirty = useCallback(() => {
    if (!hasUnsavedChanges) return true;
    return window.confirm(unsavedPromptMessage);
  }, [hasUnsavedChanges, unsavedPromptMessage]);

  /**
   * Cierre controlado del modal.
   * - Si hay cambios sin guardar, pide confirmaciï¿½n.
   * - Usa router.back() para respetar el patrï¿½n route-modal.
   */
  const handleClose = useCallback(() => {
    if (!confirmExitIfDirty()) return;
    skipUnsavedPromptRef.current = true;
    router.back();
  }, [confirmExitIfDirty, router]);

  /**
   * Hook para interceptar navegaciï¿½n ï¿½atrï¿½sï¿½ del navegador.
   * Se usa popstate porque el modal se cierra con router.back().
   *
   * Nota:
   * - En Next App Router, router.back() cambia history y dispara popstate.
   * - Si el usuario cancela el confirm, se fuerza forward() para revertir.
   */
  useEffect(() => {
    const onPopState = () => {
      if (skipUnsavedPromptRef.current) {
        skipUnsavedPromptRef.current = false;
        return;
      }

      if (!hasUnsavedChanges) return;

      const shouldExit = window.confirm(unsavedPromptMessage);
      if (!shouldExit) {
        skipUnsavedPromptRef.current = true;
        window.history.forward();
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [hasUnsavedChanges, unsavedPromptMessage]);

  /**
   * Protecciï¿½n al cerrar pestaï¿½a / refresh del browser.
   * Esto es independiente del route-modal.
   */
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  /**
   * Cleanup general.
   * - Marca isMountedRef = false para cortar setState.
   * - Limpia timeouts del toast.
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearToast();
    };
  }, []);

  /**
   * Cierre con tecla ESC.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  /**
   * Click en backdrop (fuera del panel) para cerrar.
   * Se compara target vs currentTarget para detectar click directo en el backdrop.
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  // ----------------------
  // Handlers de ediciï¿½n inline
  // ----------------------
  const handleFieldChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setSaveError(null);
  };

  /**
   * Restaura el formulario a los valores actuales de `application`.
   */
  const handleDiscardChanges = () => {
    if (!application) return;
    setFormValues({
      company: application.company ?? '',
      position: application.position ?? '',
      source: application.source ?? '',
      jobUrl: application.jobUrl ?? '',
      notes: application.notes ?? '',
    });
    setSaveError(null);
  };

  /**
   * Revertir cambios de estado pendientes.
   */
  const handleCancelStatus = () => {
    setPendingStatus(application?.status ?? null);
    setUpdateError(null);
  };

  /**
   * Guardado inline de cambios en campos.
   * - Construye un payload PATCH minimal (solo cambia lo que difiere).
   * - Valida requeridos: company, position, source.
   * - Espera confirmaciï¿½n backend (no optimistic).
   */
  const handleSaveChanges = async () => {
    if (!application || !hasFormChanges || saving) return;

    const company = formValues.company.trim();
    const position = formValues.position.trim();
    const source = formValues.source.trim();
    const jobUrl = formValues.jobUrl.trim();

    if (!company || !position || !source) {
      setSaveError('Completa empresa, puesto y fuente antes de guardar.');
      return;
    }

    const payload: UpdateJobApplicationPayload = {};

    if (formValues.company !== application.company) payload.company = company;
    if (formValues.position !== application.position) payload.position = position;
    if (formValues.source !== application.source) payload.source = source;

    // Notas: se normaliza a null si queda vacï¿½o.
    if (formValues.notes !== (application.notes ?? '')) {
      const cleanedNotes = formValues.notes.trim();
      payload.notes = cleanedNotes === '' ? null : formValues.notes;
    }

    // URL: se normaliza a null si queda vacï¿½o.
    if (formValues.jobUrl !== (application.jobUrl ?? '')) {
      payload.jobUrl = jobUrl === '' ? null : jobUrl;
    }

    // Si no hay cambios reales, se sincroniza el form y se termina.
    if (Object.keys(payload).length === 0) {
      handleDiscardChanges();
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const updated = await updateJobApplication(application.id, payload);
      if (!isMountedRef.current) return;

      setApplication(updated);
      setPendingStatus(updated.status);
      setSaveError(null);
      showToast('Guardado');
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : 'No se pudieron guardar los cambios';
      setSaveError(message);
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  };

  /**
   * Confirmar cambio de estado.
   * - No persiste hasta confirmar.
   * - Refresca historial al ï¿½xito.
   */
  const handleConfirmStatus = async () => {
    if (!application || !pendingStatus || pendingStatus === application.status) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      const updated = await updateJobApplicationStatus(application.id, pendingStatus);
      if (!isMountedRef.current) return;

      setApplication(updated);
      setPendingStatus(updated.status);

      // Refresca historial para mostrar el nuevo evento STATUS_CHANGED.
      refetchHistory();

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

  // ----------------------
  // Formateo de fecha
  // ----------------------
  const formattedDate = formatApplicationDate(application?.applicationDate);

  // ----------------------
  // Render
  // ----------------------
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
                    ? `${application.company} - ${application.source}`
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
                  <EditableField
                    label="Puesto"
                    value={formValues.position}
                    onChange={(value) => handleFieldChange('position', value)}
                    disabled={saving}
                  />
                  <EditableField
                    label="Empresa"
                    value={formValues.company}
                    onChange={(value) => handleFieldChange('company', value)}
                    disabled={saving}
                  />
                  <EditableField
                    label="Fuente"
                    value={formValues.source}
                    onChange={(value) => handleFieldChange('source', value)}
                    disabled={saving}
                  />
                  <DetailItem label="Fecha" value={formattedDate ?? application.applicationDate} />
                  <div className="sm:col-span-2">
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
                  </div>
                  <EditableField
                    label="URL"
                    type="url"
                    value={formValues.jobUrl}
                    onChange={(value) => handleFieldChange('jobUrl', value)}
                    placeholder="https://ejemplo.com/oferta"
                    disabled={saving}
                    helper={
                      formValues.jobUrl.trim() ? (
                        <a
                          href={formValues.jobUrl.trim()}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-700 underline underline-offset-4 hover:text-slate-900"
                        >
                          Abrir enlace
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">Sin URL</span>
                      )
                    }
                  />
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Notas</p>
                  {saving ? (
                    <span className="text-xs uppercase tracking-wide text-slate-500">Guardando...</span>
                  ) : null}
                </div>
                <Textarea
                  className="mt-2"
                  value={formValues.notes}
                  onChange={(event) => handleFieldChange('notes', event.target.value)}
                  placeholder="Agrega detalles o proximos pasos."
                  disabled={saving}
                  rows={4}
                />
              </section>

              {hasFormChanges ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={handleSaveChanges} disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDiscardChanges} disabled={saving}>
                      Descartar
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1 text-right sm:text-left">
                    {saveError ? <span className="text-xs text-red-600">{saveError}</span> : null}
                    {!saveError && saving ? (
                      <span className="text-xs uppercase tracking-wide text-slate-500">Sincronizando</span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <HistorySection
                history={history}
                loading={historyLoading}
                error={historyError}
                onRetry={refetchHistory}
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
