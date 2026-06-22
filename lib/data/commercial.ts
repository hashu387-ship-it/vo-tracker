// Domain logic for the Commercial Intelligence experience.
// Normalises the raw Payment Register & VO Log into the shapes the UI and the
// local intelligence engine consume: status configs, aggregations, KPIs, forecasts.

import {
  commercialSummary,
  lastUpdated,
  payments,
  variationOrders,
  type CommercialSummary,
  type PaymentRecord,
  type VORecord,
} from './commercial-data';

export { commercialSummary, lastUpdated, payments, variationOrders };
export type { CommercialSummary, PaymentRecord, VORecord };

/* ------------------------------------------------------------------ */
/*  Status configuration                                              */
/* ------------------------------------------------------------------ */

export type VOStatusKey =
  | 'DVORRIssued'
  | 'DVOIssued'
  | 'ApprovedPendingDVO'
  | 'PendingRSG'
  | 'PendingRSGFFC'
  | 'PendingFFC'
  | 'NotEligible';

export interface StatusConfig {
  key: VOStatusKey;
  label: string;
  short: string;
  /** Tailwind gradient classes */
  gradient: string;
  /** raw hex for charts */
  hex: string;
  /** semantic bucket */
  bucket: 'closed' | 'approved' | 'pending' | 'excluded';
  description: string;
}

export const VO_STATUS: Record<VOStatusKey, StatusConfig> = {
  DVORRIssued: {
    key: 'DVORRIssued',
    label: 'DVO RR Issued',
    short: 'DVO RR',
    gradient: 'from-emerald-500 to-teal-500',
    hex: '#10b981',
    bucket: 'closed',
    description: 'Deductive Variation Order — Reconciliation Record issued and closed out.',
  },
  DVOIssued: {
    key: 'DVOIssued',
    label: 'DVO Issued',
    short: 'DVO',
    gradient: 'from-cyan-500 to-sky-500',
    hex: '#06b6d4',
    bucket: 'closed',
    description: 'Directed Variation Order issued — value committed to the contract.',
  },
  ApprovedPendingDVO: {
    key: 'ApprovedPendingDVO',
    label: 'Approved · Awaiting DVO',
    short: 'Approved',
    gradient: 'from-violet-500 to-purple-500',
    hex: '#8b5cf6',
    bucket: 'approved',
    description: 'Commercially agreed, awaiting the formal DVO to be raised.',
  },
  PendingRSG: {
    key: 'PendingRSG',
    label: 'Pending with RSG',
    short: 'RSG',
    gradient: 'from-blue-500 to-indigo-500',
    hex: '#3b82f6',
    bucket: 'pending',
    description: 'Submitted — awaiting Red Sea Global assessment.',
  },
  PendingRSGFFC: {
    key: 'PendingRSGFFC',
    label: 'Pending with RSG / FFC',
    short: 'RSG/FFC',
    gradient: 'from-amber-500 to-orange-500',
    hex: '#f59e0b',
    bucket: 'pending',
    description: 'In joint review between RSG and First Fix.',
  },
  PendingFFC: {
    key: 'PendingFFC',
    label: 'Pending with FFC',
    short: 'FFC',
    gradient: 'from-rose-500 to-pink-500',
    hex: '#f43f5e',
    bucket: 'pending',
    description: 'Action required from First Fix.',
  },
  NotEligible: {
    key: 'NotEligible',
    label: 'Not Eligible',
    short: 'N/E',
    gradient: 'from-slate-400 to-slate-500',
    hex: '#94a3b8',
    bucket: 'excluded',
    description: 'Assessed as not eligible for variation.',
  },
};

const RAW_TO_KEY: Record<string, VOStatusKey> = {
  'DVO RR Issued': 'DVORRIssued',
  'DVO Issued': 'DVOIssued',
  'Approved , Pending DVO': 'ApprovedPendingDVO',
  'Pending with RSG': 'PendingRSG',
  'Pending with RSG/FFC': 'PendingRSGFFC',
  'Pending with FFC': 'PendingFFC',
  'Not Eligible': 'NotEligible',
};

