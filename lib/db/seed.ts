import projectSeed from '@/data/seed/project.json';
import paymentSeed from '@/data/seed/payments.json';
import variationSeed from '@/data/seed/variations.json';
import { parsePeriod } from '@/lib/domain/calc';
import {
  normalisePaymentStatus,
  normaliseSubmissionType,
  normaliseVariationStatus,
  type PaymentKind,
} from '@/lib/domain/types';

import { client, db, migrate } from './client';
import { activity, payments, projects, variations } from './schema';

export const PROJECT_ID = 'hw2c05';

const round2 = (value: number | null | undefined): number =>
  value === null || value === undefined ? 0 : Math.round(value * 100) / 100;

const nullableRound = (value: number | null | undefined): number | null =>
  value === null || value === undefined ? null : Math.round(value * 100) / 100;

interface VariationSeed {
  serial: number;
  voNumber: string | null;
  aconexDate: string | null;
  dvoReference: string | null;
  subject: string | null;
  submissionDate: string | null;
  submissionType: string | null;
  submissionRef: string | null;
  responseRef: string | null;
  proposalValue: number | null;
  clientAssessment: number | null;
  agreedValue: number | null;
  status: string | null;
  vorRef: string | null;
  dvoRef: string | null;
  contractorRemarks: string | null;
  clientRemarks: string | null;
  aconexLink: string | null;
  submissionLink: string | null;
  owner: string | null;
}

interface PaymentSeed {
  ref: string;
  period: string | null;
  grossCertified: number | null;
  advanceRecovery: number | null;
  backCharge: number | null;
  retention: number | null;
  vatOnAdvanceRecovery: number | null;
  vat: number | null;
  netCertified: number | null;
  received: number | null;
  submittedDate: string | null;
  taxInvoiceDate: string | null;
  dueDate: string | null;
  paymentNote: string | null;
  status: string | null;
  collectedDate: string | null;
  contractorAction: string | null;
  clientAction: string | null;
  cumulativeGross: number | null;
}

/** "Done by: finished" is a workflow marker in the source sheet, not a person. */
function cleanOwner(owner: string | null): string | null {
  if (!owner) return null;
  return owner.toLowerCase() === 'finished' ? null : owner;
}

export function buildVariationRows() {
  return (variationSeed as VariationSeed[]).map((row) => ({
    id: `vo-${String(row.serial).padStart(3, '0')}`,
    projectId: PROJECT_ID,
    serial: row.serial,
    voNumber: row.voNumber,
    aconexDate: row.aconexDate,
    dvoReference: row.dvoReference,
    subject: row.subject ?? 'Untitled variation',
    submissionDate: row.submissionDate,
    submissionType: normaliseSubmissionType(row.submissionType),
    submissionRef: row.submissionRef,
    responseRef: row.responseRef,
    proposalValue: nullableRound(row.proposalValue),
    clientAssessment: nullableRound(row.clientAssessment),
    agreedValue: nullableRound(row.agreedValue),
    status: normaliseVariationStatus(row.status),
    vorRef: row.vorRef,
    dvoRef: row.dvoRef,
    contractorRemarks: row.contractorRemarks,
    clientRemarks: row.clientRemarks,
    aconexLink: row.aconexLink,
    submissionLink: row.submissionLink,
    owner: cleanOwner(row.owner),
    updatedAt: new Date().toISOString(),
  }));
}

export function buildPaymentRows() {
  return (paymentSeed as PaymentSeed[]).map((row, index) => {
    const kind: PaymentKind = /^ap/i.test(row.ref) ? 'advance' : 'interim';
    const { start, end } = parsePeriod(row.period);
    return {
      id: `pay-${String(index + 1).padStart(3, '0')}`,
      projectId: PROJECT_ID,
      sequence: index + 1,
      ref: row.ref,
      kind,
      period: row.period,
      periodStart: start,
      periodEnd: end,
      grossCertified: round2(row.grossCertified),
      advanceRecovery: round2(row.advanceRecovery),
      backCharge: round2(row.backCharge),
      retention: round2(row.retention),
      vatOnAdvanceRecovery: round2(row.vatOnAdvanceRecovery),
      vat: round2(row.vat),
      netCertified: round2(row.netCertified),
      received: nullableRound(row.received),
      submittedDate: row.submittedDate,
      taxInvoiceDate: row.taxInvoiceDate,
      dueDate: row.dueDate,
      paymentNote: row.paymentNote,
      status: normalisePaymentStatus(row.status) ?? 'draft',
      collectedDate: row.collectedDate,
      contractorAction: row.contractorAction,
      clientAction: row.clientAction,
      cumulativeGross: nullableRound(row.cumulativeGross),
      updatedAt: new Date().toISOString(),
    };
  });
}

export function buildProjectRow() {
  return {
    id: PROJECT_ID,
    code: projectSeed.code,
    name: projectSeed.name,
    contractor: projectSeed.contractor,
    client: projectSeed.client,
    contractDate: projectSeed.contractDate,
    currency: projectSeed.currency,
    originalContractValue: round2(projectSeed.originalContractValue),
    revisedContractValue: round2(projectSeed.revisedContractValue),
    advancePaymentTotal: round2(projectSeed.advancePaymentTotal),
    advancePaymentPercent: projectSeed.advancePaymentPercent,
    retentionCapPercent: projectSeed.retentionCapPercent,
    vatRate: projectSeed.vatRate,
    dataAsOf: projectSeed.dataAsOf,
    sourceWorkbook: projectSeed.sourceWorkbook,
    updatedAt: new Date().toISOString(),
  };
}

/** Replaces the register with the checked-in workbook extract. */
export async function seed({ reset = true }: { reset?: boolean } = {}): Promise<{
  variations: number;
  payments: number;
}> {
  await migrate();

  if (reset) {
    await client.batch(
      [
        'DELETE FROM variations',
        'DELETE FROM payments',
        'DELETE FROM projects',
      ],
      'write',
    );
  }

  const projectRow = buildProjectRow();
  const variationRows = buildVariationRows();
  const paymentRows = buildPaymentRows();

  await db.insert(projects).values(projectRow);
  // libSQL caps parameters per statement; chunk to stay well inside it.
  for (let i = 0; i < variationRows.length; i += 25) {
    await db.insert(variations).values(variationRows.slice(i, i + 25));
  }
  for (let i = 0; i < paymentRows.length; i += 25) {
    await db.insert(payments).values(paymentRows.slice(i, i + 25));
  }

  await db.insert(activity).values({
    id: `act-seed-${Date.now()}`,
    entity: 'system',
    entityId: null,
    entityLabel: projectSeed.code,
    action: 'imported',
    summary: `Register loaded from ${projectSeed.sourceWorkbook}`,
    detail: `${variationRows.length} variations · ${paymentRows.length} payment certificates`,
    actor: 'System',
    at: new Date().toISOString(),
  });

  return { variations: variationRows.length, payments: paymentRows.length };
}

/**
 * Called by every read path. Creates the schema and loads the workbook extract
 * the first time the app touches an empty database, so a fresh checkout or a
 * newly provisioned Turso instance comes up already populated.
 */
export async function ensureReady(): Promise<void> {
  if (globalThis.__registerReady) return globalThis.__registerReady;

  globalThis.__registerReady = (async () => {
    await migrate();
    const existing = await client.execute('SELECT COUNT(*) AS n FROM projects');
    const count = Number(existing.rows[0]?.n ?? 0);
    if (count === 0) await seed({ reset: false });
  })().catch((error) => {
    globalThis.__registerReady = undefined;
    throw error;
  });

  return globalThis.__registerReady;
}
