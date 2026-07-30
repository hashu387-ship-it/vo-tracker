import { desc, eq } from 'drizzle-orm';
import { cache } from 'react';

import {
  buildAgeing,
  buildCashflow,
  buildForecast,
  computePaymentPosition,
  computeVariationPosition,
  findDataIssues,
} from '@/lib/domain/calc';
import type {
  ActivityEntry,
  Payment,
  PaymentStatus,
  Project,
  SubmissionType,
  Variation,
  VariationStatus,
} from '@/lib/domain/types';

import { db } from './client';
import { PROJECT_ID, ensureReady } from './seed';
import {
  activity,
  payments as paymentsTable,
  projects as projectsTable,
  variations as variationsTable,
  type ActivityRow,
  type PaymentRow,
  type ProjectRow,
  type VariationRow,
} from './schema';

/* ------------------------------------------------------------------ */
/* Row → domain mapping                                                */
/* ------------------------------------------------------------------ */

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    contractor: row.contractor,
    client: row.client,
    contractDate: row.contractDate,
    currency: row.currency,
    originalContractValue: row.originalContractValue,
    revisedContractValue: row.revisedContractValue,
    advancePaymentTotal: row.advancePaymentTotal,
    advancePaymentPercent: row.advancePaymentPercent,
    retentionCapPercent: row.retentionCapPercent,
    vatRate: row.vatRate,
    dataAsOf: row.dataAsOf,
    sourceWorkbook: row.sourceWorkbook,
  };
}

function toVariation(row: VariationRow): Variation {
  return {
    id: row.id,
    serial: row.serial,
    voNumber: row.voNumber,
    aconexDate: row.aconexDate,
    dvoReference: row.dvoReference,
    subject: row.subject,
    submissionDate: row.submissionDate,
    submissionType: (row.submissionType as SubmissionType | null) ?? null,
    submissionRef: row.submissionRef,
    responseRef: row.responseRef,
    proposalValue: row.proposalValue,
    clientAssessment: row.clientAssessment,
    agreedValue: row.agreedValue,
    status: (row.status as VariationStatus | null) ?? null,
    vorRef: row.vorRef,
    dvoRef: row.dvoRef,
    contractorRemarks: row.contractorRemarks,
    clientRemarks: row.clientRemarks,
    aconexLink: row.aconexLink,
    submissionLink: row.submissionLink,
    owner: row.owner,
    updatedAt: row.updatedAt,
  };
}

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    sequence: row.sequence,
    ref: row.ref,
    kind: row.kind === 'advance' ? 'advance' : 'interim',
    period: row.period,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    grossCertified: row.grossCertified,
    advanceRecovery: row.advanceRecovery,
    backCharge: row.backCharge,
    retention: row.retention,
    vatOnAdvanceRecovery: row.vatOnAdvanceRecovery,
    vat: row.vat,
    netCertified: row.netCertified,
    received: row.received,
    submittedDate: row.submittedDate,
    taxInvoiceDate: row.taxInvoiceDate,
    dueDate: row.dueDate,
    paymentNote: row.paymentNote,
    status: row.status as PaymentStatus,
    collectedDate: row.collectedDate,
    contractorAction: row.contractorAction,
    clientAction: row.clientAction,
    cumulativeGross: row.cumulativeGross,
    updatedAt: row.updatedAt,
  };
}

function toActivity(row: ActivityRow): ActivityEntry {
  return {
    id: row.id,
    entity: row.entity as ActivityEntry['entity'],
    entityId: row.entityId,
    entityLabel: row.entityLabel,
    action: row.action as ActivityEntry['action'],
    summary: row.summary,
    detail: row.detail,
    actor: row.actor,
    at: row.at,
  };
}

/* ------------------------------------------------------------------ */
/* Reads — deduped per request via React `cache`                       */
/* ------------------------------------------------------------------ */

export const getProject = cache(async (): Promise<Project> => {
  await ensureReady();
  const rows = await db.select().from(projectsTable).where(eq(projectsTable.id, PROJECT_ID));
  if (!rows.length) throw new Error('Project header missing — run `npm run db:seed`.');
  return toProject(rows[0]);
});

export const getVariations = cache(async (): Promise<Variation[]> => {
  await ensureReady();
  const rows = await db.select().from(variationsTable).orderBy(variationsTable.serial);
  return rows.map(toVariation);
});

export const getVariation = cache(async (id: string): Promise<Variation | null> => {
  await ensureReady();
  const rows = await db.select().from(variationsTable).where(eq(variationsTable.id, id));
  return rows.length ? toVariation(rows[0]) : null;
});

export const getPayments = cache(async (): Promise<Payment[]> => {
  await ensureReady();
  const rows = await db.select().from(paymentsTable).orderBy(paymentsTable.sequence);
  return rows.map(toPayment);
});

export const getPayment = cache(async (id: string): Promise<Payment | null> => {
  await ensureReady();
  const rows = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id));
  return rows.length ? toPayment(rows[0]) : null;
});

export const getActivity = cache(async (limit = 60): Promise<ActivityEntry[]> => {
  await ensureReady();
  const rows = await db.select().from(activity).orderBy(desc(activity.at)).limit(limit);
  return rows.map(toActivity);
});

/* ------------------------------------------------------------------ */
/* The aggregate the dashboard is built from                           */
/* ------------------------------------------------------------------ */

export const getRegister = cache(async () => {
  const [project, variations, payments] = await Promise.all([
    getProject(),
    getVariations(),
    getPayments(),
  ]);

  const asOf = project.dataAsOf ?? new Date().toISOString().slice(0, 10);
  const paymentPosition = computePaymentPosition(project, payments);
  const variationPosition = computeVariationPosition(variations);

  return {
    project,
    variations,
    payments,
    asOf,
    paymentPosition,
    variationPosition,
    cashflow: buildCashflow(payments),
    ageing: buildAgeing(payments, asOf),
    forecast: buildForecast(project, payments, variations, paymentPosition, asOf),
    issues: findDataIssues(variations, payments),
  };
});

export type Register = Awaited<ReturnType<typeof getRegister>>;
