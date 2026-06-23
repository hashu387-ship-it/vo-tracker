/**
 * Drizzle schema — 2026 Enterprise Commercial Register
 * PostgreSQL (Supabase) with pgvector. Multi-project architecture, AI document
 * embeddings (1536-dim / OpenAI text-embedding-3-small), and an immutable,
 * cryptographically hash-chained audit log.
 *
 * Apply with: `npx drizzle-kit push` (needs DATABASE_URL) and the SQL migration
 * that runs `create extension if not exists vector;` first.
 */
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
  jsonb,
  vector,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ----------------------------- enums ----------------------------- */

export const voStatusEnum = pgEnum('vo_status', [
  'draft',
  'submitted',
  'under_review_rsg',
  'under_review_rsg_ffc',
  'under_review_ffc',
  'approved_pending_dvo',
  'dvo_issued',
  'dvo_rr_issued',
  'not_eligible',
  'rejected',
  'certified',
]);

export const paymentStateEnum = pgEnum('payment_state', [
  'draft',
  'under_review',
  'submitted',
  'approved',
  'received',
]);

export const documentKindEnum = pgEnum('document_kind', [
  'site_instruction',
  'rfi',
  'fidic_clause',
  'drawing',
  'correspondence',
  'other',
]);

export const auditActionEnum = pgEnum('audit_action', [
  'create',
  'update',
  'status_change',
  'approve',
  'certify',
  'delete',
  'ai_extract',
  'import',
]);

/* --------------------------- projects ---------------------------- */
// Multi-project enterprise hub: R06-HW2, R05-A09C07, R05-A09C08, L09-S01C07, P09

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    client: text('client').default('Red Sea Global (RSG)').notNull(),
    contractor: text('contractor').default('First Fix (FFC)').notNull(),
    originalContract: numeric('original_contract', { precision: 18, scale: 2 }),
    revisedContract: numeric('revised_contract', { precision: 18, scale: 2 }),
    colorAccent: text('color_accent').default('#9E875D').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ codeIdx: uniqueIndex('projects_code_idx').on(t.code) }),
);

/* ------------------------ variation orders ----------------------- */

export const variationOrders = pgTable(
  'variation_orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    sno: integer('sno'),
    voNumber: text('vo_number'),
    subject: text('subject').notNull(),
    type: text('type').default('VO').notNull(),
    status: voStatusEnum('status').default('submitted').notNull(),
    costProposal: numeric('cost_proposal', { precision: 18, scale: 2 }),
    rsgAssessment: numeric('rsg_assessment', { precision: 18, scale: 2 }),
    value: numeric('value', { precision: 18, scale: 2 }),
    dateIn: timestamp('date_in', { withTimezone: true }),
    submissionDate: timestamp('submission_date', { withTimezone: true }),
    submissionRef: text('submission_ref'),
    responseRef: text('response_ref'),
    vor: text('vor'),
    dvoRef: text('dvo_ref'),
    ffcRemarks: text('ffc_remarks'),
    rsgRemarks: text('rsg_remarks'),
    assignedTo: text('assigned_to'),
    /** Optional BIM/IFC element linkage (GlobalId / express id) */
    ifcElementId: text('ifc_element_id'),
    /** Document that generated this VO via AI parsing */
    sourceDocumentId: uuid('source_document_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    projectIdx: index('vo_project_idx').on(t.projectId),
    statusIdx: index('vo_status_idx').on(t.status),
  }),
);

/* ---------------------- payment applications --------------------- */

export const paymentApplications = pgTable(
  'payment_applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    no: text('no').notNull(),
    description: text('description'),
    gross: numeric('gross', { precision: 18, scale: 2 }),
    advanceRecovery: numeric('advance_recovery', { precision: 18, scale: 2 }),
    retention: numeric('retention', { precision: 18, scale: 2 }),
    vatRecovery: numeric('vat_recovery', { precision: 18, scale: 2 }),
    vat: numeric('vat', { precision: 18, scale: 2 }),
    net: numeric('net', { precision: 18, scale: 2 }),
    received: numeric('received', { precision: 18, scale: 2 }),
    cumulative: numeric('cumulative', { precision: 18, scale: 2 }),
    state: paymentStateEnum('state').default('draft').notNull(),
    submittedDate: timestamp('submitted_date', { withTimezone: true }),
    invoiceDate: timestamp('invoice_date', { withTimezone: true }),
    dueDate: timestamp('due_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ projectIdx: index('ipa_project_idx').on(t.projectId) }),
);

/* ------------------------- documents + RAG ----------------------- */

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    kind: documentKindEnum('kind').default('other').notNull(),
    storageUrl: text('storage_url'),
    /** AI-extracted fields (Vision/NLP) used to seed Draft VO cards */
    extractedScope: text('extracted_scope'),
    extractedTimeline: text('extracted_timeline'),
    extractedCost: numeric('extracted_cost', { precision: 18, scale: 2 }),
    extractionModel: text('extraction_model'),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ projectIdx: index('doc_project_idx').on(t.projectId) }),
);

/** Vector store for Retrieval-Augmented "Chat with Project" (pgvector). */
export const documentEmbeddings = pgTable(
  'document_embeddings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').default(0).notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  },
  (t) => ({
    // HNSW cosine index for fast nearest-neighbour retrieval
    embeddingIdx: index('doc_embedding_hnsw_idx').using(
      'hnsw',
      t.embedding.op('vector_cosine_ops'),
    ),
    projectIdx: index('emb_project_idx').on(t.projectId),
  }),
);

/* --------------------- immutable audit log ----------------------- */
// Cryptographic, append-only hash chain. `hash = sha256(prevHash + payload)`.
// See lib/db/audit.ts for the hashing helper used by server actions.

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    action: auditActionEnum('action').notNull(),
    fromStatus: text('from_status'),
    toStatus: text('to_status'),
    actorId: text('actor_id'),
    actorName: text('actor_name'),
    metadata: jsonb('metadata'),
    /** previous entry's hash (chain link) */
    prevHash: text('prev_hash'),
    /** sha256 of (prevHash + canonical payload) — tamper-evident */
    hash: text('hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    entityIdx: index('audit_entity_idx').on(t.entityType, t.entityId),
    createdIdx: index('audit_created_idx').on(t.createdAt),
  }),
);

/* ---------------------------- relations -------------------------- */

export const projectsRelations = relations(projects, ({ many }) => ({
  variationOrders: many(variationOrders),
  paymentApplications: many(paymentApplications),
  documents: many(documents),
}));

export const variationOrdersRelations = relations(variationOrders, ({ one }) => ({
  project: one(projects, { fields: [variationOrders.projectId], references: [projects.id] }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  project: one(projects, { fields: [documents.projectId], references: [projects.id] }),
  embeddings: many(documentEmbeddings),
}));

export const documentEmbeddingsRelations = relations(documentEmbeddings, ({ one }) => ({
  document: one(documents, {
    fields: [documentEmbeddings.documentId],
    references: [documents.id],
  }),
}));

/* ------------------------- inferred types ------------------------ */

export type Project = typeof projects.$inferSelect;
export type VariationOrderRow = typeof variationOrders.$inferSelect;
export type PaymentApplicationRow = typeof paymentApplications.$inferSelect;
export type DocumentRow = typeof documents.$inferSelect;
export type AuditLogRow = typeof auditLog.$inferSelect;
