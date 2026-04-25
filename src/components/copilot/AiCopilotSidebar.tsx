"use client";

// ─── AI Copilot Sidebar ──────────────────────────────────────────────
// Non-blocking side panel that slides in from the right without
// dimming or blurring the main content. Users can freely browse
// PDFs, audio, and subject pages while keeping the copilot open.

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { useCopilot } from "./AiCopilotProvider";
import { ConversationList } from "./ConversationList";
import { ChatThread } from "./ChatThread";
import { cn } from "@/lib/utils";

export function AiCopilotSidebar() {
    const { isOpen, closeCopilot, isSidebarCollapsed, toggleSidebar } = useCopilot();

    // Close on Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) closeCopilot();
        },
        [isOpen, closeCopilot]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Light click-away backdrop — only on mobile, minimal dim, no blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={closeCopilot}
                        className="fixed inset-0 z-[60] bg-black/20 md:hidden"
                    />

                    {/* Sidebar Panel — non-blocking, no content obstruction */}
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 28,
                            stiffness: 260,
                            mass: 0.8,
                        }}
                        className={cn(
                            "fixed top-0 right-0 bottom-0 z-[60] flex",
                            "w-full md:w-[420px] lg:w-[480px]"
                        )}
                    >
                        {/* Subtle left edge shadow for depth separation */}
                        <div className="absolute -left-8 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-black/10 pointer-events-none md:block hidden" />

                        <div
                            className={cn(
                                "flex w-full h-full overflow-hidden",
                                "bg-[#0c0f1a]/[0.97] backdrop-blur-xl",
                                "border-l border-white/[0.06]",
                                "shadow-[-8px_0_40px_-10px_rgba(0,0,0,0.6)]"
                            )}
                        >
                            {/* Conversation List Panel */}
                            <AnimatePresence initial={false}>
                                {!isSidebarCollapsed && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 200, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="hidden md:flex flex-col border-r border-white/[0.04] bg-black/30 overflow-hidden flex-shrink-0"
                                    >
                                        <ConversationList />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Main Area */}
                            <div className="flex-1 flex flex-col min-w-0">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.01]">
                                    <div className="flex items-center gap-2">
                                        {/* Toggle sidebar button (desktop only) */}
                                        <button
                                            onClick={toggleSidebar}
                                            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/[0.06] transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                            title={isSidebarCollapsed ? "Show chats" : "Hide chats"}
                                        >
                                            {isSidebarCollapsed ? (
                                                <PanelLeftOpen className="w-4 h-4" />
                                            ) : (
                                                <PanelLeftClose className="w-4 h-4" />
                                            )}
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                                                <Sparkles className="w-3 h-3 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-semibold text-foreground leading-none">
                                                    EzCA Copilot
                                                </h2>
                                                <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                                                    AI Study Assistant
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={closeCopilot}
                                        className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/[0.06] transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                        title="Close (Esc)"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Chat Thread */}
                                <div className="flex-1 relative overflow-hidden">
                                    <ChatThread />
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
