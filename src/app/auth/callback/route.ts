// ─── OAuth & Email Callback Route ─────────────────────────────────────────
// Handles two cases:
//   1. OAuth redirect from Google (authorization code exchange)
//   2. Email confirmation / magic link (handled by Supabase JS on the client
//      via hash fragment — this route just redirects to /auth/reset-password
//      for password-reset emails, and to `next` for confirmations)
//
// The `next` query param controls where to redirect after successful auth.

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // ── Handle OAuth provider errors (e.g., user denied access) ──────────
    if (error) {
        console.error("OAuth error:", error, errorDescription);
        return NextResponse.redirect(
            `${origin}/auth/login?error=${encodeURIComponent(errorDescription ?? error)}`
        );
    }

    // ── Exchange authorization code for session ────────────────────────
    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            env.supabaseUrl,
            env.supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!exchangeError) {
            // Use x-forwarded-host in production (Vercel sets this correctly)
            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        } else {
            console.error("Session exchange error:", exchangeError);
        }
    }

    // ── Fallback — something went wrong ───────────────────────────────
    return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`
    );
}