export function statusKeyOf(vo: VORecord): VOStatusKey {
  return RAW_TO_KEY[vo.status?.trim()] ?? 'PendingRSG';
}

export function statusConfigOf(vo: VORecord): StatusConfig {
  return VO_STATUS[statusKeyOf(vo)];
}

export const VO_STATUS_ORDER: VOStatusKey[] = [
  'DVORRIssued',
  'DVOIssued',
  'ApprovedPendingDVO',
  'PendingRSG',
  'PendingRSGFFC',
  'PendingFFC',
  'NotEligible',
];

/* ------------------------------------------------------------------ */
/*  Payment helpers                                                   */
/* ------------------------------------------------------------------ */

export const ipaPayments = payments.filter((p) => p.no.toUpperCase().startsWith('IPA'));
export const advancePayments = payments.filter((p) => p.no.toUpperCase().startsWith('AP'));

export type PaymentState = 'received' | 'approved' | 'submitted' | 'review' | 'draft';

export function paymentState(p: PaymentRecord): PaymentState {
  const a = (p.approvalStatus || '').toLowerCase();
  if (a.includes('received')) return 'received';
  if (a.includes('approved')) return 'approved';
  if (a.includes('submitted')) return 'submitted';
  if (a.includes('review')) return 'review';
  return 'draft';
}

export const PAYMENT_STATE_CONFIG: Record<
  PaymentState,
  { label: string; hex: string; gradient: string }
> = {
  received: { label: 'Received', hex: '#10b981', gradient: 'from-emerald-500 to-teal-500' },
  approved: { label: 'Approved via Aconex', hex: '#06b6d4', gradient: 'from-cyan-500 to-sky-500' },
  submitted: { label: 'Submitted on Aconex', hex: '#3b82f6', gradient: 'from-blue-500 to-indigo-500' },
  review: { label: 'Under Review', hex: '#f59e0b', gradient: 'from-amber-500 to-orange-500' },
  draft: { label: 'Draft', hex: '#94a3b8', gradient: 'from-slate-400 to-slate-500' },
};

/* ------------------------------------------------------------------ */
/*  Aggregations                                                      */
/* ------------------------------------------------------------------ */

export interface VOStatusAgg {
  key: VOStatusKey;
  config: StatusConfig;
  count: number;
  value: number;
}

export function voStatusBreakdown(records: VORecord[] = variationOrders): VOStatusAgg[] {
  const map = new Map<VOStatusKey, VOStatusAgg>();
  for (const key of VO_STATUS_ORDER) {
    map.set(key, { key, config: VO_STATUS[key], count: 0, value: 0 });
  }
  for (const vo of records) {
    const key = statusKeyOf(vo);
    const agg = map.get(key)!;
    agg.count += 1;
    agg.value += vo.value ?? vo.rsgAssessment ?? vo.costProposal ?? 0;
  }
  return VO_STATUS_ORDER.map((k) => map.get(k)!).filter((a) => a.count > 0);
}

/** Live VO status summary incl. totals (matches the "Submitted VO" sheet). */
export function voSummary(records: VORecord[] = variationOrders) {
  const rows = voStatusBreakdown(records);
  const totalCount = rows.reduce((n, r) => n + r.count, 0);
  const totalValue = rows.reduce((n, r) => n + r.value, 0);
  return { rows, totalCount, totalValue };
}

