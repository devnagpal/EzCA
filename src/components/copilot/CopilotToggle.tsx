"use client";

// ─── Copilot Toggle Button ────────────────────────────────────────────
// Sparkles icon button for Navbar integration. Replaces the "AI Soon" badge.

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useCopilot } from "./AiCopilotProvider";
import { cn } from "@/lib/utils";

export function CopilotToggle() {
    const { toggleCopilot, isOpen } = useCopilot();

    return (
        <motion.button
            onClick={toggleCopilot}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                "border backdrop-blur-sm cursor-pointer",
                isOpen
                    ? "bg-primary/20 border-primary/30 text-primary shadow-lg shadow-primary/10"
                    : "bg-accent/[0.08] border-accent/15 text-accent/80 hover:bg-accent/15 hover:border-accent/25 hover:text-accent"
            )}
            aria-label={isOpen ? "Close AI Copilot" : "Open AI Copilot"}
        >
            {/* Pulse ring when active */}
            {isOpen && (
                <motion.span
                    className="absolute inset-0 rounded-full border border-primary/30"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
            )}

            <Sparkles className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10 tracking-wide uppercase hidden sm:inline">
                {isOpen ? "Close AI" : "AI Copilot"}
            </span>

            {/* Mobile: just the icon with no text */}
            <span className="sm:hidden relative z-10 tracking-wide uppercase">
                AI
            </span>
        </motion.button>
    );
}
