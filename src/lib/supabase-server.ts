// ─── Server-Side Supabase Client (SSR) ────────────────────────────────────
// Use this in Server Components, Server Actions, and API Routes.
// Reads the session from the request cookies set by middleware.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
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
        }
    );
}

// Helper: get current session user on the server
export async function getServerUser() {
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

// Helper: get current session on the server
export async function getServerSession() {
    const supabase = await createServerSupabaseClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return session;
}
