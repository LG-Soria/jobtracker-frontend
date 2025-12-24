import { getJobStatusLabel } from '../../../../types/jobApplication';
import { type JobApplicationHistoryEntry } from '../../../../types/jobApplicationHistory';

export function describeHistoryEntry(entry: JobApplicationHistoryEntry) {
  if (entry.type === 'STATUS_CHANGED') {
    const from = entry.meta.from ? getJobStatusLabel(entry.meta.from) : 'Sin estado previo';
    const to = entry.meta.to ? getJobStatusLabel(entry.meta.to) : 'Sin estado';
    return {
      title: 'Cambio de estado',
      description: `${from} -> ${to}`,
    };
  }

  return {
    title: 'Postulacion creada',
    description: 'Se registro la postulacion en el sistema.',
  };
}
