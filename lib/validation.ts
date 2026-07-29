import { z } from 'zod';

import { PAYMENT_STATUSES, SUBMISSION_TYPES, VARIATION_STATUSES } from '@/lib/domain/types';

/** Empty strings from HTML forms become null rather than 0 / "". */
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .optional()
  .transform((value) => value ?? null);

const optionalNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null;
  });

const requiredNumber = optionalNumber.transform((value) => value ?? 0);

const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .nullable()
  .optional()
  .or(z.literal(''))
  .transform((value) => (value === '' || value === undefined ? null : value));

export const variationInputSchema = z.object({
  voNumber: optionalText,
  subject: z.string().trim().min(3, 'Give the variation a subject'),
  aconexDate: isoDate,
  dvoReference: optionalText,
  submissionDate: isoDate,
  submissionType: z.enum(SUBMISSION_TYPES).nullable().optional().or(z.literal('')).transform((v) => (v === '' || v === undefined ? null : v)),
  submissionRef: optionalText,
  responseRef: optionalText,
  proposalValue: optionalNumber,
  clientAssessment: optionalNumber,
  agreedValue: optionalNumber,
  status: z.enum(VARIATION_STATUSES).nullable().optional().or(z.literal('')).transform((v) => (v === '' || v === undefined ? null : v)),
  vorRef: optionalText,
  dvoRef: optionalText,
  contractorRemarks: optionalText,
  clientRemarks: optionalText,
  aconexLink: optionalText,
  submissionLink: optionalText,
  owner: optionalText,
});

export type VariationInput = z.infer<typeof variationInputSchema>;

export const paymentInputSchema = z.object({
  ref: z.string().trim().min(1, 'Give the certificate a reference'),
  kind: z.enum(['interim', 'advance']).default('interim'),
  period: optionalText,
  grossCertified: requiredNumber,
  advanceRecovery: requiredNumber,
  backCharge: requiredNumber,
  retention: requiredNumber,
  vatOnAdvanceRecovery: requiredNumber,
  vat: requiredNumber,
  netCertified: optionalNumber,
  received: optionalNumber,
  submittedDate: isoDate,
  taxInvoiceDate: isoDate,
  dueDate: isoDate,
  paymentNote: optionalText,
  status: z.enum(PAYMENT_STATUSES),
  collectedDate: isoDate,
  contractorAction: optionalText,
  clientAction: optionalText,
});

export type PaymentInput = z.infer<typeof paymentInputSchema>;

export const projectInputSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  contractor: z.string().trim().min(1),
  client: z.string().trim().min(1),
  contractDate: isoDate,
  currency: z.string().trim().min(1).default('SAR'),
  originalContractValue: requiredNumber,
  revisedContractValue: requiredNumber,
  advancePaymentTotal: requiredNumber,
  advancePaymentPercent: requiredNumber,
  retentionCapPercent: requiredNumber,
  vatRate: requiredNumber,
  dataAsOf: isoDate,
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

/** Turns a submitted <form> into a plain object Zod can read. */
export function formToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') out[key] = value;
  }
  return out;
}

export function flattenIssues(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
