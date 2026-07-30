/**
 * Canonical domain vocabulary for the HW2C05 commercial register.
 *
 * The source workbook stores statuses as free text, with historic spelling
 * drift ("Acconex", "Approved , Pending DVO"). Everything is normalised to the
 * slugs below on the way in; labels are the only thing users ever see.
 */

export type Tone = 'good' | 'warning' | 'serious' | 'critical' | 'neutral';

/* ------------------------------------------------------------------ */
/* Variation orders                                                    */
/* ------------------------------------------------------------------ */

export const VARIATION_STATUSES = [
  'dvo_issued',
  'dvo_rr_issued',
  'approved_pending_dvo',
  'pending_client',
  'pending_joint',
  'pending_contractor',
  'not_eligible',
] as const;

export type VariationStatus = (typeof VARIATION_STATUSES)[number];

export interface StatusMeta {
  label: string;
  short: string;
  tone: Tone;
  /** Who the ball is with. Drives the "action required" views. */
  ballWith: 'contractor' | 'client' | 'both' | 'none';
  description: string;
}

export const VARIATION_STATUS_META: Record<VariationStatus, StatusMeta> = {
  dvo_issued: {
    label: 'DVO Issued',
    short: 'DVO',
    tone: 'good',
    ballWith: 'none',
    description: 'Determination of Variation Order issued — the change is in the contract.',
  },
  dvo_rr_issued: {
    label: 'DVO RR Issued',
    short: 'DVO RR',
    tone: 'good',
    ballWith: 'none',
    description: 'Determination issued against a revised rate/re-assessment.',
  },
  approved_pending_dvo: {
    label: 'Approved, Pending DVO',
    short: 'Approved',
    tone: 'warning',
    ballWith: 'client',
    description: 'Value agreed by both parties; the formal DVO instruction has not landed yet.',
  },
  pending_client: {
    label: 'Pending with RSG',
    short: 'With RSG',
    tone: 'warning',
    ballWith: 'client',
    description: 'Submitted and awaiting the Employer’s assessment.',
  },
  pending_joint: {
    label: 'Pending with RSG/FFC',
    short: 'With both',
    tone: 'serious',
    ballWith: 'both',
    description: 'Open items on both sides — usually a query mid-assessment.',
  },
  pending_contractor: {
    label: 'Pending with FFC',
    short: 'With FFC',
    tone: 'serious',
    ballWith: 'contractor',
    description: 'Action sits with First Fix — cost proposal or substantiation still to be issued.',
  },
  not_eligible: {
    label: 'Not Eligible',
    short: 'Not eligible',
    tone: 'neutral',
    ballWith: 'none',
    description: 'Assessed as not a compensable change.',
  },
};

/** Statuses whose value is already secured in the contract. */
export const SETTLED_VARIATION_STATUSES: VariationStatus[] = ['dvo_issued', 'dvo_rr_issued'];

/** Statuses still moving through the commercial cycle. */
export const OPEN_VARIATION_STATUSES: VariationStatus[] = [
  'approved_pending_dvo',
  'pending_client',
  'pending_joint',
  'pending_contractor',
];

export const SUBMISSION_TYPES = ['VO', 'RFI', 'Gen CORR'] as const;
export type SubmissionType = (typeof SUBMISSION_TYPES)[number];

