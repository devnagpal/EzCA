// ─── Legacy Supabase Client (Build-safe, Lazy) ───────────────────────────
// This file is imported by:
//   - src/lib/copilot/persistence.ts
//   - src/lib/copilot/ragRetriever.ts
//   - src/app/api/copilot/chat/route.ts
//
// Build-safety: The Supabase client is lazily initialized via a Proxy.
// No createClient() call happens at module load / import time.
// The real client is only created on first property access (at runtime).

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from './env';

export { isSupabaseConfigured };
export const isSupabaseReady = isSupabaseConfigured;

// ─── Lazy singleton ────────────────────────────────────────────────────────

let _instance: SupabaseClient | null = null;

function getInstance(): SupabaseClient {
    if (!_instance) {
        if (isSupabaseConfigured()) {
            _instance = createClient(env.supabaseUrl, env.supabaseAnonKey);
        } else {
            // Placeholder client — used only during build/prerender.
            // All callers check isSupabaseConfigured() before performing real queries.
            _instance = createClient(
                'https://placeholder.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder'
            );
        }
    }
    return _instance;
}

/**
 * Lazy Supabase client Proxy.
 * Backward-compatible named export — `supabase.from(...)` etc. continue to work.
 * The underlying SupabaseClient is only instantiated on first property access.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
    get(_target, prop: string | symbol) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (getInstance() as any)[prop];
    },
    set(_target, prop: string | symbol, value: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (getInstance() as any)[prop] = value;
        return true;
    },
});

// ─── Database Schema Interfaces ──────────────────────────────────────────

export interface DBConversation {
    id: string; // uuid
    title: string;
    pinned: boolean;
    subject_slug: string | null;
    created_at: string;
    updated_at: string;
}

export interface DBMessage {
    id: string; // uuid
    conversation_id: string; // fk
    role: 'user' | 'assistant' | 'system';
    content: string;
    intent: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tool_result: any | null; // jsonb
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sources: any | null; // jsonb
    created_at: string;
}

export interface DBDocumentChunk {
    id: string;              // uuid
    resource_id: string;     // e.g., 'laws-chapter1'
    subject_slug: string;    // e.g., 'laws'
    type: 'pdf' | 'audio';
    title: string;
    chapter: string | null;
    chunk_index: number;
    content: string;
    page_range: string | null;
    file_name: string;
    metadata: Record<string, unknown>;
    embedding: number[];     // vector(384) for all-MiniLM-L6-v2
    created_at: string;
}
