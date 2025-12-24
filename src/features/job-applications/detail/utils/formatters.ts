import { format } from 'date-fns';

export function formatApplicationDate(applicationDate?: string | null) {
  if (!applicationDate) return null;

  const parsedDate = new Date(applicationDate);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return format(parsedDate, 'dd/MM/yyyy');
}
