/**
 * The commercial calculation engine.
 *
 * Every figure the dashboard shows is derived here from the raw register rows —
 * nothing is stored pre-aggregated. The definitions deliberately reproduce the
 * source workbook's own summary blocks so the app and the spreadsheet agree:
 *
 *  • "Total work done" counts certificates that have been certified or better.
 *    A claim still `under_review` is *not* work done (workbook D12).
 *  • Advance and retention "deducted till date" likewise exclude un-assessed
 *    claims — retention on the open claim is contingent (workbook H5 / H10).
 *  • Retention is capped at a percentage of the *revised* contract value, not
 *    accumulated from the per-certificate deductions, because the deduction rate
 *    steps from 10% to 5% at the 50% release (workbook H9).
 */

import {
  OPEN_VARIATION_STATUSES,
  RECOGNISED_PAYMENT_STATUSES,
  SETTLED_VARIATION_STATUSES,
  VARIATION_STATUSES,
  VARIATION_STATUS_META,
  type Payment,
  type PaymentStatus,
  type Project,
  type Variation,
  type VariationStatus,
} from './types';

const round = (n: number) => Math.round(n * 100) / 100;
const sum = (rows: number[]) => round(rows.reduce((a, b) => a + b, 0));

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export interface PaymentPosition {
  /** Gross certified by certificate status (interim certificates only). */
  byStatus: Array<{ status: PaymentStatus; count: number; gross: number }>;
  received: number;
  approved: number;
  submitted: number;
  underReview: number;
  /** received + approved + submitted — matches the workbook's "Total Work Done". */
  totalWorkDone: number;
  balanceToComplete: number;
  percentComplete: number;
  /** Including the claim still under assessment. */
  totalClaimed: number;

  advanceTotal: number;
  advanceDeducted: number;
  advanceBalance: number;
  advanceRecoveredPercent: number;

  retentionCap: number;
  retentionDeducted: number;
  retentionBalance: number;
  retentionReleasedPercent: number;

  netCertifiedTotal: number;
  cashReceivedTotal: number;
  /** Certified but not yet in the bank. */
  outstanding: number;
  outstandingCount: number;

  vatTotal: number;
  backChargeTotal: number;

  interimCount: number;
  advanceCount: number;
}

export function computePaymentPosition(project: Project, payments: Payment[]): PaymentPosition {
  const interim = payments.filter((p) => p.kind === 'interim');
  const advances = payments.filter((p) => p.kind === 'advance');
  const recognised = interim.filter((p) => RECOGNISED_PAYMENT_STATUSES.includes(p.status));

  const grossFor = (status: PaymentStatus) =>
    sum(interim.filter((p) => p.status === status).map((p) => p.grossCertified));

  const byStatus = (['received', 'approved_aconex', 'submitted_aconex', 'under_review', 'draft'] as PaymentStatus[])
    .map((status) => ({
      status,
      count: interim.filter((p) => p.status === status).length,
      gross: grossFor(status),
    }))
    .filter((row) => row.count > 0);

  const received = grossFor('received');
  const approved = grossFor('approved_aconex');
  const submitted = grossFor('submitted_aconex');
  const underReview = grossFor('under_review');

  const totalWorkDone = round(received + approved + submitted);
  const balanceToComplete = round(project.revisedContractValue - totalWorkDone);

  const advanceDeducted = round(Math.abs(sum(recognised.map((p) => p.advanceRecovery))));
  const retentionDeducted = round(Math.abs(sum(recognised.map((p) => p.retention))));
  const retentionCap = round(project.revisedContractValue * project.retentionCapPercent);

  const netCertifiedTotal = sum(payments.map((p) => p.netCertified));
  const cashReceivedTotal = sum(payments.map((p) => p.received ?? 0));
  const openCertificates = payments.filter(
    (p) => (p.received ?? 0) < p.netCertified - 0.005,
  );

  return {
    byStatus,
    received,
    approved,
    submitted,
    underReview,
    totalWorkDone,
    balanceToComplete,
    percentComplete: project.revisedContractValue
      ? totalWorkDone / project.revisedContractValue
      : 0,
    totalClaimed: round(totalWorkDone + underReview),

    advanceTotal: project.advancePaymentTotal,
    advanceDeducted,
    advanceBalance: round(project.advancePaymentTotal - advanceDeducted),
    advanceRecoveredPercent: project.advancePaymentTotal
      ? advanceDeducted / project.advancePaymentTotal
      : 0,

    retentionCap,
    retentionDeducted,
    retentionBalance: round(retentionCap - retentionDeducted),
    retentionReleasedPercent: retentionCap ? retentionDeducted / retentionCap : 0,

    netCertifiedTotal,
    cashReceivedTotal,
    outstanding: round(netCertifiedTotal - cashReceivedTotal),
    outstandingCount: openCertificates.length,

    vatTotal: sum(payments.map((p) => p.vat)),
    backChargeTotal: sum(payments.map((p) => p.backCharge)),

    interimCount: interim.length,
    advanceCount: advances.length,
  };
}

