import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

import { getJobApplication } from '../../../../services/jobApplicationsApi';
import { type JobApplication } from '../../../../types/jobApplication';

type UseApplicationDetailOptions = {
  applicationId: string;
  isMountedRef?: MutableRefObject<boolean>;
  onBeforeFetch?: () => void;
  onSuccess?: (application: JobApplication) => void;
};

export function useApplicationDetail({
  applicationId,
  isMountedRef,
  onBeforeFetch,
  onSuccess,
}: UseApplicationDetailOptions) {
  const fallbackIsMountedRef = useRef(true);
  const mountedRef = isMountedRef ?? fallbackIsMountedRef;

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    setError(null);
    setApplication(null);
    onBeforeFetch?.();

    if (!applicationId) {
      console.log('No application ID provided');
      setError('ID de postulacion no proporcionado');
      setLoading(false);
      return;
    }

    try {
      if (!applicationId) return;

      const data = await getJobApplication(applicationId);

      if (!mountedRef.current) return;

      setApplication(data);
      onSuccess?.(data);
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Error al cargar la postulacion';
      setError(message);
      setApplication(null);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [applicationId, mountedRef, onBeforeFetch, onSuccess]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, [mountedRef]);

  return {
    application,
    setApplication,
    loading,
    error,
    refetch: fetchApplication,
  };
}
