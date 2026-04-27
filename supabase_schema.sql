-- ═══════════════════════════════════════════════════════════════════════
-- EzCA AI Copilot — Complete Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Enable pgvector extension
create extension if not exists vector;

-- ═══════════════════════════════════════════════════════════════════════
-- 2. Conversations & Messages (Chat History)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists conversations (
    id uuid primary key default gen_random_uuid(),
    title text not null default 'New Chat',
    pinned boolean not null default false,
    subject_slug text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists messages (
    id text primary key,
    conversation_id uuid not null references conversations(id) on delete cascade,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null default '',
    intent text,
    tool_result jsonb,
    sources jsonb,
    created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on messages(conversation_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 3. Document Chunks (RAG Knowledge Base)
--    Using vector(384) for all-MiniLM-L6-v2 local embeddings.
--    Change to vector(1536) if you swap to OpenAI text-embedding-3-small.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists document_chunks (
    id uuid primary key default gen_random_uuid(),
    resource_id text not null,
    subject_slug text not null,
    type text not null default 'pdf' check (type in ('pdf', 'audio')),
    title text not null,
    chapter text,
    chunk_index integer not null,
    content text not null,
    page_range text,
    file_name text not null,
    metadata jsonb not null default '{}'::jsonb,
    embedding vector(384) not null,
    created_at timestamptz not null default now()
);

-- Indexes for filtering
create index if not exists document_chunks_subject_idx on document_chunks(subject_slug);
create index if not exists document_chunks_resource_idx on document_chunks(resource_id);
create index if not exists document_chunks_type_idx on document_chunks(type);

-- IVFFlat index for fast approximate nearest-neighbor search.
-- NOTE: Only create this AFTER inserting data (needs rows to build lists).
-- Run this separately after your first ingestion:
--
--   create index document_chunks_embedding_idx
--       on document_chunks
--       using ivfflat (embedding vector_cosine_ops)
--       with (lists = 100);

-- ═══════════════════════════════════════════════════════════════════════
-- 4. Similarity Search RPC Function
--    Called from the API route to find relevant chunks for a user query.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function match_document_chunks(
    query_embedding vector(384),
    match_threshold float default 0.5,
    match_count int default 5,
    filter_subject text default null,
    filter_resource text default null
)
returns table (
    id uuid,
    resource_id text,
    subject_slug text,
    type text,
    title text,
    chapter text,
    chunk_index integer,
    content text,
    page_range text,
    file_name text,
    metadata jsonb,
    similarity float
)
language plpgsql
as $$
begin
    return query
    select
        dc.id,
        dc.resource_id,
        dc.subject_slug,
        dc.type,
        dc.title,
        dc.chapter,
        dc.chunk_index,
        dc.content,
        dc.page_range,
        dc.file_name,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) as similarity
    from document_chunks dc
    where
        (filter_subject is null or dc.subject_slug = filter_subject)
        and (filter_resource is null or dc.resource_id = filter_resource)
        and 1 - (dc.embedding <=> query_embedding) > match_threshold
    order by dc.embedding <=> query_embedding
    limit match_count;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- 5. Usage Logs (Analytics / Cost Tracking)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists usage_logs (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid references conversations(id) on delete set null,
    intent text,
    model_used text,
    tokens_in integer default 0,
    tokens_out integer default 0,
    latency_ms integer default 0,
    created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 6. Row-Level Security (RLS) — disable for now, enable later with auth
-- ═══════════════════════════════════════════════════════════════════════

alter table conversations enable row level security;
alter table messages enable row level security;
alter table document_chunks enable row level security;
alter table usage_logs enable row level security;

-- Allow all operations via anon key (no auth yet)
create policy "Allow all on conversations" on conversations for all using (true) with check (true);
create policy "Allow all on messages" on messages for all using (true) with check (true);
create policy "Allow all on document_chunks" on document_chunks for all using (true) with check (true);
create policy "Allow all on usage_logs" on usage_logs for all using (true) with check (true);
