import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

import { getJobApplicationHistory } from '../../../../services/jobApplicationsApi';
import { type JobApplicationHistoryEntry } from '../../../../types/jobApplicationHistory';

type UseApplicationHistoryOptions = {
  applicationId: string;
  isMountedRef?: MutableRefObject<boolean>;
};

export function useApplicationHistory({ applicationId }: UseApplicationHistoryOptions) {
const [history, setHistory] = useState<JobApplicationHistoryEntry[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);


const abortRef = useRef<AbortController | null>(null);
const requestIdRef = useRef(0);


const fetchHistory = useCallback(async () => {
// Cancela request previa si existe
abortRef.current?.abort();
const controller = new AbortController();
abortRef.current = controller;


const myRequestId = ++requestIdRef.current;


setLoading(true);
setError(null);
setHistory([]);


try {
if (!applicationId) {
setError('ID de postulacion no proporcionado');
setLoading(false);
return;
}


// IMPORTANTE: si tu getJobApplicationHistory no acepta signal, ver nota abajo.
const data = await getJobApplicationHistory(applicationId, { signal: controller.signal });


// Ignorar si llegó tarde
if (myRequestId !== requestIdRef.current) return;


setHistory(Array.isArray(data) ? data : []);
} catch (err: any) {
// Si fue abort, no tocar state
if (controller.signal.aborted) return;
if (myRequestId !== requestIdRef.current) return;


const message = err instanceof Error ? err.message : 'Error al cargar historial';
setError(message);
setHistory([]);
} finally {
if (controller.signal.aborted) return;
if (myRequestId !== requestIdRef.current) return;
setLoading(false);
}
}, [applicationId]);


useEffect(() => {
fetchHistory();
return () => {
abortRef.current?.abort();
};
}, [fetchHistory]);


return {
history,
loading,
error,
refetch: fetchHistory,
};
}