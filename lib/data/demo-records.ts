// Maps the real embedded HW2 dataset into the shapes the existing VO Log and
// Payment Register pages expect, so they always show the genuine project data
// (used for guest/demo viewing and as a fallback when the database is empty).

import type { PaymentApplication } from '@prisma/client';
import { variationOrders, payments, paymentState } from '@/lib/data/commercial';
import type { VO } from '@/lib/hooks/use-vos';
import type { VOStatus, SubmissionType } from '@/lib/validations/vo';

/* raw VO status (workbook) -> canonical app VOStatus */
function mapStatus(raw: string): VOStatus {
  switch (raw.trim()) {
    case 'DVO RR Issued':
    case 'DVO Issued':
      return 'DVORRIssued';
    case 'Approved , Pending DVO':
      return 'ApprovedAwaitingDVO';
    case 'Pending with RSG/FFC':
      return 'PendingWithRSGFFC';
    case 'Pending with FFC':
    case 'Not Eligible':
      return 'PendingWithFFC';
    case 'Pending with RSG':
    default:
      return 'PendingWithRSG';
  }
}

function mapType(raw: string): SubmissionType {
  const t = (raw || '').toLowerCase();
  if (t.includes('rfi')) return 'RFI';
  if (t.includes('corr')) return 'GenCorr';
  if (t.includes('email')) return 'Email';
  return 'VO';
}

/** Return a valid ISO date string, trying the primary then fallbacks. */
function safeISO(primary?: string | null, fallback?: string | null): string {
  for (const candidate of [primary, fallback]) {
    if (candidate) {
      const t = Date.parse(candidate);
      if (!Number.isNaN(t)) return new Date(t).toISOString();
    }
  }
  return new Date('2024-01-01').toISOString();
}

const CLOSED = new Set<VOStatus>(['DVORRIssued', 'ApprovedAwaitingDVO']);

export const realDemoVOs: VO[] = variationOrders.map((v) => {
  const status = mapStatus(v.status);
  const proposal = v.costProposal ?? v.value ?? v.rsgAssessment ?? null;
  return {
    id: v.sno,
    subject: v.subject,
    submissionType: mapType(v.type),
    submissionReference: v.submissionRef,
    responseReference: v.responseRef,
    submissionDate: safeISO(v.submissionDate, v.dateIn),
    assessmentValue: v.rsgAssessment,
    proposalValue: proposal,
    approvedAmount: CLOSED.has(status) ? v.value ?? v.rsgAssessment ?? null : null,
    status,
    vorReference: v.vor,
    dvoReference: v.dvoRef,
    dvoIssuedDate: null,
    remarks: v.rsgRemarks ?? v.ffcRemarks,
    actionNotes: v.ffcRemarks,
    ffcRsgProposedFile: null,
    rsgAssessedFile: null,
    dvoRrApprovedFile: null,
    proposedFileUrl: null,
    assessmentFileUrl: null,
    approvalFileUrl: null,
    dvoFileUrl: null,
    createdAt: safeISO(v.dateIn),
    updatedAt: safeISO(v.submissionDate, v.dateIn),
  };
});

/* payment approval state -> page status label */
function mapPaymentStatus(p: (typeof payments)[number]): string {
  if ((p.status || '').toLowerCase() === 'paid') return 'Paid';
  switch (paymentState(p)) {
    case 'received':
      return 'Paid';
    case 'approved':
      return 'Certified';
    case 'submitted':
      return 'Submitted on ACONEX';
    case 'review':
      return 'Submitted';
    default:
      return 'Draft';
  }
}

export const realDemoPayments: PaymentApplication[] = payments.map((p, index) => ({
  id: index + 1,
  paymentNo: p.no,
  description: p.description,
  grossAmount: p.gross ?? 0,
  netPayment: p.net ?? 0,
  advancePaymentRecovery: p.advanceRecovery ?? 0,
  retention: p.retention ?? 0,
  vatRecovery: p.vatRecovery ?? 0,
  vat: p.vat ?? 0,
  paymentStatus: mapPaymentStatus(p),
  submittedDate: p.submittedDate ? new Date(p.submittedDate) : null,
  invoiceDate: p.invoiceDate ? new Date(p.invoiceDate) : null,
  ffcLiveAction: null,
  rsgLiveAction: null,
  approvalStatus: p.approvalStatus || null,
  remarks: null,
  createdAt: new Date(p.submittedDate ?? '2024-01-01'),
  updatedAt: new Date(p.invoiceDate ?? p.submittedDate ?? '2024-01-01'),
})) as unknown as PaymentApplication[];