/* ------------------------------------------------------------------ */
/* Variations                                                          */
/* ------------------------------------------------------------------ */

export interface VariationPosition {
  byStatus: Array<{
    status: VariationStatus;
    label: string;
    count: number;
    value: number;
  }>;
  total: number;
  totalValue: number;
  /** Rows carrying an agreed value — the workbook's "Total Submitted VO". */
  valuedCount: number;
  settledValue: number;
  settledCount: number;
  openValue: number;
  openCount: number;
  pendingContractorCount: number;
  pendingClientCount: number;
  additionsValue: number;
  omissionsValue: number;
  /** Cost proposals lodged but not yet assessed by the Employer. */
  unassessedProposalValue: number;
  unassessedCount: number;
  /** Employer assessment vs contractor proposal, where both exist. */
  assessmentDelta: number;
  assessmentPairs: number;
}

export function computeVariationPosition(variations: Variation[]): VariationPosition {
  const valued = variations.filter((v) => v.agreedValue !== null);

  const byStatus = VARIATION_STATUSES.map((status) => {
    const rows = variations.filter((v) => v.status === status);
    return {
      status,
      label: VARIATION_STATUS_META[status].label,
      count: rows.length,
      value: sum(rows.map((v) => v.agreedValue ?? 0)),
    };
  }).filter((row) => row.count > 0);

  const inStatuses = (statuses: VariationStatus[]) =>
    variations.filter((v) => v.status && statuses.includes(v.status));

  const settled = inStatuses(SETTLED_VARIATION_STATUSES);
  const open = inStatuses(OPEN_VARIATION_STATUSES);

  const withBoth = variations.filter(
    (v) => v.proposalValue !== null && v.clientAssessment !== null,
  );

  const unassessed = variations.filter(
    (v) => v.proposalValue !== null && v.clientAssessment === null && v.agreedValue === null,
  );

  return {
    byStatus,
    total: variations.length,
    totalValue: sum(valued.map((v) => v.agreedValue ?? 0)),
    valuedCount: valued.length,
    settledValue: sum(settled.map((v) => v.agreedValue ?? 0)),
    settledCount: settled.length,
    openValue: sum(open.map((v) => v.agreedValue ?? 0)),
    openCount: open.length,
    pendingContractorCount: variations.filter((v) => v.status === 'pending_contractor').length,
    pendingClientCount: variations.filter(
      (v) => v.status === 'pending_client' || v.status === 'pending_joint',
    ).length,
    additionsValue: sum(valued.filter((v) => (v.agreedValue ?? 0) > 0).map((v) => v.agreedValue!)),
    omissionsValue: sum(valued.filter((v) => (v.agreedValue ?? 0) < 0).map((v) => v.agreedValue!)),
    unassessedProposalValue: sum(unassessed.map((v) => v.proposalValue ?? 0)),
    unassessedCount: unassessed.length,
    assessmentDelta: sum(
      withBoth.map((v) => (v.clientAssessment ?? 0) - (v.proposalValue ?? 0)),
    ),
    assessmentPairs: withBoth.length,
  };
}

/* ------------------------------------------------------------------ */
/* Cash-flow series                                                    */
/* ------------------------------------------------------------------ */

export interface CashflowPoint {
  /**
   * Never call this `ref`: Recharts spreads each data entry onto the rendered
   * SVG node, and React would read a string `ref` prop as an element ref.
   */
  certificate: string;
  /**
   * Unique category value for the charts' x-axis. The source register reuses
   * "IPA 30" for two consecutive certificates, and a categorical axis needs
   * distinct values — the display label is still `ref`.
   */
  key: string;
  label: string;
  date: string | null;
  gross: number;
  cumulativeGross: number;
  net: number;
  cumulativeNet: number;
  received: number;
  cumulativeReceived: number;
  status: PaymentStatus;
}

