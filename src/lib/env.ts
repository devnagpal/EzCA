// ─── Centralized Environment Configuration ────────────────────────────────
// Single source of truth for all environment variables.
// Build-safe: uses ?? '' so static prerendering never throws.
// Every file should import from here instead of reading process.env directly.

/**
 * Public environment variables (safe to use in both server and client code).
 * Values are empty strings during build-time static generation — never throw.
 */
export const env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        'http://localhost:3000',
} as const;

/**
 * Returns true only when real Supabase credentials are available at runtime.
 * Returns false during build-time prerendering (env vars not injected).
 */
export function isSupabaseConfigured(): boolean {
    if (!env.supabaseUrl || !env.supabaseAnonKey) return false;
    if (env.supabaseAnonKey.length < 20) return false;
    try {
        new URL(env.supabaseUrl);
        return true;
    } catch {
        return false;
    }
}
