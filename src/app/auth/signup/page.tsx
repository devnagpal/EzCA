"use client";

// ─── Sign Up Page ──────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: "8+ characters", ok: password.length >= 8 },
        { label: "uppercase letter", ok: /[A-Z]/.test(password) },
        { label: "number", ok: /[0-9]/.test(password) },
    ];
    const score = checks.filter((c) => c.ok).length;
    const colors = ["bg-red-500", "bg-yellow-500", "bg-emerald-500"];

    if (!password) return null;

    return (
        <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < score ? colors[score - 1] : "bg-white/[0.08]"
                        }`}
                    />
                ))}
            </div>
            <div className="flex gap-3">
                {checks.map((c) => (
                    <span
                        key={c.label}
                        className={`text-[10px] flex items-center gap-1 transition-colors ${
                            c.ok ? "text-emerald-400" : "text-muted-foreground/60"
                        }`}
                    >
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {c.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function SignUpPage() {
    const { signUp } = useAuth();

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const validate = () => {
        if (!displayName.trim()) return "Please enter your name.";
        if (!email) return "Please enter your email.";
        if (password.length < 8) return "Password must be at least 8 characters.";
        if (password !== confirmPassword) return "Passwords do not match.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setIsPending(true);
        setError(null);

        const { error, needsEmailConfirmation } = await signUp({
            email,
            password,
            displayName: displayName.trim(),
        });

        if (error) {
            setError(
                error.message.includes("already registered")
                    ? "An account with this email already exists. Try signing in."
                    : error.message
            );
            setIsPending(false);
        } else if (needsEmailConfirmation) {
            setEmailSent(true);
            setIsPending(false);
        }
        // If no email confirmation (auto-confirmed), onAuthStateChange in AuthContext
        // will fire and redirect via the layout useEffect
    };

    // Email confirmation screen
    if (emailSent) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 flex flex-col items-center text-center gap-5"
            >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20
                                flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Check your email</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We sent a confirmation link to{" "}
                        <span className="text-foreground font-medium">{email}</span>.
                        Click the link to activate your account.
                    </p>
                </div>
                <p className="text-xs text-muted-foreground">
                    Didn&apos;t get it? Check your spam folder or{" "}
                    <Link href="/auth/signup" className="text-primary hover:underline">
                        try again
                    </Link>
                    .
                </p>
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
            <div className="mb-7">
                <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                    Free forever. Your personal CA study workspace.
                </p>
            </div>

            <GoogleButton label="Sign up with Google" />

            <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-muted-foreground">or sign up with email</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
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
                    label="Full name"
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Aarav Sharma"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                />

                <AuthFormField
                    label="Email address"
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="signup-password" className="text-sm font-medium text-foreground/80">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="signup-password"
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
                    <PasswordStrength password={password} />
                </div>

                <AuthFormField
                    label="Confirm password"
                    id="signup-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={
                        confirmPassword && confirmPassword !== password
                            ? "Passwords don't match"
                            : undefined
                    }
                    required
                />

                <Button
                    type="submit"
                    id="signup-submit-btn"
                    disabled={isPending}
                    className="w-full rounded-xl mt-1"
                    size="lg"
                >
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating account…
                        </span>
                    ) : (
                        "Create account"
                    )}
                </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
                Already have an account?{" "}
                <Link
                    href="/auth/login"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </motion.div>
    );
}
