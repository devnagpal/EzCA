"use client";

// ─── Chat Thread ──────────────────────────────────────────────────────
// Main conversation area with scrollable message list, welcome state,
// suggestion pills, and auto-scroll-to-bottom.

import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, FileText, Headphones } from "lucide-react";
import { useCopilot } from "./AiCopilotProvider";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { SuggestionPills } from "./SuggestionPills";
import { TypingIndicator } from "./TypingIndicator";

export function ChatThread() {
    const {
        activeConversation,
        sendMessage,
        regenerateLastMessage,
        isStreaming,
        cancelStream,
        subjectContext,
        pageContext,
    } = useCopilot();

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const messages = activeConversation?.messages ?? [];

    // Auto-scroll to bottom on new messages
    const scrollToBottom = useCallback((smooth = true) => {
        bottomRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "instant",
        });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages.length, messages[messages.length - 1]?.content, scrollToBottom]);

    // Detect when user scrolls up
    const handleScroll = useCallback(() => {
        const container = scrollRef.current;
        if (!container) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }, []);

    const handleSend = useCallback(
        (text: string) => {
            sendMessage(text);
        },
        [sendMessage]
    );

    // Check if last message is still streaming (for typing indicator)
    const lastMsg = messages[messages.length - 1];
    const showTypingIndicator =
        isStreaming && lastMsg?.role === "assistant" && !lastMsg.content;

    return (
        <div className="flex flex-col h-full">
            {/* Messages area */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
            >
                {messages.length === 0 ? (
                    // ── Welcome State ──
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex flex-col items-center justify-center h-full text-center px-4 py-8"
                    >
                        {/* Animated icon */}
                        <motion.div
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-6"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Sparkles className="w-8 h-8 text-primary" />
                        </motion.div>

                        <h3 className="text-lg font-bold text-foreground mb-2">
                            {subjectContext
                                ? `Studying ${subjectContext.title}?`
                                : "Welcome to EzCA Copilot"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                            {subjectContext
                                ? "I can help you with summaries, quizzes, flashcards, and explanations from your study materials."
                                : "Your AI study companion for CA Foundation. Ask me anything about your subjects."}
                        </p>

                        {/* Active resource context chip */}
                        {pageContext?.activeResource && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/[0.06] border border-primary/10 mb-6 max-w-xs"
                            >
                                {pageContext.activeResource.type === 'pdf' ? (
                                    <FileText className="w-3 h-3 text-primary flex-shrink-0" />
                                ) : (
                                    <Headphones className="w-3 h-3 text-primary flex-shrink-0" />
                                )}
                                <span className="text-[10px] text-primary/80 truncate">
                                    Viewing: {pageContext.activeResource.title}
                                </span>
                            </motion.div>
                        )}

                        <SuggestionPills onSelect={handleSend} />
                    </motion.div>
                ) : (
                    // ── Messages ──
                    <>
                        {messages.map((msg, i) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isLast={
                                    i === messages.length - 1 && msg.role === "assistant"
                                }
                                onRegenerate={
                                    i === messages.length - 1 && msg.role === "assistant"
                                        ? regenerateLastMessage
                                        : undefined
                                }
                            />
                        ))}

                        {/* Typing indicator */}
                        <AnimatePresence>
                            {showTypingIndicator && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                >
                                    <TypingIndicator />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Follow-up suggestions after response */}
                        {!isStreaming && messages.length > 0 && lastMsg?.role === "assistant" && !lastMsg.isStreaming && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="pt-2"
                            >
                                <SuggestionPills onSelect={handleSend} />
                            </motion.div>
                        )}
                    </>
                )}

                {/* Scroll anchor */}
                <div ref={bottomRef} />
            </div>

            {/* Scroll-to-bottom FAB */}
            <AnimatePresence>
                {showScrollButton && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => scrollToBottom()}
                        className="absolute bottom-24 right-6 w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.12] transition-colors shadow-lg cursor-pointer z-10"
                        title="Scroll to bottom"
                    >
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Composer */}
            <div className="p-3 border-t border-white/[0.04]">
                <MessageComposer
                    onSend={handleSend}
                    onCancel={cancelStream}
                    disabled={false}
                    isStreaming={isStreaming}
                />
            </div>
        </div>
    );
}
