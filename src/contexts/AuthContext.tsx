"use client";

// ─── Auth Context ─────────────────────────────────────────────────────────
// Global auth state provider. Wraps the entire app.
// Provides: user, profile, session, isLoading, isAuthenticated,
// signIn, signUp, signOut, signInWithGoogle, updateProfile.

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase-client";

// ─── Profile type (inline to avoid generic issues) ────────────────────────

export interface Profile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    exam_year: number | null;
    preferred_subjects: string[];
    study_goal_hours_per_day: number;
    timezone: string;
    onboarding_complete: boolean;
    created_at: string;
    updated_at: string;
}

// ─── Types ────────────────────────────────────────────────────────────────

interface SignUpData {
    email: string;
    password: string;
    displayName?: string;
}

interface SignInData {
    email: string;
    password: string;
}

interface AuthResult {
    error: AuthError | Error | null;
}

interface AuthContextValue {
    // State
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    signUp: (data: SignUpData) => Promise<AuthResult & { needsEmailConfirmation?: boolean }>;
    signIn: (data: SignInData) => Promise<AuthResult>;
    signInWithGoogle: () => Promise<AuthResult>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<Omit<Profile, 'id' | 'created_at'>>) => Promise<AuthResult>;
    refreshProfile: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const supabase = getBrowserClient();

    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── Load Profile ────────────────────────────────────────────────────

    const loadProfile = useCallback(async (userId: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sb = supabase as any;
        const { data } = await sb
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
        setProfile((data as Profile | null) ?? null);
    }, [supabase]);

    const refreshProfile = useCallback(async () => {
        if (user) await loadProfile(user.id);
    }, [user, loadProfile]);

    // ── Session bootstrap ────────────────────────────────────────────────

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id).finally(() => setIsLoading(false));
            } else {
                setIsLoading(false);
            }
        });

        // Subscribe to auth changes (sign in, sign out, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await loadProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase, loadProfile]);

    // ── Auth Actions ─────────────────────────────────────────────────────

    const signUp = useCallback(async ({ email, password, displayName }: SignUpData) => {
        const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: displayName ?? email.split("@")[0],
                },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
            },
        });

        // If email confirmation is required, data.user exists but session is null
        const needsEmailConfirmation: boolean | undefined =
            (!error && data.user && !data.session) ? true : undefined;

        return { error, needsEmailConfirmation };
    }, [supabase]);

    const signIn = useCallback(async ({ email, password }: SignInData) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    }, [supabase]);

    const signInWithGoogle = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        });
        return { error };
    }, [supabase]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, [supabase]);

    const updateProfile = useCallback(async (updates: Partial<Omit<Profile, 'id' | 'created_at'>>) => {
        if (!user) return { error: new Error("Not authenticated") };

        const payload = { ...updates, updated_at: new Date().toISOString() };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from("profiles")
            .update(payload)
            .eq("id", user.id);

        if (!error) {
            setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
        }

        return { error };
    }, [user, supabase]);

    // ── Context value ────────────────────────────────────────────────────

    const value: AuthContextValue = {
        user,
        profile,
        session,
        isLoading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        refreshProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
