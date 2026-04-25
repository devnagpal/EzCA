"use client";

// ─── Source Citations ─────────────────────────────────────────────────
// Collapsible card listing referenced PDF/audio resources from the response.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Headphones, ChevronDown, ExternalLink } from "lucide-react";
import type { SourceCitation } from "@/lib/copilot/types";
import { cn } from "@/lib/utils";

interface SourceCitationsProps {
    sources: SourceCitation[];
}

export function SourceCitations({ sources }: SourceCitationsProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!sources.length) return null;

    return (
        <div className="mt-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-pointer"
            >
                <span className="flex items-center justify-center w-4 h-4 rounded bg-primary/10 text-primary text-[9px] font-bold">
                    {sources.length}
                </span>
                Sources referenced
                <ChevronDown
                    className={cn(
                        "w-3 h-3 transition-transform duration-200",
                        isExpanded && "rotate-180"
                    )}
                />
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 space-y-1.5">
                            {sources.map((source) => (
                                <div
                                    key={source.resourceId}
                                    className={cn(
                                        "flex items-center gap-2.5 p-2 rounded-lg",
                                        "bg-white/[0.02] border border-white/[0.04]",
                                        "hover:bg-white/[0.04] transition-colors group/src"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "p-1.5 rounded-md flex-shrink-0",
                                            source.type === "pdf"
                                                ? "bg-blue-500/10 text-blue-400"
                                                : "bg-purple-500/10 text-purple-400"
                                        )}
                                    >
                                        {source.type === "pdf" ? (
                                            <FileText className="w-3 h-3" />
                                        ) : (
                                            <Headphones className="w-3 h-3" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium text-foreground/80 truncate">
                                            {source.title}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/60">
                                            {source.chapter}
                                        </p>
                                    </div>
                                    {source.fileUrl && (
                                        <a
                                            href={source.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="opacity-0 group-hover/src:opacity-100 transition-opacity p-1 rounded hover:bg-white/[0.06]"
                                            title="Open resource"
                                        >
                                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
