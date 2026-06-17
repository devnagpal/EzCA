"use client";

// ─── Recent Conversations ──────────────────────────────────────────────────

import { motion } from "framer-motion";
import { MessageSquare, Clock } from "lucide-react";
import { useCopilot } from "@/components/copilot/AiCopilotProvider";

export function RecentConversations() {
    const { conversations, selectConversation, openCopilot } = useCopilot();
    const recent = conversations.slice(0, 5);

    const handleOpen = (id: string) => {
        selectConversation(id);
        openCopilot();
    };

    if (!recent.length) {
        return (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06]
                                flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">No conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Open the AI Copilot to start chatting.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {recent.map((conv, i) => {
                const lastMsg = conv.messages[conv.messages.length - 1];
                const timeAgo = formatTimeAgo(new Date(conv.updatedAt));

                return (
                    <motion.button
                        key={conv.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleOpen(conv.id)}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl text-left
                                   bg-white/[0.03] border border-white/[0.06]
                                   hover:bg-white/[0.06] hover:border-white/[0.1]
                                   transition-all duration-200 group"
                    >
                        <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5 shrink-0">
                            <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                            {lastMsg && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {lastMsg.content.slice(0, 80)}…
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Clock className="w-3 h-3" />
                            {timeAgo}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}

function formatTimeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
}
