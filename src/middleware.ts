// ─── Next.js Middleware ────────────────────────────────────────────────────
// Runs on every request. Two responsibilities:
//   1. Refresh the Supabase auth session (keeps JWT fresh via cookie rotation)
//   2. Protect /dashboard/* and /profile/* — redirect to login if not authed
//
// Public routes (/  /subjects/*  /about  /contact  /privacy  /auth/*) are
// always accessible without auth.
//
// Build-safety: If Supabase env vars are missing (e.g., during prerender),
// the middleware passes through immediately without attempting auth.

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env, isSupabaseConfigured } from '@/lib/env';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/profile'];

// Routes that redirect authenticated users away (auth pages)
const AUTH_PAGES = ['/auth/login', '/auth/signup'];

export async function middleware(request: NextRequest) {
    // ── Build-safety guard ─────────────────────────────────────────────────
    // During static prerendering or when Supabase isn't configured,
    // pass through without attempting auth (avoids crashing /_not-found etc.)
    if (!isSupabaseConfigured()) {
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        env.supabaseUrl,
        env.supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // !! IMPORTANT: Do not add logic between createServerClient and getUser().
    // A simple mistake could make it very hard to debug session issues.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Redirect unauthenticated users away from protected routes
    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        pathname.startsWith(prefix)
    );

    if (isProtected && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages to dashboard
    const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
    if (isAuthPage && user) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/dashboard';
        dashboardUrl.searchParams.delete('redirectTo');
        return NextResponse.redirect(dashboardUrl);
    }

    // IMPORTANT: Return supabaseResponse so session cookies are forwarded
    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico, sitemap.xml, robots.txt
         * - /api/copilot/* (handled separately by API auth)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
