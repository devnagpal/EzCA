"use client";

// ─── Typing Indicator ─────────────────────────────────────────────────
// Animated three-dot "thinking" indicator with bounce animation.

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function TypingIndicator() {
    return (
        <div className="flex items-start gap-3 px-1">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>

            {/* Bubble */}
            <div className="glass-card rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary/60"
                        animate={{
                            y: [0, -6, 0],
                            opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut",
                        }}
                    />
                ))}
                <span className="text-xs text-muted-foreground ml-2">
                    Thinking...
                </span>
            </div>
        </div>
    );
}
