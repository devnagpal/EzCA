"use client";

// ─── Message Composer ─────────────────────────────────────────────────
// Smart input with auto-resize, Cmd+Enter to send, contextual placeholder,
// send button, and disabled state during streaming.

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { SendHorizontal, Square } from "lucide-react";
import { useCopilot } from "./AiCopilotProvider";
import { cn } from "@/lib/utils";

interface MessageComposerProps {
    onSend: (text: string) => void;
    onCancel?: () => void;
    disabled?: boolean;
    isStreaming?: boolean;
}

export function MessageComposer({ onSend, onCancel, disabled, isStreaming }: MessageComposerProps) {
    const { subjectContext } = useCopilot();
    const [text, setText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const placeholder = subjectContext
        ? `Ask about ${subjectContext.title}...`
        : "Ask EzCA Copilot anything...";

    // Auto-resize textarea
    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        const maxHeight = 120; // ~4 lines
        textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }, []);

    useEffect(() => {
        adjustHeight();
    }, [text, adjustHeight]);

    // Focus textarea when component mounts
    useEffect(() => {
        if (!disabled) {
            textareaRef.current?.focus();
        }
    }, [disabled]);

    const handleSend = useCallback(() => {
        const trimmed = text.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setText("");
        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    }, [text, disabled, onSend]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    const canSend = text.trim().length > 0 && !disabled;

    return (
        <div className="relative">
            <div
                className={cn(
                    "flex items-end gap-2 p-2 rounded-xl",
                    "bg-white/[0.03] border border-white/[0.06]",
                    "focus-within:border-primary/20 focus-within:bg-white/[0.04]",
                    "transition-all duration-200"
                )}
            >
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className={cn(
                        "flex-1 bg-transparent border-none outline-none resize-none",
                        "text-sm text-foreground placeholder:text-muted-foreground/40",
                        "py-1.5 px-2 min-h-[36px] max-h-[120px]",
                        "disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                />

                {/* Send / Cancel button */}
                {isStreaming ? (
                    <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={onCancel}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0 cursor-pointer"
                        title="Stop generating"
                    >
                        <Square className="w-3.5 h-3.5" />
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={handleSend}
                        disabled={!canSend}
                        whileHover={canSend ? { scale: 1.05 } : undefined}
                        whileTap={canSend ? { scale: 0.95 } : undefined}
                        className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 flex-shrink-0 cursor-pointer",
                            canSend
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30"
                                : "bg-white/[0.04] text-muted-foreground/30 cursor-not-allowed"
                        )}
                        title="Send message (Enter)"
                    >
                        <SendHorizontal className="w-3.5 h-3.5" />
                    </motion.button>
                )}
            </div>

            {/* Keyboard hint */}
            <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-[10px] text-muted-foreground/30">
                    Enter to send · Shift+Enter for new line
                </span>
                {text.length > 500 && (
                    <span className={cn(
                        "text-[10px] font-medium",
                        text.length > 2000 ? "text-red-400/60" : "text-muted-foreground/30"
                    )}>
                        {text.length}
                    </span>
                )}
            </div>
        </div>
    );
}
