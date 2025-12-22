// Helpers to treat date-only strings ("YYYY-MM-DD") as midnight UTC consistently

const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;

export function parseDateOnlyUTC(value: string): Date {
  if (!value) throw new Error('Fecha invalida');
  const match = DATE_REGEX.exec(value);
  if (!match) throw new Error(`Fecha invalida: "${value}"`);
  const [, y, m, d] = match;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}

export function formatDateOnlyUTC(value: string, locale = 'es-ES'): string {
  const date = parseDateOnlyUTC(value);
  return date.toLocaleDateString(locale, { timeZone: 'UTC' });
}

export function dateKeyUTC(value: string): string {
  const date = parseDateOnlyUTC(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
