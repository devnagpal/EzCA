"use client";

// ─── Reset Password Page ───────────────────────────────────────────────────
// Handles the deep-link redirect from Supabase's password reset email.
// Supabase JS auto-detects the recovery token in the URL hash and fires
// the PASSWORD_RECOVERY event via onAuthStateChange.
//
// Fixes applied:
//   1. 12-second timeout — if PASSWORD_RECOVERY never fires, show an error
//      with manual navigation instead of spinning forever.
//   2. try/catch/finally around updateUser — isPending is ALWAYS cleared.
//   3. Success screen has visible "Go to login" and "Go to home" buttons
//      in addition to an auto-redirect, so users are never stranded.
//   4. router.refresh() called after password update to sync RSC cache.

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Eye, EyeOff, Home, LogIn, ArrowLeft } from "lucide-react";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/Button";

// How long to wait for the PASSWORD_RECOVERY event before showing an error
const RECOVERY_TIMEOUT_MS = 12_000;

type PageState = "waiting" | "ready" | "success" | "timeout_error" | "link_error";

export default function ResetPasswordPage() {
    const supabase = getBrowserClient();
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [pageState, setPageState] = useState<PageState>("waiting");

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Set a timeout — if PASSWORD_RECOVERY never fires, show a helpful error
        timeoutRef.current = setTimeout(() => {
            setPageState((current) => {
                // Only override if still waiting
                if (current === "waiting") return "timeout_error";
                return current;
            });
        }, RECOVERY_TIMEOUT_MS);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event: AuthChangeEvent) => {
                if (event === "PASSWORD_RECOVERY") {
                    // Clear the timeout — we got the event in time
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                    }
                    setPageState("ready");
                }
            }
        );

        return () => {
            subscription.unsubscribe();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            setFormError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }

        setIsPending(true);
        setFormError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) {
                setFormError(error.message);
            } else {
                // Sync server-side RSC cache before showing success
                router.refresh();
                setPageState("success");

                // Auto-redirect to login after 3 seconds — user can also click manually
                setTimeout(() => router.push("/auth/login"), 3000);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setFormError(message);
        } finally {
            // ALWAYS clear the spinner — never leave the user stuck
            setIsPending(false);
        }
    };

    // ── Success screen ─────────────────────────────────────────────────────
    if (pageState === "success") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 flex flex-col items-center text-center gap-6"
            >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20
                                flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>

                <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Password updated!</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Your password has been changed successfully.
                        Redirecting you to sign in…
                    </p>
                </div>

                {/* Manual navigation — always visible, even if auto-redirect fails */}
                <div className="flex flex-col gap-2 w-full max-w-[240px]">
                    <Link href="/auth/login" className="w-full">
                        <Button
                            id="reset-success-login-btn"
                            className="w-full rounded-xl gap-2"
                            size="sm"
                        >
                            <LogIn className="w-4 h-4" />
                            Go to sign in
                        </Button>
                    </Link>
                    <Link
                        href="/"
                        id="reset-success-home-link"
                        className="text-sm text-muted-foreground hover:text-foreground
                                   flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                        Back to home
                    </Link>
                </div>
            </motion.div>
        );
    }

    // ── Timeout / invalid link error screen ──────────────────────────────
    if (pageState === "timeout_error" || pageState === "link_error") {
        const isTimeout = pageState === "timeout_error";
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 flex flex-col items-center text-center gap-6"
            >
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20
                                flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>

                <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                        {isTimeout ? "Reset link expired" : "Invalid reset link"}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {isTimeout
                            ? "The reset link has expired or was already used. Please request a new one."
                            : "This reset link is invalid. Please request a fresh password reset link."}
                    </p>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-[240px]">
                    <Link href="/auth/forgot-password" className="w-full">
                        <Button
                            id="reset-error-retry-btn"
                            className="w-full rounded-xl"
                            size="sm"
                        >
                            Request new reset link
                        </Button>
                    </Link>
                    <Link href="/auth/login" className="w-full">
                        <Button
                            id="reset-error-login-btn"
                            variant="ghost"
                            className="w-full rounded-xl gap-2"
                            size="sm"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to sign in
                        </Button>
                    </Link>
                    <Link
                        href="/"
                        id="reset-error-home-link"
                        className="text-sm text-muted-foreground hover:text-foreground
                                   flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                        Back to home
                    </Link>
                </div>
            </motion.div>
        );
    }

    // ── Waiting for PASSWORD_RECOVERY event ───────────────────────────────
    if (pageState === "waiting") {
        return (
            <div className="p-8 flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Verifying reset link…</p>
            </div>
        );
    }

    // ── Password form (pageState === "ready") ─────────────────────────────
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8"
        >
            <div className="mb-7">
                <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                    Choose a strong password for your account.
                </p>
            </div>

            {formError && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl
                               bg-red-500/10 border border-red-500/20 mb-5"
                >
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-400">{formError}</p>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="reset-password" className="text-sm font-medium text-foreground/80">
                        New password
                    </label>
                    <div className="relative">
                        <input
                            id="reset-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="8+ characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm
                                       bg-white/[0.04] border border-white/[0.08]
                                       text-foreground placeholder:text-muted-foreground/50
                                       outline-none focus:border-primary/60 focus:bg-white/[0.06]
                                       focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-3 top-1/2 -translate-y-1/2
                                       text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="reset-confirm" className="text-sm font-medium text-foreground/80">
                        Confirm new password
                    </label>
                    <input
                        id="reset-confirm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl text-sm
                                   bg-white/[0.04] border border-white/[0.08]
                                   text-foreground placeholder:text-muted-foreground/50
                                   outline-none focus:border-primary/60 focus:bg-white/[0.06]
                                   focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                </div>

                <Button
                    type="submit"
                    id="reset-submit-btn"
                    disabled={isPending}
                    className="w-full rounded-xl mt-1"
                    size="lg"
                >
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Updating…
                        </span>
                    ) : (
                        "Update password"
                    )}
                </Button>
            </form>

            {/* Manual escape hatch — always visible on the form page */}
            <div className="mt-6 flex items-center justify-center gap-4">
                <Link
                    href="/auth/login"
                    className="text-sm text-muted-foreground hover:text-foreground
                               flex items-center gap-1 transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" /> Back to sign in
                </Link>
                <span className="text-white/10">|</span>
                <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-foreground
                               flex items-center gap-1 transition-colors"
                >
                    <Home className="w-3 h-3" /> Home
                </Link>
            </div>
        </motion.div>
    );
}
