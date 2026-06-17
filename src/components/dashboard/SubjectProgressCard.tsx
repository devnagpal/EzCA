"use client";

// ─── Subject Progress Card ─────────────────────────────────────────────────

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SubjectProgressCardProps {
    subject: {
        slug: string;
        title: string;
        color: string;
        gradient: string;
        border: string;
        icon: React.ElementType;
    };
    progressPct: number;
    resourceCount: number;
    completedCount: number;
    index: number;
}

export function SubjectProgressCard({
    subject,
    progressPct,
    resourceCount,
    completedCount,
    index,
}: SubjectProgressCardProps) {
    const Icon = subject.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
        >
            <Link
                href={`/subjects/${subject.slug}`}
                className={`group flex flex-col gap-3 p-4 rounded-2xl border border-white/[0.08]
                            ${subject.gradient} transition-all duration-300 hover:border-white/[0.15]
                            hover:shadow-lg`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${subject.color} opacity-80`}>
                            <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">{subject.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            {completedCount}/{resourceCount} resources
                        </span>
                        <span className="text-xs font-medium text-foreground">{progressPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 + index * 0.05 }}
                            className={`h-full rounded-full bg-gradient-to-r ${subject.color}`}
                        />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