/** Ordered S-curve of certified vs collected. Advance payments are excluded —
 *  they are financing, not measured work. */
export function buildCashflow(payments: Payment[]): CashflowPoint[] {
  let cg = 0;
  let cn = 0;
  let cr = 0;
  return payments
    .filter((p) => p.kind === 'interim')
    .sort((a, b) => a.sequence - b.sequence)
    .map((p) => {
      cg = round(cg + p.grossCertified);
      cn = round(cn + p.netCertified);
      cr = round(cr + (p.received ?? 0));
      return {
        certificate: p.ref,
        key: `${p.ref}#${p.sequence}`,
        label: p.periodEnd ?? p.submittedDate ?? p.ref,
        date: p.periodEnd ?? p.submittedDate,
        gross: p.grossCertified,
        cumulativeGross: cg,
        net: p.netCertified,
        cumulativeNet: cn,
        received: p.received ?? 0,
        cumulativeReceived: cr,
        status: p.status,
      };
    });
}

export interface AgeingBucket {
  label: string;
  count: number;
  value: number;
}

/** Ageing of certified-but-uncollected value, measured from the tax invoice
 *  date (or submission date when no invoice has been raised). */
export function buildAgeing(payments: Payment[], asOf: string): AgeingBucket[] {
  const buckets: AgeingBucket[] = [
    { label: '0–30 days', count: 0, value: 0 },
    { label: '31–60 days', count: 0, value: 0 },
    { label: '61–90 days', count: 0, value: 0 },
    { label: '90+ days', count: 0, value: 0 },
  ];
  const asOfMs = Date.parse(`${asOf}T00:00:00Z`);

  for (const p of payments) {
    const outstanding = round(p.netCertified - (p.received ?? 0));
    if (outstanding <= 0.005) continue;
    const anchor = p.taxInvoiceDate ?? p.submittedDate;
    const anchorMs = anchor ? Date.parse(`${anchor}T00:00:00Z`) : NaN;
    const age = Number.isNaN(anchorMs) ? 0 : Math.max(0, (asOfMs - anchorMs) / 86_400_000);
    const index = age <= 30 ? 0 : age <= 60 ? 1 : age <= 90 ? 2 : 3;
    buckets[index].count += 1;
    buckets[index].value = round(buckets[index].value + outstanding);
  }
  return buckets;
}

/* ------------------------------------------------------------------ */
/* Forecast                                                            */
/* ------------------------------------------------------------------ */

export interface ForecastResult {
  /** Mean gross certified across the last n certificates. */
  runRate: number;
  monthsToComplete: number | null;
  projectedCompletion: string | null;
  /** Revised contract + open variations that are likely to land. */
  projectedFinalAccount: number;
  /** Value expected to be released from retention on completion. */
  retentionRelease: number;
  basisCount: number;
  projection: Array<{ label: string; certified: number; cumulative: number; projected: boolean }>;
}

export function buildForecast(
  project: Project,
  payments: Payment[],
  variations: Variation[],
  position: PaymentPosition,
  asOf: string,
  window = 6,
): ForecastResult {
  const curve = buildCashflow(payments);
  const recent = curve.slice(-window);
  const runRate = recent.length ? round(sum(recent.map((c) => c.gross)) / recent.length) : 0;

  const remaining = Math.max(0, position.balanceToComplete);
  const monthsToComplete = runRate > 0 ? Math.ceil(remaining / runRate) : null;

  let projectedCompletion: string | null = null;
  if (monthsToComplete !== null && monthsToComplete < 240) {
    const [y, m] = asOf.split('-').map(Number);
    const target = new Date(Date.UTC(y, m - 1 + monthsToComplete, 1));
    projectedCompletion = `${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, '0')}-01`;
  }

  // Open variations weighted by how far through the cycle they are.
  const weights: Partial<Record<VariationStatus, number>> = {
    approved_pending_dvo: 1,
    pending_client: 0.6,
    pending_joint: 0.5,
    pending_contractor: 0.3,
  };
  const weightedOpen = round(
    variations.reduce((total, v) => {
      if (!v.status) return total;
      const weight = weights[v.status];
      if (!weight) return total;
      const value = v.agreedValue ?? v.clientAssessment ?? v.proposalValue ?? 0;
      return total + value * weight;
    }, 0),
  );

  const projection: ForecastResult['projection'] = curve.map((c) => ({
    label: c.key,
    certified: c.gross,
    cumulative: c.cumulativeGross,
    projected: false,
  }));

  let cumulative = curve.length ? curve[curve.length - 1].cumulativeGross : 0;
  const horizon = Math.min(monthsToComplete ?? 0, 12);
  for (let i = 1; i <= horizon; i += 1) {
    const step = Math.min(runRate, Math.max(0, project.revisedContractValue - cumulative));
    cumulative = round(cumulative + step);
    projection.push({
      label: `+${i}m`,
      certified: step,
      cumulative,
      projected: true,
    });
  }

  return {
    runRate,
    monthsToComplete,
    projectedCompletion,
    projectedFinalAccount: round(project.revisedContractValue + weightedOpen),
    retentionRelease: position.retentionDeducted,
    basisCount: recent.length,
    projection,
  };
}

