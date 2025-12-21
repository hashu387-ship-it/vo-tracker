import { z } from 'zod';

export const SubmissionTypeEnum = z.enum(['VO', 'GenCorr', 'RFI', 'Email']);
export type SubmissionType = z.infer<typeof SubmissionTypeEnum>;

export const VOStatusEnum = z.enum([
  'PendingWithFFC',
  'PendingWithRSG',
  'PendingWithRSGFFC',
  'ApprovedAwaitingDVO',
  'DVORRIssued',
]);
export type VOStatus = z.infer<typeof VOStatusEnum>;

export const createVOSchema = z.object({
  subject: z.string().default('New Variation Order'),
  submissionType: SubmissionTypeEnum.default('VO'),
  submissionReference: z.string().max(100).nullable().optional(),
  responseReference: z.string().max(100).nullable().optional(),
  submissionDate: z.coerce.date().default(() => new Date()),
  assessmentValue: z.coerce.number().min(0).nullable().optional().or(z.literal('')),
  proposalValue: z.coerce.number().min(0).nullable().optional().or(z.literal('')),
  approvedAmount: z.coerce.number().min(0).nullable().optional().or(z.literal('')),
  status: VOStatusEnum.default('PendingWithFFC'),
  vorReference: z.string().max(100).nullable().optional(),
  dvoReference: z.string().max(100).nullable().optional(),
  dvoIssuedDate: z.coerce.date().nullable().optional().or(z.literal('')),
  remarks: z.string().max(2000).nullable().optional(),
  actionNotes: z.string().max(2000).nullable().optional(),

  // File attachments for different approval stages
  ffcRsgProposedFile: z.string().nullable().optional(),
  rsgAssessedFile: z.string().nullable().optional(),
  dvoRrApprovedFile: z.string().nullable().optional(),
});

export const updateVOSchema = createVOSchema.partial();

export const voQuerySchema = z.object({
  search: z.string().optional(),
  status: VOStatusEnum.optional(),
  submissionType: SubmissionTypeEnum.optional(),
  sortBy: z.enum(['submissionDate', 'createdAt', 'proposalValue', 'approvedAmount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(1000).optional().default(1000),
});

export type CreateVOInput = z.infer<typeof createVOSchema>;
export type UpdateVOInput = z.infer<typeof updateVOSchema>;
export type VOQueryInput = z.infer<typeof voQuerySchema>;

// Status display configuration with exact colors from the image
export const statusConfig: Record<VOStatus, { label: string; color: string; bgColor: string; hexColor: string }> = {
  PendingWithFFC: {
    label: 'Pending with FFC',
    color: 'text-white',
    bgColor: 'bg-orange-500',
    hexColor: 'FF8C00', // Orange
  },
  PendingWithRSG: {
    label: 'Pending with RSG',
    color: 'text-white',
    bgColor: 'bg-amber-600',
    hexColor: 'B8860B', // Dark Goldenrod / Olive
  },
  PendingWithRSGFFC: {
    label: 'Pending with RSG/FFC',
    color: 'text-black',
    bgColor: 'bg-yellow-400',
    hexColor: 'FFC000', // Golden Yellow
  },
  ApprovedAwaitingDVO: {
    label: 'Approved & Awaiting for the DVO to be issued',
    color: 'text-white',
    bgColor: 'bg-cyan-500',
    hexColor: '00CED1', // Turquoise/Cyan
  },
  DVORRIssued: {
    label: 'DVO RR Issued',
    color: 'text-white',
    bgColor: 'bg-green-500',
    hexColor: '00C853', // Green
  },
};

export const submissionTypeConfig: Record<SubmissionType, { label: string; color: string }> = {
  VO: { label: 'VO', color: 'text-blue-600 dark:text-blue-400' },
  GenCorr: { label: 'Gen Corr', color: 'text-purple-600 dark:text-purple-400' },
  RFI: { label: 'RFI', color: 'text-orange-600 dark:text-orange-400' },
  Email: { label: 'Email', color: 'text-gray-600 dark:text-gray-400' },
};
