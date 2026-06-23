// Predictive analytics — Final Account outturn + 6-month cash-flow forecast.
// Pure functions over the commercial dataset (no external services).

import {
  commercialSummary,
  ipaPayments,
  voStatusBreakdown,
  type VOStatusAgg,
} from './commercial';

/* --------------------- Final Account outturn --------------------- */

// Expected approval probability of pending VO value, by status bucket.
const APPROVAL_PROB: Record<VOStatusAgg['config']['bucket'], number> = {
  closed: 1, // already in the revised contract
  approved: 0.9, // commercially agreed, awaiting DVO
  pending: 0.55, // submitted / under review
  excluded: 0, // not eligible
};

export interface FinalAccountForecast {
  current: number; // current revised contract
  low: number;
  expected: number;
  high: number;
  pipelineExpected: number; // expected uplift from pending VOs not yet in contract
  approvalVelocity: number; // approved VO value per month (recent)
  monthsToClose: number; // est. months to clear the pending pipeline at current velocity
}

/** Project the likely final-account outturn from VO approval velocity. */
export function finalAccountForecast(): FinalAccountForecast {
  const breakdown = voStatusBreakdown();
  let pipelineExpected = 0;
  let pipelineLow = 0;
  let pipelineHigh = 0;
  let pendingValue = 0;

  for (const r of breakdown) {
    const bucket = r.config.bucket;
    if (bucket === 'closed' || bucket === 'excluded') continue;
    const p = APPROVAL_PROB[bucket];
    pendingValue += r.value;
    pipelineExpected += r.value * p;
    pipelineHigh += r.value * Math.min(1, p + 0.25);
    pipelineLow += r.value * Math.max(0, p - 0.25);
  }

  const base = commercialSummary.revisedContract;

  // Approval velocity: closed (approved) VO value spread over the project months so far.
  const approvedValue = breakdown
    .filter((r) => r.config.bucket === 'closed')
    .reduce((n, r) => n + r.value, 0);
  const monthsElapsed = Math.max(1, projectMonthsElapsed());
  const approvalVelocity = approvedValue / monthsElapsed;
  const monthsToClose = approvalVelocity > 0 ? Math.max(1, Math.round(pendingValue / approvalVelocity)) : 0;

  return {
    current: base,
    low: base + pipelineLow,
    expected: base + pipelineExpected,
    high: base + pipelineHigh,
    pipelineExpected,
    approvalVelocity,
    monthsToClose,
  };
}

function projectMonthsElapsed(): number {
  const dates = ipaPayments
    .map((p) => p.invoiceDate ?? p.submittedDate)
    .filter(Boolean) as string[];
  if (!dates.length) return 12;
  const first = new Date(dates[0]).getTime();
  const last = new Date(dates[dates.length - 1]).getTime();
  return Math.max(1, Math.round((last - first) / (1000 * 60 * 60 * 24 * 30)));
}

/* ----------------------- Cash-flow forecast ---------------------- */

export interface CashflowPoint {
  label: string;
  /** cumulative gross work-done — actual months */
  actual: number | null;
  /** cumulative gross — projected months */
  forecast: number | null;
  /** optimistic / conservative band for projected months */
  high: number | null;
  low: number | null;
}

function monthLabel(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' }).format(d);
}

/**
 * Cumulative work-done timeline with a `months`-ahead projection that converges
 * toward the revised contract, using the recent monthly certification rate.
 */
export function cashflowForecast(months = 6): { points: CashflowPoint[]; monthlyRate: number } {
  // Aggregate gross by calendar month (IPAs only; advance invoices excluded).
  const byMonth = new Map<string, { date: Date; gross: number }>();
  for (const p of ipaPayments) {
    const ds = p.invoiceDate ?? p.submittedDate;
    if (!ds || !p.gross) continue;
    const d = new Date(ds);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const cur = byMonth.get(key);
    if (cur) cur.gross += p.gross;
    else byMonth.set(key, { date: new Date(d.getFullYear(), d.getMonth(), 1), gross: p.gross });
  }

  const sorted = Array.from(byMonth.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  const points: CashflowPoint[] = [];
  let cum = 0;
  for (const m of sorted) {
    cum += m.gross;
    points.push({ label: monthLabel(m.date), actual: Math.round(cum), forecast: null, high: null, low: null });
  }

  // Recent monthly rate = average of the last 4 months' gross.
  const recent = sorted.slice(-4);
  const monthlyRate = recent.length ? recent.reduce((n, m) => n + m.gross, 0) / recent.length : 0;

  const contract = commercialSummary.revisedContract;
  // bridge point so the forecast line connects to the actual line
  if (points.length) points[points.length - 1].forecast = points[points.length - 1].actual;

  let projCum = cum;
  const last = sorted.length ? sorted[sorted.length - 1].date : new Date();
  for (let i = 1; i <= months; i++) {
    const d = new Date(last.getFullYear(), last.getMonth() + i, 1);
    projCum = Math.min(contract, projCum + monthlyRate);
    const remainingFactor = 1 + i * 0.04;
    points.push({
      label: monthLabel(d),
      actual: null,
      forecast: Math.round(projCum),
      high: Math.round(Math.min(contract, projCum * remainingFactor)),
      low: Math.round(projCum / remainingFactor),
    });
  }

  return { points, monthlyRate };
}