/* ------------------------------------------------------------------ */
/* Data quality                                                        */
/* ------------------------------------------------------------------ */

export interface DataIssue {
  severity: 'warning' | 'info';
  entity: 'variation' | 'payment';
  id: string;
  label: string;
  message: string;
}

/** Surfaces the inconsistencies that live in the source workbook rather than
 *  silently correcting them — the register stays faithful to what was issued. */
export function findDataIssues(variations: Variation[], payments: Payment[]): DataIssue[] {
  const issues: DataIssue[] = [];

  const refCounts = new Map<string, Payment[]>();
  for (const p of payments) {
    refCounts.set(p.ref, [...(refCounts.get(p.ref) ?? []), p]);
  }
  for (const [ref, rows] of refCounts) {
    if (rows.length > 1) {
      issues.push({
        severity: 'warning',
        entity: 'payment',
        id: rows[rows.length - 1].id,
        label: ref,
        message: `Reference "${ref}" is used by ${rows.length} certificates — the later one is most likely the next in sequence.`,
      });
    }
  }

  for (const p of payments) {
    const expected =
      p.grossCertified + p.advanceRecovery + p.backCharge + p.retention + p.vatOnAdvanceRecovery + p.vat;
    if (Math.abs(expected - p.netCertified) > 1) {
      issues.push({
        severity: 'info',
        entity: 'payment',
        id: p.id,
        label: p.ref,
        message: `Net certified differs from the sum of its components by ${round(p.netCertified - expected)}.`,
      });
    }
  }

  for (const v of variations) {
    if (!v.status) {
      issues.push({
        severity: 'warning',
        entity: 'variation',
        id: v.id,
        label: v.voNumber ?? `#${v.serial}`,
        message: 'No status recorded.',
      });
    }
    if (v.status === 'pending_contractor' && v.proposalValue === null) {
      issues.push({
        severity: 'info',
        entity: 'variation',
        id: v.id,
        label: v.voNumber ?? `#${v.serial}`,
        message: 'Action sits with FFC and no cost proposal value has been priced yet.',
      });
    }
  }

  return issues;
}

/* ------------------------------------------------------------------ */
/* Period parsing                                                      */
/* ------------------------------------------------------------------ */

const MONTH_INDEX: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/**
 * "Sept 20th 2023 – Dec 25th 2023" → { start: 2023-09-20, end: 2023-12-25 }
 * The workbook uses several dashes and a mix of "Sept"/"Sep"/"June".
 */
export function parsePeriod(period: string | null | undefined): {
  start: string | null;
  end: string | null;
} {
  if (!period) return { start: null, end: null };
  const parts = period.split(/[–—-]/).map((s) => s.trim());
  const parse = (chunk: string | undefined): string | null => {
    if (!chunk) return null;
    const match = chunk.match(/([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4})/);
    if (!match) return null;
    const month = MONTH_INDEX[match[1].slice(0, 3).toLowerCase()];
    if (!month) return null;
    return `${match[3]}-${String(month).padStart(2, '0')}-${String(Number(match[2])).padStart(2, '0')}`;
  };
  return { start: parse(parts[0]), end: parse(parts[1]) };
}