/** Live IPA summary (matches the "Summary of IPA's" sheet) — values + ratios. */
export function ipaSummary() {
  const s = commercialSummary;
  const base = s.revisedContract || 1;
  return {
    statuses: [
      { label: 'Under Review', value: s.underReview, pct: s.underReview / base, hex: '#c4694e' },
      { label: 'Submitted on ACONEX', value: s.submittedAconex, pct: s.submittedAconex / base, hex: '#b08d57' },
      { label: 'Approved via Aconex', value: s.approvedAconex, pct: s.approvedAconex / base, hex: '#5aa6b0' },
      { label: 'Received', value: s.received, pct: s.received / base, hex: '#1f4e5f' },
    ],
    originalContract: s.originalContract,
    revisedContract: s.revisedContract,
    totalWorkDone: { value: s.totalClaimedGross, pct: s.totalClaimedGross / base },
    balanceWorkDone: { value: s.balanceGross, pct: s.balanceGross / base },
    advance: {
      total: s.totalAdvance,
      totalPct: s.advancePct,
      deducted: s.advanceDeducted,
      deductedPct: s.totalAdvance ? s.advanceDeducted / s.totalAdvance : 0,
      balance: s.advanceBalance,
      balancePct: s.totalAdvance ? s.advanceBalance / s.totalAdvance : 0,
    },
    retention: {
      total: s.totalRetention,
      totalPct: s.retentionPct,
      deducted: s.retentionDeducted,
      deductedPct: s.totalRetention ? s.retentionDeducted / s.totalRetention : 0,
      balance: s.retentionBalance,
      balancePct: s.totalRetention ? s.retentionBalance / s.totalRetention : 0,
    },
  };
}

export interface CashflowPoint {
  no: string;
  label: string;
  date: string | null;
  gross: number;
  net: number;
  received: number;
  cumulativeGross: number;
  cumulativeReceived: number;
}

/** Monthly cashflow series for the IPA timeline (excludes advance invoices). */
export function cashflowSeries(): CashflowPoint[] {
  let cumGross = 0;
  let cumReceived = 0;
  return ipaPayments.map((p) => {
    const gross = p.gross ?? 0;
    const net = p.net ?? 0;
    const received = p.received ?? 0;
    cumGross += gross;
    cumReceived += received;
    return {
      no: p.no,
      label: p.no.replace('IPA ', '#'),
      date: p.invoiceDate ?? p.submittedDate,
      gross,
      net,
      received,
      cumulativeGross: cumGross,
      cumulativeReceived: cumReceived,
    };
  });
}

