import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Schema for the commercial register.
 *
 * SQLite/libSQL is used so the app runs with zero configuration on a laptop and
 * against a hosted Turso database in production — same driver, same SQL.
 * Money is stored as REAL and rounded to 2dp at every write; the largest value
 * in play (SAR 233m) is far inside the exact-integer range of a double when
 * scaled by 100, so no precision is lost.
 */

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  contractor: text('contractor').notNull(),
  client: text('client').notNull(),
  contractDate: text('contract_date'),
  currency: text('currency').notNull().default('SAR'),
  originalContractValue: real('original_contract_value').notNull().default(0),
  revisedContractValue: real('revised_contract_value').notNull().default(0),
  advancePaymentTotal: real('advance_payment_total').notNull().default(0),
  advancePaymentPercent: real('advance_payment_percent').notNull().default(0.3),
  retentionCapPercent: real('retention_cap_percent').notNull().default(0.05),
  vatRate: real('vat_rate').notNull().default(0.15),
  dataAsOf: text('data_as_of'),
  sourceWorkbook: text('source_workbook'),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const variations = sqliteTable(
  'variations',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    serial: integer('serial').notNull(),
    voNumber: text('vo_number'),
    aconexDate: text('aconex_date'),
    dvoReference: text('dvo_reference'),
    subject: text('subject').notNull(),
    submissionDate: text('submission_date'),
    submissionType: text('submission_type'),
    submissionRef: text('submission_ref'),
    responseRef: text('response_ref'),
    proposalValue: real('proposal_value'),
    clientAssessment: real('client_assessment'),
    agreedValue: real('agreed_value'),
    status: text('status'),
    vorRef: text('vor_ref'),
    dvoRef: text('dvo_ref'),
    contractorRemarks: text('contractor_remarks'),
    clientRemarks: text('client_remarks'),
    aconexLink: text('aconex_link'),
    submissionLink: text('submission_link'),
    owner: text('owner'),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => ({
    statusIdx: index('variations_status_idx').on(table.status),
    serialIdx: index('variations_serial_idx').on(table.serial),
    voNumberIdx: index('variations_vo_number_idx').on(table.voNumber),
  }),
);

export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    sequence: integer('sequence').notNull(),
    ref: text('ref').notNull(),
    kind: text('kind').notNull().default('interim'),
    period: text('period'),
    periodStart: text('period_start'),
    periodEnd: text('period_end'),
    grossCertified: real('gross_certified').notNull().default(0),
    advanceRecovery: real('advance_recovery').notNull().default(0),
    backCharge: real('back_charge').notNull().default(0),
    retention: real('retention').notNull().default(0),
    vatOnAdvanceRecovery: real('vat_on_advance_recovery').notNull().default(0),
    vat: real('vat').notNull().default(0),
    netCertified: real('net_certified').notNull().default(0),
    received: real('received'),
    submittedDate: text('submitted_date'),
    taxInvoiceDate: text('tax_invoice_date'),
    dueDate: text('due_date'),
    paymentNote: text('payment_note'),
    status: text('status').notNull().default('draft'),
    collectedDate: text('collected_date'),
    contractorAction: text('contractor_action'),
    clientAction: text('client_action'),
    cumulativeGross: real('cumulative_gross'),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => ({
    sequenceIdx: index('payments_sequence_idx').on(table.sequence),
    statusIdx: index('payments_status_idx').on(table.status),
  }),
);

export const activity = sqliteTable(
  'activity',
  {
    id: text('id').primaryKey(),
    entity: text('entity').notNull(),
    entityId: text('entity_id'),
    entityLabel: text('entity_label'),
    action: text('action').notNull(),
    summary: text('summary').notNull(),
    detail: text('detail'),
    actor: text('actor').notNull().default('Commercial team'),
    at: text('at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => ({
    atIdx: index('activity_at_idx').on(table.at),
  }),
);

export type ProjectRow = typeof projects.$inferSelect;
export type VariationRow = typeof variations.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type ActivityRow = typeof activity.$inferSelect;
