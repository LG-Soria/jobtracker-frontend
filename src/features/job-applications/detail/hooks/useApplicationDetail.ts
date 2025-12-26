import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";

import { getJobApplication } from "../../../../services/jobApplicationsApi";
import { type JobApplication } from "../../../../types/jobApplication";
type UseApplicationDetailOptions = {
  applicationId: string;
  onBeforeFetch?: () => void;
  onSuccess?: (data: JobApplication) => void;
};

export function useApplicationDetail({
  applicationId,
  onBeforeFetch,
  onSuccess,
}:UseApplicationDetailOptions) {

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const fetchApplication = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const myRequestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);
    setApplication(null);
    onBeforeFetch?.();

    if (!applicationId) {
      setError("ID de postulacion no proporcionado");
      setLoading(false);
      return;
    }

    try {
      const data = await getJobApplication(applicationId, {
        signal: controller.signal,
      });
      if (myRequestId !== requestIdRef.current) return;
      setApplication(data);
      onSuccess?.(data);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      if (myRequestId !== requestIdRef.current) return;
      const message =
        err instanceof Error ? err.message : "Error al cargar la postulacion";
      setError(message);
      setApplication(null);
    } finally {
      if (controller.signal.aborted) return;
      if (myRequestId !== requestIdRef.current) return;
      setLoading(false);
    }
  }, [applicationId, onBeforeFetch, onSuccess]);
  useEffect(() => {
    fetchApplication();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchApplication]);

  return {
    application,
    setApplication,
    loading,
    error,
    refetch: fetchApplication,
  };
}
