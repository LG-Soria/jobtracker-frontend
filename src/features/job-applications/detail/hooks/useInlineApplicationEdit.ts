'use client';

import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  type UpdateJobApplicationPayload,
  updateJobApplication,
} from '../../../../services/jobApplicationsApi';
import {
  type JobApplication,
  type JobStatus,
} from '../../../../types/jobApplication';

type InlineFormValues = {
  company: string;
  position: string;
  source: string;
  jobUrl: string;
  notes: string;
};

type UseInlineApplicationEditOptions = {
  application: JobApplication | null;
  setApplication: Dispatch<SetStateAction<JobApplication | null>>;
  setPendingStatus: (status: JobStatus | null) => void;
  showToast: (message: string) => void;
};

const EMPTY_FORM: InlineFormValues = {
  company: '',
  position: '',
  source: '',
  jobUrl: '',
  notes: '',
};

export function useInlineApplicationEdit({
  application,
  setApplication,
  setPendingStatus,
  showToast,
}: Omit<UseInlineApplicationEditOptions, 'isMountedRef'>) {
  const [formValues, setFormValues] = useState<InlineFormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!application) return;

    setFormValues({
      company: application.company ?? '',
      position: application.position ?? '',
      source: application.source ?? '',
      jobUrl: application.jobUrl ?? '',
      notes: application.notes ?? '',
    });

    setSaveError(null);
  }, [application]);

  const handleFieldChange = (field: keyof InlineFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setSaveError(null);
  };

  const handleDiscardChanges = useCallback(() => {
    if (!application) return;
    setFormValues({
      company: application.company ?? '',
      position: application.position ?? '',
      source: application.source ?? '',
      jobUrl: application.jobUrl ?? '',
      notes: application.notes ?? '',
    });
    setSaveError(null);
  }, [application]);

  const hasFormChanges =
    application !== null &&
    (formValues.company !== application.company ||
      formValues.position !== application.position ||
      formValues.source !== application.source ||
      formValues.jobUrl !== (application.jobUrl ?? '') ||
      formValues.notes !== (application.notes ?? ''));

  const handleSaveChanges = useCallback(async () => {
    if (!application || !hasFormChanges || saving) return;

    // Cancela request anterior si existía
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const myRequestId = ++requestIdRef.current;

    const company = formValues.company.trim();
    const position = formValues.position.trim();
    const source = formValues.source.trim();
    const jobUrl = formValues.jobUrl.trim();

    if (!company || !position || !source) {
      setSaveError('Completa empresa, puesto y fuente antes de guardar.');
      return;
    }

    const payload: UpdateJobApplicationPayload = {};
    if (company !== (application.company ?? '')) payload.company = company;
    if (position !== (application.position ?? '')) payload.position = position;
    if (source !== (application.source ?? '')) payload.source = source;

    if (formValues.notes !== (application.notes ?? '')) {
      const cleanedNotes = formValues.notes.trim();
      payload.notes = cleanedNotes === '' ? null : formValues.notes;
    }

    if (jobUrl !== (application.jobUrl ?? '')) {
      payload.jobUrl = jobUrl === '' ? null : jobUrl;
    }

    if (Object.keys(payload).length === 0) {
      handleDiscardChanges();
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      // Ideal: permitir signal también en updateJobApplication
      const updated = await updateJobApplication(application.id, payload, {
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;
      if (myRequestId !== requestIdRef.current) return;

      setApplication(updated);
      setPendingStatus(updated.status);
      showToast('Guardado');
    } catch (err: any) {
      if (controller.signal.aborted) return;
      if (myRequestId !== requestIdRef.current) return;

      const message =
        err instanceof Error ? err.message : 'No se pudieron guardar los cambios';
      setSaveError(message);
    } finally {
      if (controller.signal.aborted) return;
      if (myRequestId !== requestIdRef.current) return;
      setSaving(false);
    }
  }, [
    application,
    formValues,
    handleDiscardChanges,
    hasFormChanges,
    saving,
    setApplication,
    setPendingStatus,
    showToast,
  ]);

  // cleanup: abort en unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return {
    formValues,
    saving,
    saveError,
    hasFormChanges,
    handleFieldChange,
    handleDiscardChanges,
    handleSaveChanges,
  };
}