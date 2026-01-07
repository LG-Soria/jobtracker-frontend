// Helpers to treat date-only strings ("YYYY-MM-DD") as midnight UTC consistently

const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;

export function parseDateOnlyUTC(value: string): Date | null {
  if (!value) return null;
  const match = DATE_REGEX.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}

export function formatDateOnlyUTC(value: string | null | undefined, locale = 'es-ES'): string {
  if (!value) return '-';
  const date = parseDateOnlyUTC(value);
  if (!date) return '-';
  return date.toLocaleDateString(locale, { timeZone: 'UTC' });
}

export function dateKeyUTC(value: string): string {
  const date = parseDateOnlyUTC(value);
  if (!date) return '';
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
