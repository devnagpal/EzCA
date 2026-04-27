import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Supabase Client (Resilient Initialization) ──────────────────────
// Creates a real client if valid credentials exist,
// otherwise creates a null-safe stub that won't crash the build.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

const isConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 10;

// Export a real client or a safe placeholder
export const supabase: SupabaseClient = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key-for-build');

export const isSupabaseReady = isConfigured;

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
    tool_result: any | null; // jsonb
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
