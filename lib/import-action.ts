'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { client, db } from '@/lib/db/client';
import {
  activity,
  payments as paymentsTable,
  projects as projectsTable,
  variations as variationsTable,
} from '@/lib/db/schema';
import { PROJECT_ID, ensureReady } from '@/lib/db/seed';
import { readWorkbook } from '@/lib/excel/import';

export interface ImportOutcome {
  ok: boolean;
  message: string;
  warnings?: string[];
  counts?: { variations: number; payments: number };
}

const MAX_BYTES = 15 * 1024 * 1024;

/**
 * Re-imports the source workbook, replacing the register with its contents.
 *
 * This is a full replace rather than a merge: the workbook is the system of
 * record for the commercial team, so a partial merge would leave rows behind
 * that were deliberately deleted upstream.
 */
export async function importWorkbook(formData: FormData): Promise<ImportOutcome> {
  await ensureReady();

  const file = formData.get('workbook');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Choose an .xlsx workbook to import.' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: 'That file is larger than 15 MB.' };
  }
  if (!/\.xlsx?$/i.test(file.name)) {
    return { ok: false, message: 'Only .xlsx workbooks can be imported.' };
  }

  let parsed;
  try {
    parsed = await readWorkbook(await file.arrayBuffer());
  } catch (error) {
    return {
      ok: false,
      message: `That workbook could not be read: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    };
  }

  if (parsed.variations.length === 0 && parsed.payments.length === 0) {
    return {
      ok: false,
      message: 'Neither a VO log nor a payment register could be located in that workbook.',
      warnings: parsed.warnings,
    };
  }

  const now = new Date().toISOString();

  if (parsed.variations.length > 0) {
    await client.execute('DELETE FROM variations');
    const rows = parsed.variations.map((variation) => ({
      ...variation,
      id: `vo-${String(variation.serial).padStart(3, '0')}`,
      projectId: PROJECT_ID,
      updatedAt: now,
    }));
    for (let i = 0; i < rows.length; i += 25) {
      await db.insert(variationsTable).values(rows.slice(i, i + 25));
    }
  }

  if (parsed.payments.length > 0) {
    await client.execute('DELETE FROM payments');
    const rows = parsed.payments.map((payment) => ({
      ...payment,
      id: `pay-${String(payment.sequence).padStart(3, '0')}`,
      projectId: PROJECT_ID,
      status: payment.status ?? 'draft',
      cumulativeGross: null,
      updatedAt: now,
    }));
    for (let i = 0; i < rows.length; i += 25) {
      await db.insert(paymentsTable).values(rows.slice(i, i + 25));
    }
  }

  // Contract particulars from the register header, when the workbook carries them.
  const header = parsed.project;
  const patch: Record<string, unknown> = { updatedAt: now, sourceWorkbook: file.name };
  if (header.code) patch.code = header.code;
  if (header.contractor) patch.contractor = header.contractor;
  if (header.contractDate) patch.contractDate = header.contractDate;
  if (header.originalContractValue) patch.originalContractValue = header.originalContractValue;
  if (header.revisedContractValue) patch.revisedContractValue = header.revisedContractValue;
  if (header.advancePaymentTotal) patch.advancePaymentTotal = header.advancePaymentTotal;
  patch.dataAsOf = now.slice(0, 10);

  await db.update(projectsTable).set(patch).where(eq(projectsTable.id, PROJECT_ID));

  await db.insert(activity).values({
    id: `act-${Date.now().toString(36)}`,
    entity: 'system',
    entityId: null,
    entityLabel: file.name,
    action: 'imported',
    summary: `Register re-imported from ${file.name}`,
    detail: `${parsed.variations.length} variations · ${parsed.payments.length} certificates`,
    actor: 'Commercial team',
    at: now,
  });

  for (const path of [
    '/',
    '/variations',
    '/variations/board',
    '/payments',
    '/cashflow',
    '/analytics',
    '/activity',
    '/data',
  ]) {
    revalidatePath(path);
  }

  return {
    ok: true,
    message: `Imported ${parsed.variations.length} variations and ${parsed.payments.length} certificates from ${file.name}.`,
    warnings: parsed.warnings,
    counts: { variations: parsed.variations.length, payments: parsed.payments.length },
  };
}

