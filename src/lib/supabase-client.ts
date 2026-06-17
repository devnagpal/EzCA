// ─── Browser-Side Supabase Client (SSR-safe, Build-safe) ─────────────────
// Use this client in Client Components ("use client").
// Uses @supabase/ssr to keep cookies in sync with the server session.
//
// Build-safety: createBrowserClient is never called at module load time.
// The getBrowserClient() factory is only invoked at runtime (in useEffect,
// event handlers, or component render — never during SSG/prerender).

import { createBrowserClient } from '@supabase/ssr';
import { env, isSupabaseConfigured } from './env';

// No module-level client instantiation — factory only
export function createClient() {
    if (!isSupabaseConfigured()) {
        // Return null during build or when env vars are missing.
        // Callers (all marked "use client") guard with isAuthenticated checks.
        return null;
    }
    return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}

// Singleton for client components — lazily created, never at module scope
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
    if (!_client) {
        if (!isSupabaseConfigured()) {
            // During build, return a minimal stub — never called in real browsers
            // because all auth-gated components check isAuthenticated first.
            return createBrowserClient(
                'https://placeholder.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder'
            );
        }
        _client = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
    }
    return _client;
}
