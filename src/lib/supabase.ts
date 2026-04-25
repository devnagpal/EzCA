import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
// Ensure these environment variables are set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export interface DBDocument {
    id: string; // uuid
    resource_id: string; // e.g., 'laws-irf-pdf'
    title: string;
    chapter: string;
    content: string;
}

export interface DBDocumentEmbedding {
    id: string; // uuid
    document_id: string; // fk
    embedding: number[]; // vector(1536)
}
