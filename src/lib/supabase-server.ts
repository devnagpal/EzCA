// ─── Server-Side Supabase Client (SSR, Build-safe) ───────────────────────
// Use this in Server Components, Server Actions, and API Routes.
// Reads the session from the request cookies set by middleware.
//
// Build-safety: createServerClient is never called at module load time.
// These are async factory functions invoked only at request time.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env, isSupabaseConfigured } from './env';

export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    // If Supabase isn't configured (e.g., during build), return a safe stub.
    // Server components that call this should handle null/empty sessions.
    const url = isSupabaseConfigured() ? env.supabaseUrl : 'https://placeholder.supabase.co';
    const key = isSupabaseConfigured()
        ? env.supabaseAnonKey
        : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder';

    return createServerClient(url, key, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing sessions.
                }
            },
        },
    });
}

// Helper: get current session user on the server (returns null if unconfigured)
export async function getServerUser() {
    if (!isSupabaseConfigured()) return null;
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

// Helper: get current session on the server (returns null if unconfigured)
export async function getServerSession() {
    if (!isSupabaseConfigured()) return null;
    const supabase = await createServerSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return session;
}
