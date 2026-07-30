'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db/client';
import {
  activity,
  payments as paymentsTable,
  projects as projectsTable,
  variations as variationsTable,
} from '@/lib/db/schema';
import { PROJECT_ID, ensureReady, seed } from '@/lib/db/seed';
import { parsePeriod } from '@/lib/domain/calc';
import {
  PAYMENT_STATUS_META,
  VARIATION_STATUS_META,
  type PaymentStatus,
  type VariationStatus,
} from '@/lib/domain/types';
import {
  flattenIssues,
  formToObject,
  paymentInputSchema,
  projectInputSchema,
  variationInputSchema,
} from '@/lib/validation';

export interface ActionResult {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  id?: string;
}

const ACTOR = 'Commercial team';

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

async function log(entry: {
  entity: 'variation' | 'payment' | 'project' | 'system';
  entityId?: string | null;
  entityLabel?: string | null;
  action: 'created' | 'updated' | 'deleted' | 'imported' | 'exported';
  summary: string;
  detail?: string | null;
}) {
  await db.insert(activity).values({
    id: newId('act'),
    entity: entry.entity,
    entityId: entry.entityId ?? null,
    entityLabel: entry.entityLabel ?? null,
    action: entry.action,
    summary: entry.summary,
    detail: entry.detail ?? null,
    actor: ACTOR,
    at: new Date().toISOString(),
  });
}

function revalidateAll() {
  for (const path of [
    '/',
    '/dashboard',
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
}

/* ------------------------------------------------------------------ */
/* Variations                                                          */
/* ------------------------------------------------------------------ */

export async function saveVariation(
  id: string | null,
  formData: FormData,
): Promise<ActionResult> {
  await ensureReady();
  const parsed = variationInputSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: 'Check the highlighted fields.', errors: flattenIssues(parsed.error) };
  }

  const input = parsed.data;
  const now = new Date().toISOString();
  const label = input.voNumber ?? input.subject.slice(0, 40);

  if (id) {
    const existing = await db.select().from(variationsTable).where(eq(variationsTable.id, id));
    if (!existing.length) return { ok: false, message: 'That variation no longer exists.' };

    await db.update(variationsTable).set({ ...input, updatedAt: now }).where(eq(variationsTable.id, id));

    const before = existing[0];
    const changes: string[] = [];
    if (before.status !== input.status) {
      const from = before.status ? VARIATION_STATUS_META[before.status as VariationStatus].label : 'no status';
      const to = input.status ? VARIATION_STATUS_META[input.status].label : 'no status';
      changes.push(`status ${from} → ${to}`);
    }
    if (before.agreedValue !== input.agreedValue) {
      changes.push(`agreed value ${before.agreedValue ?? '—'} → ${input.agreedValue ?? '—'}`);
    }
    if (before.clientAssessment !== input.clientAssessment) {
      changes.push(`RSG assessment ${before.clientAssessment ?? '—'} → ${input.clientAssessment ?? '—'}`);
    }

    await log({
      entity: 'variation',
      entityId: id,
      entityLabel: label,
      action: 'updated',
      summary: `${label} updated`,
      detail: changes.length ? changes.join(' · ') : 'Details revised',
    });

    revalidateAll();
    revalidatePath(`/variations/${id}`);
    return { ok: true, message: `${label} saved.`, id };
  }

  const maxSerial = await db
    .select({ value: sql<number>`COALESCE(MAX(${variationsTable.serial}), 0)` })
    .from(variationsTable);
  const serial = Number(maxSerial[0]?.value ?? 0) + 1;
  const newVariationId = newId('vo');

  await db.insert(variationsTable).values({
    ...input,
    id: newVariationId,
    projectId: PROJECT_ID,
    serial,
    updatedAt: now,
  });

  await log({
    entity: 'variation',
    entityId: newVariationId,
    entityLabel: label,
    action: 'created',
    summary: `${label} added to the VO log`,
    detail: input.status ? VARIATION_STATUS_META[input.status].label : null,
  });

  revalidateAll();
  return { ok: true, message: `${label} added.`, id: newVariationId };
}

export async function updateVariationStatus(
  id: string,
  status: VariationStatus,
): Promise<ActionResult> {
  await ensureReady();
  const existing = await db.select().from(variationsTable).where(eq(variationsTable.id, id));
  if (!existing.length) return { ok: false, message: 'That variation no longer exists.' };

  const before = existing[0];
  if (before.status === status) return { ok: true };

  await db
    .update(variationsTable)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(variationsTable.id, id));

  const label = before.voNumber ?? before.subject.slice(0, 40);
  await log({
    entity: 'variation',
    entityId: id,
    entityLabel: label,
    action: 'updated',
    summary: `${label} moved to ${VARIATION_STATUS_META[status].label}`,
    detail: before.status
      ? `from ${VARIATION_STATUS_META[before.status as VariationStatus].label}`
      : null,
  });

  revalidateAll();
  revalidatePath(`/variations/${id}`);
  return { ok: true, message: `Moved to ${VARIATION_STATUS_META[status].label}.` };
}

