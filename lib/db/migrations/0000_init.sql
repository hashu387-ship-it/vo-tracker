-- 2026 Enterprise Commercial Register — initial schema (Supabase Postgres + pgvector)
-- Matches lib/db/schema.ts. Apply via drizzle-kit push or psql.

create extension if not exists vector;

do $$ begin
  create type vo_status as enum ('draft','submitted','under_review_rsg','under_review_rsg_ffc','under_review_ffc','approved_pending_dvo','dvo_issued','dvo_rr_issued','not_eligible','rejected','certified');
exception when duplicate_object then null; end $$;
do $$ begin
  create type payment_state as enum ('draft','under_review','submitted','approved','received');
exception when duplicate_object then null; end $$;
do $$ begin
  create type document_kind as enum ('site_instruction','rfi','fidic_clause','drawing','correspondence','other');
exception when duplicate_object then null; end $$;
do $$ begin
  create type audit_action as enum ('create','update','status_change','approve','certify','delete','ai_extract','import');
exception when duplicate_object then null; end $$;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  client text not null default 'Red Sea Global (RSG)',
  contractor text not null default 'First Fix (FFC)',
  original_contract numeric(18,2),
  revised_contract numeric(18,2),
  color_accent text not null default '#9E875D',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists projects_code_idx on projects (code);

create table if not exists variation_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  sno integer,
  vo_number text,
  subject text not null,
  type text not null default 'VO',
  status vo_status not null default 'submitted',
  cost_proposal numeric(18,2),
  rsg_assessment numeric(18,2),
  value numeric(18,2),
  date_in timestamptz,
  submission_date timestamptz,
  submission_ref text,
  response_ref text,
  vor text,
  dvo_ref text,
  ffc_remarks text,
  rsg_remarks text,
  assigned_to text,
  ifc_element_id text,
  source_document_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vo_project_idx on variation_orders (project_id);
create index if not exists vo_status_idx on variation_orders (status);

create table if not exists payment_applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  no text not null,
  description text,
  gross numeric(18,2),
  advance_recovery numeric(18,2),
  retention numeric(18,2),
  vat_recovery numeric(18,2),
  vat numeric(18,2),
  net numeric(18,2),
  received numeric(18,2),
  cumulative numeric(18,2),
  state payment_state not null default 'draft',
  submitted_date timestamptz,
  invoice_date timestamptz,
  due_date timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists ipa_project_idx on payment_applications (project_id);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  kind document_kind not null default 'other',
  storage_url text,
  extracted_scope text,
  extracted_timeline text,
  extracted_cost numeric(18,2),
  extraction_model text,
  created_by text,
  created_at timestamptz not null default now()
);
create index if not exists doc_project_idx on documents (project_id);

create table if not exists document_embeddings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  chunk_index integer not null default 0,
  content text not null,
  embedding vector(1536) not null
);
create index if not exists doc_embedding_hnsw_idx on document_embeddings using hnsw (embedding vector_cosine_ops);
create index if not exists emb_project_idx on document_embeddings (project_id);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  entity_type text not null,
  entity_id text not null,
  action audit_action not null,
  from_status text,
  to_status text,
  actor_id text,
  actor_name text,
  metadata jsonb,
  prev_hash text,
  hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists audit_entity_idx on audit_log (entity_type, entity_id);
create index if not exists audit_created_idx on audit_log (created_at);
