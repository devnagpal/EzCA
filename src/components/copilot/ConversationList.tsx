"use client";

// ─── Conversation List ────────────────────────────────────────────────
// Left panel: search, new chat, pinned threads, time-grouped sessions.

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    Pin,
    Trash2,
    MessageSquare,
    PinOff,
    X,
} from "lucide-react";
import { useCopilot } from "./AiCopilotProvider";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/copilot/types";

// ─── Time Grouping ─────────────────────────────────────────────────────

function getTimeGroup(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayMs = 86400000;

    if (diff < dayMs) return "Today";
    if (diff < 2 * dayMs) return "Yesterday";
    if (diff < 7 * dayMs) return "Previous 7 Days";
    if (diff < 30 * dayMs) return "This Month";
    return "Older";
}

function groupConversations(
    conversations: Conversation[]
): { group: string; items: Conversation[] }[] {
    const groups = new Map<string, Conversation[]>();
    const order = ["Today", "Yesterday", "Previous 7 Days", "This Month", "Older"];

    for (const conv of conversations) {
        const group = getTimeGroup(new Date(conv.updatedAt));
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group)!.push(conv);
    }

    return order
        .filter((g) => groups.has(g))
        .map((g) => ({ group: g, items: groups.get(g)! }));
}

// ─── Component ─────────────────────────────────────────────────────────

export function ConversationList() {
    const {
        conversations,
        activeConversationId,
        selectConversation,
        createConversation,
        deleteConversation,
        pinConversation,
    } = useCopilot();

    const [searchQuery, setSearchQuery] = useState("");
    const [contextMenuId, setContextMenuId] = useState<string | null>(null);

    // Filter conversations by search
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter(
            (c) =>
                c.title.toLowerCase().includes(q) ||
                c.messages.some((m) => m.content.toLowerCase().includes(q))
        );
    }, [conversations, searchQuery]);

    // Split pinned vs regular
    const pinned = filteredConversations.filter((c) => c.pinned);
    const regular = filteredConversations.filter((c) => !c.pinned);
    const grouped = groupConversations(regular);

    const handleNewChat = useCallback(async () => {
        await createConversation();
    }, [createConversation]);

    const handleContextAction = useCallback(
        async (action: "pin" | "unpin" | "delete", id: string) => {
            setContextMenuId(null);
            if (action === "pin") await pinConversation(id, true);
            if (action === "unpin") await pinConversation(id, false);
            if (action === "delete") await deleteConversation(id);
        },
        [pinConversation, deleteConversation]
    );

    return (
        <div className="flex flex-col h-full">
            {/* Header + New Chat */}
            <div className="p-3 space-y-2">
                <button
                    onClick={handleNewChat}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/15 transition-colors cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Chat
                </button>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className="w-full pl-7 pr-2 py-1.5 rounded-md text-[11px] bg-white/[0.03] border border-white/[0.05] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/20 transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                        >
                            <X className="w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground" />
                        </button>
                    )}
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {/* Pinned Section */}
                {pinned.length > 0 && (
                    <div className="mb-2">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-2 py-1.5">
                            <Pin className="w-2.5 h-2.5 inline mr-1" />
                            Pinned
                        </p>
                        {pinned.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isActive={conv.id === activeConversationId}
                                onClick={() => selectConversation(conv.id)}
                                showContextMenu={contextMenuId === conv.id}
                                onContextMenu={() =>
                                    setContextMenuId(
                                        contextMenuId === conv.id ? null : conv.id
                                    )
                                }
                                onAction={(action) =>
                                    handleContextAction(action, conv.id)
                                }
                            />
                        ))}
                    </div>
                )}

                {/* Time-grouped sections */}
                {grouped.map(({ group, items }) => (
                    <div key={group} className="mb-2">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-2 py-1.5">
                            {group}
                        </p>
                        {items.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isActive={conv.id === activeConversationId}
                                onClick={() => selectConversation(conv.id)}
                                showContextMenu={contextMenuId === conv.id}
                                onContextMenu={() =>
                                    setContextMenuId(
                                        contextMenuId === conv.id ? null : conv.id
                                    )
                                }
                                onAction={(action) =>
                                    handleContextAction(action, conv.id)
                                }
                            />
                        ))}
                    </div>
                ))}

                {filteredConversations.length === 0 && (
                    <div className="text-center py-8">
                        <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-[11px] text-muted-foreground/40">
                            {searchQuery ? "No matching chats" : "No conversations yet"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Conversation Item ─────────────────────────────────────────────────

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
    showContextMenu: boolean;
    onContextMenu: () => void;
    onAction: (action: "pin" | "unpin" | "delete") => void;
}

function ConversationItem({
    conversation,
    isActive,
    onClick,
    showContextMenu,
    onContextMenu,
    onAction,
}: ConversationItemProps) {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const previewText = lastMessage
        ? lastMessage.content.slice(0, 60) + (lastMessage.content.length > 60 ? "…" : "")
        : "No messages yet";

    return (
        <div className="relative">
            <div
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onContextMenu();
                }}
                className={cn(
                    "w-full text-left px-2.5 py-2 rounded-lg transition-colors group/item cursor-pointer",
                    isActive
                        ? "bg-primary/10 border border-primary/15"
                        : "hover:bg-white/[0.03] border border-transparent"
                )}
            >
                <div className="flex items-start gap-2">
                    <MessageSquare
                        className={cn(
                            "w-3.5 h-3.5 mt-0.5 flex-shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground/40"
                        )}
                    />
                    <div className="flex-1 min-w-0">
                        <p
                            className={cn(
                                "text-xs font-medium truncate",
                                isActive ? "text-foreground" : "text-foreground/70"
                            )}
                        >
                            {conversation.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground/40 truncate mt-0.5">
                            {previewText}
                        </p>
                    </div>

                    {/* 3-dot menu trigger (visible on hover) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onContextMenu();
                        }}
                        className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded hover:bg-white/[0.06] transition-all text-muted-foreground/40 hover:text-muted-foreground cursor-pointer"
                    >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="3" r="1.5" />
                            <circle cx="8" cy="8" r="1.5" />
                            <circle cx="8" cy="13" r="1.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Context Menu */}
            <AnimatePresence>
                {showContextMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-1 z-50 w-36 bg-[#1a1f35] border border-white/[0.08] rounded-lg shadow-xl overflow-hidden"
                    >
                        <button
                            onClick={() =>
                                onAction(conversation.pinned ? "unpin" : "pin")
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors cursor-pointer"
                        >
                            {conversation.pinned ? (
                                <>
                                    <PinOff className="w-3 h-3" /> Unpin
                                </>
                            ) : (
                                <>
                                    <Pin className="w-3 h-3" /> Pin Chat
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => onAction("delete")}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-3 h-3" /> Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