export async function deleteVariation(id: string): Promise<ActionResult> {
  await ensureReady();
  const existing = await db.select().from(variationsTable).where(eq(variationsTable.id, id));
  if (!existing.length) return { ok: false, message: 'That variation no longer exists.' };

  await db.delete(variationsTable).where(eq(variationsTable.id, id));
  const label = existing[0].voNumber ?? existing[0].subject.slice(0, 40);
  await log({
    entity: 'variation',
    entityId: id,
    entityLabel: label,
    action: 'deleted',
    summary: `${label} removed from the VO log`,
  });

  revalidateAll();
  return { ok: true, message: `${label} deleted.` };
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export async function savePayment(id: string | null, formData: FormData): Promise<ActionResult> {
  await ensureReady();
  const parsed = paymentInputSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: 'Check the highlighted fields.', errors: flattenIssues(parsed.error) };
  }

  const input = parsed.data;
  const { start, end } = parsePeriod(input.period);
  const now = new Date().toISOString();

  // Net certified is derived unless the user overrides it explicitly.
  const derivedNet =
    Math.round(
      (input.grossCertified +
        input.advanceRecovery +
        input.backCharge +
        input.retention +
        input.vatOnAdvanceRecovery +
        input.vat) *
        100,
    ) / 100;
  const netCertified = input.netCertified ?? derivedNet;

  const values = {
    ref: input.ref,
    kind: input.kind,
    period: input.period,
    periodStart: start,
    periodEnd: end,
    grossCertified: input.grossCertified,
    advanceRecovery: input.advanceRecovery,
    backCharge: input.backCharge,
    retention: input.retention,
    vatOnAdvanceRecovery: input.vatOnAdvanceRecovery,
    vat: input.vat,
    netCertified,
    received: input.received,
    submittedDate: input.submittedDate,
    taxInvoiceDate: input.taxInvoiceDate,
    dueDate: input.dueDate,
    paymentNote: input.paymentNote,
    status: input.status,
    collectedDate: input.collectedDate,
    contractorAction: input.contractorAction,
    clientAction: input.clientAction,
    updatedAt: now,
  };

  if (id) {
    const existing = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id));
    if (!existing.length) return { ok: false, message: 'That certificate no longer exists.' };

    await db.update(paymentsTable).set(values).where(eq(paymentsTable.id, id));

    const before = existing[0];
    const changes: string[] = [];
    if (before.status !== input.status) {
      changes.push(
        `status ${PAYMENT_STATUS_META[before.status as PaymentStatus].label} → ${PAYMENT_STATUS_META[input.status].label}`,
      );
    }
    if (before.received !== input.received) {
      changes.push(`received ${before.received ?? '—'} → ${input.received ?? '—'}`);
    }

    await log({
      entity: 'payment',
      entityId: id,
      entityLabel: input.ref,
      action: 'updated',
      summary: `${input.ref} updated`,
      detail: changes.length ? changes.join(' · ') : 'Details revised',
    });

    revalidateAll();
    revalidatePath(`/payments/${id}`);
    return { ok: true, message: `${input.ref} saved.`, id };
  }

  const maxSequence = await db
    .select({ value: sql<number>`COALESCE(MAX(${paymentsTable.sequence}), 0)` })
    .from(paymentsTable);
  const sequence = Number(maxSequence[0]?.value ?? 0) + 1;
  const newPaymentId = newId('pay');

  await db.insert(paymentsTable).values({
    ...values,
    id: newPaymentId,
    projectId: PROJECT_ID,
    sequence,
    cumulativeGross: null,
  });

  await log({
    entity: 'payment',
    entityId: newPaymentId,
    entityLabel: input.ref,
    action: 'created',
    summary: `${input.ref} raised`,
    detail: `${PAYMENT_STATUS_META[input.status].label} · gross ${input.grossCertified}`,
  });

  revalidateAll();
  return { ok: true, message: `${input.ref} added.`, id: newPaymentId };
}

export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
): Promise<ActionResult> {
  await ensureReady();
  const existing = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id));
  if (!existing.length) return { ok: false, message: 'That certificate no longer exists.' };

  const before = existing[0];
  const patch: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };

  // Marking a certificate as received settles it in full unless already set.
  if (status === 'received' && (before.received ?? 0) < before.netCertified) {
    patch.received = before.netCertified;
  }

  await db.update(paymentsTable).set(patch).where(eq(paymentsTable.id, id));

  await log({
    entity: 'payment',
    entityId: id,
    entityLabel: before.ref,
    action: 'updated',
    summary: `${before.ref} moved to ${PAYMENT_STATUS_META[status].label}`,
    detail: `from ${PAYMENT_STATUS_META[before.status as PaymentStatus].label}`,
  });

  revalidateAll();
  revalidatePath(`/payments/${id}`);
  return { ok: true, message: `${before.ref} → ${PAYMENT_STATUS_META[status].label}.` };
}

export async function deletePayment(id: string): Promise<ActionResult> {
  await ensureReady();
  const existing = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id));
  if (!existing.length) return { ok: false, message: 'That certificate no longer exists.' };

  await db.delete(paymentsTable).where(eq(paymentsTable.id, id));
  await log({
    entity: 'payment',
    entityId: id,
    entityLabel: existing[0].ref,
    action: 'deleted',
    summary: `${existing[0].ref} removed from the payment register`,
  });

  revalidateAll();
  return { ok: true, message: `${existing[0].ref} deleted.` };
}

/* ------------------------------------------------------------------ */
/* Project & data management                                           */
/* ------------------------------------------------------------------ */

export async function saveProject(formData: FormData): Promise<ActionResult> {
  await ensureReady();
  const parsed = projectInputSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, message: 'Check the highlighted fields.', errors: flattenIssues(parsed.error) };
  }

  await db
    .update(projectsTable)
    .set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(eq(projectsTable.id, PROJECT_ID));

  await log({
    entity: 'project',
    entityId: PROJECT_ID,
    entityLabel: parsed.data.code,
    action: 'updated',
    summary: 'Contract particulars updated',
  });

  revalidateAll();
  return { ok: true, message: 'Contract particulars saved.' };
}

/** Restores the register to the checked-in workbook extract. */
export async function resetToWorkbook(): Promise<ActionResult> {
  const counts = await seed({ reset: true });
  revalidateAll();
  return {
    ok: true,
    message: `Register restored — ${counts.variations} variations, ${counts.payments} certificates.`,
  };
}
