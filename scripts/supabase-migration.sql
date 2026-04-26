-- ═══════════════════════════════════════════════════════════════════════
-- EzCA AI Copilot — Supabase Database Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Enable pgvector extension for embedding-based retrieval
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════
-- CONVERSATIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS conversations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL DEFAULT 'New Chat',
    pinned      BOOLEAN NOT NULL DEFAULT false,
    subject_slug TEXT,                          -- e.g. 'laws', 'economics'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast listing sorted by recency
CREATE INDEX IF NOT EXISTS idx_conversations_updated
    ON conversations (updated_at DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- MESSAGES TABLE
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content         TEXT NOT NULL DEFAULT '',
    intent          TEXT,                       -- 'greeting','question','quiz', etc.
    tool_result     JSONB,                      -- structured quiz/flashcard data
    sources         JSONB,                      -- source citations array
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching messages of a conversation in order
CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages (conversation_id, created_at ASC);

-- ═══════════════════════════════════════════════════════════════════════
-- DOCUMENTS TABLE (for RAG content chunks)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS documents (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id TEXT NOT NULL,                  -- e.g. 'l1', 'e2' from mockResources
    title       TEXT NOT NULL,
    chapter     TEXT NOT NULL,
    content     TEXT NOT NULL,                  -- the chunk text
    subject_slug TEXT,                          -- e.g. 'laws'
    metadata    JSONB DEFAULT '{}',             -- file type, pages, etc.
    embedding   vector(1536),                   -- OpenAI ada-002 or equivalent
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vector similarity search index (IVFFlat for fast approximate search)
CREATE INDEX IF NOT EXISTS idx_documents_embedding
    ON documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 50);

-- Index for filtering by subject
CREATE INDEX IF NOT EXISTS idx_documents_subject
    ON documents (subject_slug);

-- ═══════════════════════════════════════════════════════════════════════
-- USAGE LOGS TABLE (analytics & rate limiting)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS usage_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    intent          TEXT,
    model_used      TEXT,
    tokens_in       INTEGER DEFAULT 0,
    tokens_out      INTEGER DEFAULT 0,
    latency_ms      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- RPC FUNCTION: match_documents (for pgvector similarity search)
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.78,
    match_count int DEFAULT 5,
    filter_subject text DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    resource_id TEXT,
    title TEXT,
    chapter TEXT,
    content TEXT,
    subject_slug TEXT,
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.resource_id,
        d.title,
        d.chapter,
        d.content,
        d.subject_slug,
        d.metadata,
        1 - (d.embedding <=> query_embedding) AS similarity
    FROM documents d
    WHERE
        (filter_subject IS NULL OR d.subject_slug = filter_subject)
        AND 1 - (d.embedding <=> query_embedding) > match_threshold
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- Row-Level Security (optional, enable if using auth)
-- ═══════════════════════════════════════════════════════════════════════
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for anon" ON conversations FOR ALL USING (true);
-- CREATE POLICY "Allow all for anon" ON messages FOR ALL USING (true);

-- ═══════════════════════════════════════════════════════════════════════
-- DONE — Your EzCA Copilot database schema is ready!
-- ═══════════════════════════════════════════════════════════════════════
