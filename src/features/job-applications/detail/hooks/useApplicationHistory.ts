import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

import { getJobApplicationHistory } from '../../../../services/jobApplicationsApi';
import { type JobApplicationHistoryEntry } from '../../../../types/jobApplicationHistory';

type UseApplicationHistoryOptions = {
  applicationId: string;
  isMountedRef?: MutableRefObject<boolean>;
};

export function useApplicationHistory({ applicationId, isMountedRef }: UseApplicationHistoryOptions) {
  const fallbackIsMountedRef = useRef(true);
  const mountedRef = isMountedRef ?? fallbackIsMountedRef;

  const [history, setHistory] = useState<JobApplicationHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHistory([]);

    try {
      const data = await getJobApplicationHistory(applicationId);

      if (!mountedRef.current) return;
      setHistory(data);
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Error al cargar historial';
      setError(message);
      setHistory([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [applicationId, mountedRef]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, [mountedRef]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  };
}
