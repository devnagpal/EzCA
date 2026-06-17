"use client";

// ─── AuthGate ─────────────────────────────────────────────────────────────
// Inline sign-in prompt shown when an unauthenticated user tries to use a
// gated feature (e.g., sending a Copilot message, bookmarking).
// Shows a beautiful overlay with a sign-in CTA instead of hiding the feature.

import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AuthGateProps {
    title?: string;
    description?: string;
    feature?: string;
    compact?: boolean;
}

export function AuthGate({
    title = "Sign in to continue",
    description = "Create a free account to unlock your personal AI Copilot, save progress, and track your study sessions.",
    feature,
    compact = false,
}: AuthGateProps) {
    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl
                           bg-primary/10 border border-primary/20"
            >
                <Lock className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                        {feature ? `Sign in to ${feature}` : title}
                    </p>
                </div>
                <Link href="/auth/login">
                    <Button size="sm" className="rounded-full px-4 h-7 text-xs shrink-0">
                        Sign in
                    </Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-5 py-10 px-6"
        >
            <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10
                                flex items-center justify-center border border-primary/20">
                    <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background
                                border border-border flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {description}
                </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[220px]">
                <Link href="/auth/signup" className="w-full">
                    <Button className="w-full rounded-full" size="sm" id="authgate-signup-btn">
                        Create free account
                    </Button>
                </Link>
                <Link
                    href="/auth/login"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
                    id="authgate-login-link"
                >
                    Already have an account? <span className="text-primary">Sign in</span>
                </Link>
            </div>
        </motion.div>
    );
}
