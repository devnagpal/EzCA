"use client";

// ─── Login Page ────────────────────────────────────────────────────────────

import { Suspense } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";

// Inner component that uses useSearchParams — must be in a Suspense boundary
function LoginForm() {
    const { signIn, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace(redirectTo);
        }
    }, [isAuthenticated, isLoading, router, redirectTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setIsPending(true);
        setError(null);

        const { error } = await signIn({ email, password });

        if (error) {
            setError(
                error.message === "Invalid login credentials"
                    ? "Incorrect email or password. Please try again."
                    : error.message
            );
            setIsPending(false);
        } else {
            router.push(redirectTo);
            router.refresh();
        }
    };

    if (isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8"
        >
            <div className="mb-7">
                <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                    Sign in to your EzCA study workspace.
                </p>
            </div>

            {/* Google OAuth */}
            <GoogleButton label="Continue with Google" />

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-muted-foreground">or continue with email</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Error banner */}
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
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="login-password" className="text-sm font-medium text-foreground/80">
                            Password
                        </label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
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

                <Button
                    type="submit"
                    id="login-submit-btn"
                    disabled={isPending}
                    className="w-full rounded-xl mt-1"
                    size="lg"
                >
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Signing in…
                        </span>
                    ) : (
                        "Sign in"
                    )}
                </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
                Don&apos;t have an account?{" "}
                <Link
                    href="/auth/signup"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                    Create one free
                </Link>
            </p>
        </motion.div>
    );
}

// Suspense wrapper required because LoginForm uses useSearchParams
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="p-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
