"use client";

// ─── Forgot Password Page ──────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, AlertCircle, Home } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase-client";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
    const supabase = getBrowserClient();
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { setError("Please enter your email address."); return; }

        setIsPending(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        setIsPending(false);

        if (error) {
            setError(error.message);
        } else {
            setEmailSent(true);
        }
    };

    if (emailSent) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 flex flex-col items-center text-center gap-5"
            >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20
                                flex items-center justify-center">
                    <Mail className="w-7 h-7 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Check your inbox</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We sent a password reset link to{" "}
                        <span className="text-foreground font-medium">{email}</span>.
                        Click the link in the email to set a new password.
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                        Didn&apos;t receive it? Check your spam folder or{" "}
                        <button
                            onClick={() => setEmailSent(false)}
                            className="text-primary hover:underline"
                        >
                            try again
                        </button>.
                    </p>
                </div>

                {/* Always-visible navigation — user is never stranded */}
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                    <Link href="/auth/login" className="w-full">
                        <Button variant="ghost" size="sm" className="w-full rounded-full gap-2">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                        </Button>
                    </Link>
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-foreground
                                   flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" /> Back to home
                    </Link>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8"
        >
            <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground
                           hover:text-foreground transition-colors mb-7"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>

            <div className="mb-7">
                <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                    Enter your email and we&apos;ll send you a reset link.
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
                <AuthFormField
                    label="Email address"
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Button
                    type="submit"
                    id="forgot-submit-btn"
                    disabled={isPending}
                    className="w-full rounded-xl"
                    size="lg"
                >
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending…
                        </span>
                    ) : (
                        "Send reset link"
                    )}
                </Button>
            </form>
        </motion.div>
    );
}
