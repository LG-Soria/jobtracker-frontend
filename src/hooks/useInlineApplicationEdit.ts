'use client';

import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  type UpdateJobApplicationPayload,
  updateJobApplication,
} from '../services/jobApplicationsApi';
import {
  type JobApplication,
  type JobStatus,
} from '../types/jobApplication';

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
  isMountedRef: MutableRefObject<boolean>;
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
  isMountedRef,
  setPendingStatus,
  showToast,
}: UseInlineApplicationEditOptions) {
  const [formValues, setFormValues] = useState<InlineFormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

    if (formValues.notes !== (application.notes ?? '')) {
      const cleanedNotes = formValues.notes.trim();
      payload.notes = cleanedNotes === '' ? null : formValues.notes;
    }

    if (formValues.jobUrl !== (application.jobUrl ?? '')) {
      payload.jobUrl = jobUrl === '' ? null : jobUrl;
    }

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
  }, [
    application,
    formValues.company,
    formValues.position,
    formValues.source,
    formValues.jobUrl,
    formValues.notes,
    handleDiscardChanges,
    hasFormChanges,
    isMountedRef,
    saving,
    setApplication,
    setPendingStatus,
    showToast,
  ]);

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
