"use client";

// ─── Message Bubble ───────────────────────────────────────────────────
// Individual message component with markdown rendering, copy/regenerate
// controls, source citations, and tool result cards.

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, RotateCcw, Sparkles, User } from "lucide-react";
import type { Message } from "@/lib/copilot/types";
import { SourceCitations } from "./SourceCitations";
import { ToolResultCard } from "./ToolResultCard";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    message: Message;
    onRegenerate?: () => void;
    isLast?: boolean;
}

export function MessageBubble({ message, onRegenerate, isLast }: MessageBubbleProps) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === "user";

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement("textarea");
            textarea.value = message.content;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [message.content]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "flex gap-2.5 group/msg",
                isUser ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                    isUser
                        ? "bg-primary/15"
                        : "bg-gradient-to-br from-primary/20 to-accent/10"
                )}
            >
                {isUser ? (
                    <User className="w-3.5 h-3.5 text-primary/80" />
                ) : (
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                )}
            </div>

            {/* Bubble */}
            <div
                className={cn(
                    "relative max-w-[85%] rounded-2xl px-3.5 py-2.5",
                    isUser
                        ? "bg-primary/[0.12] border border-primary/[0.15] rounded-tr-md"
                        : "glass-card rounded-tl-md"
                )}
            >
                {/* Content */}
                <div
                    className={cn(
                        "text-[13px] leading-relaxed",
                        isUser
                            ? "text-foreground/90"
                            : "text-foreground/80 prose prose-invert prose-sm max-w-none"
                    )}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="copilot-markdown">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Override markdown elements for compact styling
                                    h1: ({ children }) => (
                                        <h3 className="text-sm font-bold text-foreground mt-3 mb-1.5 first:mt-0">{children}</h3>
                                    ),
                                    h2: ({ children }) => (
                                        <h4 className="text-[13px] font-semibold text-foreground mt-2.5 mb-1 first:mt-0">{children}</h4>
                                    ),
                                    h3: ({ children }) => (
                                        <h5 className="text-xs font-semibold text-foreground/90 mt-2 mb-1 first:mt-0">{children}</h5>
                                    ),
                                    p: ({ children }) => (
                                        <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                                    ),
                                    ul: ({ children }) => (
                                        <ul className="list-disc list-inside space-y-0.5 mb-2 text-[12px]">{children}</ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-inside space-y-0.5 mb-2 text-[12px]">{children}</ol>
                                    ),
                                    li: ({ children }) => (
                                        <li className="text-muted-foreground leading-relaxed">{children}</li>
                                    ),
                                    strong: ({ children }) => (
                                        <strong className="font-semibold text-foreground/95">{children}</strong>
                                    ),
                                    em: ({ children }) => (
                                        <em className="text-muted-foreground italic">{children}</em>
                                    ),
                                    code: ({ className, children, ...props }) => {
                                        const isBlock = className?.includes("language-");
                                        if (isBlock) {
                                            return (
                                                <pre className="bg-black/30 rounded-lg p-2.5 my-2 overflow-x-auto text-[11px]">
                                                    <code className={cn("text-primary/80", className)} {...props}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            );
                                        }
                                        return (
                                            <code className="bg-white/[0.06] px-1 py-0.5 rounded text-[11px] text-primary/80 font-mono" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-2 border-primary/30 pl-3 my-2 text-muted-foreground italic text-[12px]">
                                            {children}
                                        </blockquote>
                                    ),
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto my-2">
                                            <table className="w-full text-[11px] border-collapse">{children}</table>
                                        </div>
                                    ),
                                    thead: ({ children }) => (
                                        <thead className="border-b border-white/10">{children}</thead>
                                    ),
                                    th: ({ children }) => (
                                        <th className="text-left py-1.5 px-2 font-semibold text-foreground/80">{children}</th>
                                    ),
                                    td: ({ children }) => (
                                        <td className="py-1.5 px-2 border-b border-white/[0.03] text-muted-foreground">{children}</td>
                                    ),
                                    hr: () => (
                                        <hr className="border-white/[0.06] my-3" />
                                    ),
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Streaming cursor */}
                {message.isStreaming && (
                    <motion.span
                        className="inline-block w-0.5 h-4 bg-primary/60 ml-0.5 align-middle"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />
                )}

                {/* Tool Result */}
                {message.toolResult && <ToolResultCard result={message.toolResult} />}

                {/* Source Citations */}
                {message.sources && message.sources.length > 0 && (
                    <SourceCitations sources={message.sources} />
                )}

                {/* Actions (assistant only, not streaming) */}
                {!isUser && !message.isStreaming && message.content && (
                    <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-white/[0.04] opacity-0 group-hover/msg:opacity-100 transition-opacity">
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/[0.04] transition-colors cursor-pointer"
                            title="Copy response"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3" />
                                    Copy
                                </>
                            )}
                        </button>
                        {isLast && onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/[0.04] transition-colors cursor-pointer"
                                title="Regenerate response"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Regenerate
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
