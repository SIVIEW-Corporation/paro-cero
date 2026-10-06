const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

// Installation dates are stored as UTC midnight: format the UTC calendar day.
const utcDateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const shortDateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const integerFormatter = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 0,
});

export const EMPTY_VALUE = '—';

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Local date and time, e.g. for created/updated timestamps. */
export function formatAssetDateTime(value: string | null | undefined): string {
  const date = parse(value);
  return date ? dateTimeFormatter.format(date) : EMPTY_VALUE;
}

/** Local date only, used in the table. */
export function formatAssetShortDate(value: string | null | undefined): string {
  const date = parse(value);
  return date ? shortDateFormatter.format(date) : EMPTY_VALUE;
}

/** Installation day without time-zone shifts. */
export function formatInstalledAt(value: string | null | undefined): string {
  const date = parse(value);
  return date ? utcDateFormatter.format(date) : EMPTY_VALUE;
}

export function formatAssetCost(value: number | null): string {
  return value === null ? EMPTY_VALUE : integerFormatter.format(value);
}
