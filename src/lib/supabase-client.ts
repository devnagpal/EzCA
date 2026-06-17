// ─── Browser-Side Supabase Client (SSR-safe) ─────────────────────────────
// Use this client in Client Components ("use client").
// Uses @supabase/ssr to keep cookies in sync with the server session.

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Singleton for client components
let _client: ReturnType<typeof createClient> | null = null;

export function getBrowserClient() {
    if (!_client) {
        _client = createClient();
    }
    return _client;
}
