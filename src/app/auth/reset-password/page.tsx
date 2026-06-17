"use client";

// ─── Reset Password Page ───────────────────────────────────────────────────
// Handles the deep-link redirect from Supabase's password reset email.
// The URL hash contains access_token — Supabase JS picks it up automatically.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
    const supabase = getBrowserClient();
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    // Supabase fires PASSWORD_RECOVERY event on this page
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
            if (event === "PASSWORD_RECOVERY") {
                setSessionReady(true);
            }
        });
        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
        if (password !== confirmPassword) { setError("Passwords do not match."); return; }

        setIsPending(true);
        setError(null);

        const { error } = await supabase.auth.updateUser({ password });

        setIsPending(false);

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
            setTimeout(() => router.push("/dashboard"), 2500);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 flex flex-col items-center text-center gap-5"
            >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20
                                flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Password updated!</h2>
                    <p className="text-sm text-muted-foreground">
                        Redirecting you to your dashboard…
                    </p>
                </div>
            </motion.div>
        );
    }

    if (!sessionReady) {
        return (
            <div className="p-8 flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Verifying reset link…</p>
            </div>
        );
    }

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

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl
                               bg-red-500/10 border border-red-500/20 mb-5"
                >
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
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
        </motion.div>
    );
}
