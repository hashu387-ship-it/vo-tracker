/** Money & date formatting. All contract values are SAR unless stated. */

const FULL = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const WHOLE = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 12,345,678.90 */
export function money(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return FULL.format(value);
}

/** SAR 12,345,678.90 */
export function moneyWithUnit(value: number | null | undefined, currency = 'SAR'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${currency} ${FULL.format(value)}`;
}

/** 12,345,679 — for axis ticks and dense tables. */
export function moneyWhole(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return WHOLE.format(value);
}

/**
 * 232.9M / 1.10M / 436.7k — headline tiles and axis labels.
 * Keeps the sign so negative variations still read as omissions.
 */
export function compactMoney(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(digits)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(digits)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(digits)}k`;
  return `${sign}${abs.toFixed(0)}`;
}

/** 95.4% */
export function percent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${(value * 100).toFixed(digits)}%`;
}

/** Signed, for variances: +7.1% / -2.3% */
export function signedPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** 12 May 2026 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** May 2026 */
export function formatMonth(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m] = iso.split('-').map(Number);
  if (!y || !m) return iso;
  return `${MONTHS[m - 1]} ${y}`;
}

/** "14 days ago" / "in 3 days" — relative to the register's as-of date. */
export function relativeDays(iso: string | null | undefined, from: string): string | null {
  if (!iso) return null;
  const a = Date.parse(`${iso}T00:00:00Z`);
  const b = Date.parse(`${from}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  const days = Math.round((a - b) / 86_400_000);
  if (days === 0) return 'today';
  if (days > 0) return days === 1 ? 'in 1 day' : `in ${days} days`;
  const past = Math.abs(days);
  if (past === 1) return '1 day ago';
  if (past < 60) return `${past} days ago`;
  return `${Math.round(past / 30)} months ago`;
}

export function daysBetween(a: string | null | undefined, b: string | null | undefined): number | null {
  if (!a || !b) return null;
  const t1 = Date.parse(`${a}T00:00:00Z`);
  const t2 = Date.parse(`${b}T00:00:00Z`);
  if (Number.isNaN(t1) || Number.isNaN(t2)) return null;
  return Math.round((t2 - t1) / 86_400_000);
}