export function normaliseVariationStatus(raw: string | null | undefined): VariationStatus | null {
  if (!raw) return null;
  const key = raw.toLowerCase().replace(/[^a-z/]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (key.startsWith('dvo rr')) return 'dvo_rr_issued';
  if (key.startsWith('dvo issued')) return 'dvo_issued';
  if (key.startsWith('approved')) return 'approved_pending_dvo';
  if (key.includes('rsg/ffc') || key.includes('rsg ffc')) return 'pending_joint';
  if (key.includes('pending with rsg')) return 'pending_client';
  if (key.includes('pending with ffc')) return 'pending_contractor';
  if (key.startsWith('not elig')) return 'not_eligible';
  return null;
}

export function normaliseSubmissionType(raw: string | null | undefined): SubmissionType | null {
  if (!raw) return null;
  const key = raw.toLowerCase();
  if (key.includes('rfi')) return 'RFI';
  if (key.includes('corr')) return 'Gen CORR';
  if (key.includes('vo') || key.includes('var') || key.includes('rfp')) return 'VO';
  return null;
}

export interface Variation {
  id: string;
  serial: number;
  voNumber: string | null;
  aconexDate: string | null;
  dvoReference: string | null;
  subject: string;
  submissionDate: string | null;
  submissionType: SubmissionType | null;
  submissionRef: string | null;
  responseRef: string | null;
  /** Contractor's priced cost proposal. */
  proposalValue: number | null;
  /** Employer's assessed value. */
  clientAssessment: number | null;
  /** The value carried into the commercial summary. */
  agreedValue: number | null;
  status: VariationStatus | null;
  vorRef: string | null;
  dvoRef: string | null;
  contractorRemarks: string | null;
  clientRemarks: string | null;
  aconexLink: string | null;
  submissionLink: string | null;
  owner: string | null;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Payment certificates                                                */
/* ------------------------------------------------------------------ */

export const PAYMENT_STATUSES = [
  'received',
  'approved_aconex',
  'submitted_aconex',
  'under_review',
  'draft',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  received: {
    label: 'Received',
    short: 'Received',
    tone: 'good',
    ballWith: 'none',
    description: 'Cash collected in full.',
  },
  approved_aconex: {
    label: 'Approved via Aconex',
    short: 'Approved',
    tone: 'warning',
    ballWith: 'client',
    description: 'Certified and tax invoice lodged — awaiting the transfer.',
  },
  submitted_aconex: {
    label: 'Submitted on Aconex',
    short: 'Submitted',
    tone: 'warning',
    ballWith: 'client',
    description: 'Application formally submitted, certification pending.',
  },
  under_review: {
    label: 'Under Review',
    short: 'Under review',
    tone: 'serious',
    ballWith: 'client',
    description: 'Sent for assessment; not yet certified, so excluded from work done.',
  },
  draft: {
    label: 'Draft',
    short: 'Draft',
    tone: 'neutral',
    ballWith: 'contractor',
    description: 'Being prepared by the commercial team.',
  },
};

/** Certified for the purposes of "work done" — everything bar an un-assessed claim. */
export const RECOGNISED_PAYMENT_STATUSES: PaymentStatus[] = [
  'received',
  'approved_aconex',
  'submitted_aconex',
];

export function normalisePaymentStatus(raw: string | null | undefined): PaymentStatus | null {
  if (!raw) return null;
  const key = raw.toLowerCase();
  if (key.includes('receiv')) return 'received';
  if (key.includes('approv')) return 'approved_aconex';
  if (key.includes('submit')) return 'submitted_aconex';
  if (key.includes('review') || key.includes('assess')) return 'under_review';
  if (key.includes('draft')) return 'draft';
  return null;
}

export type PaymentKind = 'advance' | 'interim';

export interface Payment {
  id: string;
  sequence: number;
  ref: string;
  kind: PaymentKind;
  period: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  grossCertified: number;
  advanceRecovery: number;
  backCharge: number;
  retention: number;
  vatOnAdvanceRecovery: number;
  vat: number;
  netCertified: number;
  received: number | null;
  submittedDate: string | null;
  taxInvoiceDate: string | null;
  dueDate: string | null;
  paymentNote: string | null;
  status: PaymentStatus;
  collectedDate: string | null;
  contractorAction: string | null;
  clientAction: string | null;
  cumulativeGross: number | null;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Project header                                                      */
/* ------------------------------------------------------------------ */

export interface Project {
  id: string;
  code: string;
  name: string;
  contractor: string;
  client: string;
  contractDate: string | null;
  currency: string;
  originalContractValue: number;
  revisedContractValue: number;
  advancePaymentTotal: number;
  advancePaymentPercent: number;
  retentionCapPercent: number;
  vatRate: number;
  dataAsOf: string | null;
  sourceWorkbook: string | null;
}

/* ------------------------------------------------------------------ */
/* Activity                                                            */
/* ------------------------------------------------------------------ */

export type ActivityAction = 'created' | 'updated' | 'deleted' | 'imported' | 'exported';

export interface ActivityEntry {
  id: string;
  entity: 'variation' | 'payment' | 'project' | 'system';
  entityId: string | null;
  entityLabel: string | null;
  action: ActivityAction;
  summary: string;
  detail: string | null;
  actor: string;
  at: string;
}

export function toneClasses(tone: Tone): { chip: string; dot: string; text: string } {
  switch (tone) {
    case 'good':
      return {
        chip: 'bg-good/10 text-good border-good/25',
        dot: 'bg-good',
        text: 'text-good',
      };
    case 'warning':
      return {
        chip: 'bg-warning/10 text-warning border-warning/25',
        dot: 'bg-warning',
        text: 'text-warning',
      };
    case 'serious':
      return {
        chip: 'bg-serious/10 text-serious border-serious/25',
        dot: 'bg-serious',
        text: 'text-serious',
      };
    case 'critical':
      return {
        chip: 'bg-critical/10 text-critical border-critical/25',
        dot: 'bg-critical',
        text: 'text-critical',
      };
    default:
      return {
        chip: 'bg-muted text-muted-foreground border-border',
        dot: 'bg-neutral',
        text: 'text-muted-foreground',
      };
  }
}
