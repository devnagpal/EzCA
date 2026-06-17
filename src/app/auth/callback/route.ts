// ─── OAuth Callback Route ──────────────────────────────────────────────────
// Handles the OAuth redirect from Google (and any other providers).
// Exchanges the authorization code for a Supabase session, then redirects.

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors (e.g., user denied access)
    if (error) {
        console.error("OAuth error:", error, errorDescription);
        return NextResponse.redirect(
            `${origin}/auth/login?error=${encodeURIComponent(errorDescription ?? error)}`
        );
    }

    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // Redirect to intended destination after successful auth
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

    // Fallback — something went wrong
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