/** Simple linear forecast of the next `periods` net certifications. */
export function forecastNet(periods = 4): { label: string; net: number; forecast: boolean }[] {
  const history = ipaPayments.map((p) => p.net ?? 0).filter((n) => n > 0);
  const n = history.length;
  const recent = history.slice(-6);
  // least-squares slope over recent window
  const m = recent.length;
  const xs = recent.map((_, i) => i);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = recent.reduce((a, b) => a + b, 0);
  const sumXY = recent.reduce((a, y, i) => a + i * y, 0);
  const sumXX = xs.reduce((a, x) => a + x * x, 0);
  const slope = (m * sumXY - sumX * sumY) / Math.max(1, m * sumXX - sumX * sumX);
  const intercept = sumY / m - (slope * sumX) / m;
  const out: { label: string; net: number; forecast: boolean }[] = ipaPayments
    .filter((p) => (p.net ?? 0) > 0)
    .map((p) => ({ label: p.no.replace('IPA ', '#'), net: p.net ?? 0, forecast: false }));
  for (let i = 0; i < periods; i++) {
    const x = m + i;
    const projected = Math.max(0, intercept + slope * x);
    out.push({ label: `F${i + 1}`, net: Math.round(projected), forecast: true });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  KPIs                                                              */
/* ------------------------------------------------------------------ */

export interface Kpi {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  delta?: number;
  hint: string;
  format: 'currency' | 'percent' | 'number';
}

export function headlineKpis(): Kpi[] {
  const s = commercialSummary;
  const totalReceivedCount = ipaPayments.filter((p) => paymentState(p) === 'received').length;
  return [
    {
      id: 'revised',
      label: 'Revised Contract Value',
      value: s.revisedContract,
      format: 'currency',
      delta: s.variancePct * 100,
      hint: `Uplift of ${(s.variancePct * 100).toFixed(1)}% vs original ${formatCompact(s.originalContract)}`,
    },
    {
      id: 'workdone',
      label: 'Work Completed',
      value: s.workDonePct * 100,
      format: 'percent',
      decimals: 1,
      hint: `${formatCompact(s.totalClaimedGross)} gross certified · ${formatCompact(s.balanceGross)} remaining`,
    },
    {
      id: 'received',
      label: 'Cash Received',
      value: s.received,
      format: 'currency',
      delta: s.receivedPct * 100,
      hint: `${(s.receivedPct * 100).toFixed(1)}% of contract · across ${totalReceivedCount} certified IPAs`,
    },
    {
      id: 'voexposure',
      label: 'VO Exposure (Submitted)',
      value: s.totalSubmittedVOValue,
      format: 'currency',
      hint: `${variationOrders.length} variations logged · ${voStatusBreakdown().filter((a) => a.config.bucket === 'pending').reduce((n, a) => n + a.count, 0)} pending`,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                        */
/* ------------------------------------------------------------------ */

export function formatSAR(amount: number | null | undefined, decimals = 0): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatCompact(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}SAR ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}SAR ${(abs / 1_000).toFixed(1)}K`;
  return `${sign}SAR ${abs.toFixed(0)}`;
}

export function formatPct(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDateShort(date: string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}

/** Last-updated as a friendly "22 Jun 2026, 13:47" string. */
export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/* ------------------------------------------------------------------ */
/*  Notifications / recent activity                                    */
/* ------------------------------------------------------------------ */

export interface UpdateItem {
  id: string;
  kind: 'data' | 'vo' | 'payment';
  title: string;
  subtitle: string;
  /** ISO-ish date used for sorting + display */
  date: string;
  hex: string;
  href: string;
}

/**
 * Recent register activity for the notification bell — derived live from the
 * dataset. A pinned "data refreshed" entry first, then the most recent IPAs
 * and VOs interleaved by date.
 */
export function recentUpdates(limit = 8): UpdateItem[] {
  const items: UpdateItem[] = [];

  const recentPayments = [...ipaPayments]
    .filter((p) => p.submittedDate)
    .sort((a, b) => (a.submittedDate! < b.submittedDate! ? 1 : -1))
    .slice(0, 5)
    .map((p): UpdateItem => {
      const st = PAYMENT_STATE_CONFIG[paymentState(p)];
      return {
        id: `pay-${p.no}`,
        kind: 'payment',
        title: `${p.no} · ${st.label}`,
        subtitle: `${formatCompact(p.net ?? p.gross)} net — ${p.description}`,
        date: p.submittedDate ?? p.invoiceDate ?? '',
        hex: st.hex,
        href: '/payments',
      };
    });

  const recentVos = [...variationOrders]
    .filter((v) => v.dateIn || v.submissionDate)
    .sort((a, b) => {
      const da = a.submissionDate ?? a.dateIn ?? '';
      const db = b.submissionDate ?? b.dateIn ?? '';
      return da < db ? 1 : -1;
    })
    .slice(0, 5)
    .map((v): UpdateItem => {
      const cfg = statusConfigOf(v);
      return {
        id: `vo-${v.sno}`,
        kind: 'vo',
        title: `${v.voNumber ?? 'VO'} · ${cfg.label}`,
        subtitle: v.subject,
        date: v.submissionDate ?? v.dateIn ?? '',
        hex: cfg.hex,
        href: '/vos',
      };
    });

  const merged = [...recentPayments, ...recentVos].sort((a, b) => (a.date < b.date ? 1 : -1));

  items.push({
    id: 'data-refresh',
    kind: 'data',
    title: 'Commercial register refreshed',
    subtitle: `Pay Register & VO Log updated — ${commercialSummary.asOf}`,
    date: lastUpdated,
    hex: '#b0512f',
    href: '/intelligence',
  });

  return [...items, ...merged].slice(0, limit);
}
