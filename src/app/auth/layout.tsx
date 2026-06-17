// ─── Auth Layout Shell ─────────────────────────────────────────────────────
// Shared layout for all /auth/* pages.
// Centered card with logo on a premium gradient background.

import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
    title: "EzCA — Sign in",
    description: "Access your EzCA personal study workspace.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
            {/* Background glows */}
            <div className="fixed inset-0 z-[-1]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(167,139,250,0.07),transparent)]" />
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 mb-8 group">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl
                                bg-gradient-to-br from-primary/20 to-accent/10
                                group-hover:from-primary/30 group-hover:to-accent/20
                                transition-all duration-300">
                    <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                    Ez<span className="text-gradient">CA</span>
                </span>
            </Link>

            {/* Auth card */}
            <div className="w-full max-w-md">
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]
                                rounded-2xl shadow-2xl overflow-hidden">
                    {children}
                </div>
            </div>

            {/* Footer */}
            <p className="mt-8 text-xs text-muted-foreground text-center">
                By continuing, you agree to EzCA&apos;s{" "}
                <Link href="/privacy" className="underline hover:text-foreground transition-colors">
                    Privacy Policy
                </Link>
                .
            </p>
        </div>
    );
}
