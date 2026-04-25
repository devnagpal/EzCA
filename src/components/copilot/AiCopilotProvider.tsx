"use client";

// ─── AI Copilot Provider ──────────────────────────────────────────────
// Central context provider managing copilot state, conversations,
// message dispatch, subject context, and page context. Wraps the app.

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
    type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { nanoid } from "nanoid";
import type {
    Conversation,
    Message,
    SubjectContext,
    SourceCitation,
    ToolResult,
    PageContext,
} from "@/lib/copilot/types";
import { resolveSubjectContext } from "@/lib/copilot/subjectContext";
import { classifyIntent } from "@/lib/copilot/intentClassifier";
import { localStore } from "@/lib/copilot/persistence";
import { streamCopilotResponse } from "@/lib/copilot/streamingClient";

// ─── Context Shape ─────────────────────────────────────────────────────

interface CopilotContextValue {
    // State
    isOpen: boolean;
    isSidebarCollapsed: boolean;
    activeConversationId: string | null;
    conversations: Conversation[];
    subjectContext: SubjectContext | null;
    pageContext: PageContext | null;
    isStreaming: boolean;

    // Actions
    toggleCopilot: () => void;
    openCopilot: () => void;
    closeCopilot: () => void;
    toggleSidebar: () => void;
    createConversation: () => Promise<string>;
    selectConversation: (id: string) => void;
    deleteConversation: (id: string) => Promise<void>;
    pinConversation: (id: string, pinned: boolean) => Promise<void>;
    sendMessage: (text: string) => Promise<void>;
    regenerateLastMessage: () => Promise<void>;
    cancelStream: () => void;
    setPageContext: (ctx: PageContext | null) => void;

    // Computed
    activeConversation: Conversation | null;
}

const CopilotContext = createContext<CopilotContextValue | null>(null);

export function useCopilot() {
    const ctx = useContext(CopilotContext);
    if (!ctx) throw new Error("useCopilot must be used within AiCopilotProvider");
    return ctx;
}

// ─── Provider Component ────────────────────────────────────────────────

export function AiCopilotProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [pageContext, setPageContext] = useState<PageContext | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Derive subject context from URL
    const subjectContext = resolveSubjectContext(pathname);

    // Load conversations from persistence on mount
    useEffect(() => {
        localStore.list().then(setConversations);
    }, []);

    // Active conversation helper
    const activeConversation =
        conversations.find((c) => c.id === activeConversationId) ?? null;

    // ── Actions ────────────────────────────────────────────────────────

    const toggleCopilot = useCallback(() => setIsOpen((p) => !p), []);
    const openCopilot = useCallback(() => setIsOpen(true), []);
    const closeCopilot = useCallback(() => setIsOpen(false), []);
    const toggleSidebar = useCallback(() => setIsSidebarCollapsed((p) => !p), []);

    const refreshConversations = useCallback(async () => {
        const convs = await localStore.list();
        setConversations(convs);
    }, []);

    const createConversation = useCallback(async () => {
        const conv = await localStore.create("New Chat", subjectContext?.slug);
        await refreshConversations();
        setActiveConversationId(conv.id);
        return conv.id;
    }, [subjectContext, refreshConversations]);

    const selectConversation = useCallback((id: string) => {
        setActiveConversationId(id);
    }, []);

    const deleteConversation = useCallback(
        async (id: string) => {
            await localStore.delete(id);
            if (activeConversationId === id) {
                setActiveConversationId(null);
            }
            await refreshConversations();
        },
        [activeConversationId, refreshConversations]
    );

    const pinConversation = useCallback(
        async (id: string, pinned: boolean) => {
            await localStore.pin(id, pinned);
            await refreshConversations();
        },
        [refreshConversations]
    );

    const cancelStream = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        setIsStreaming(false);
    }, []);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || isStreaming) return;

            // Ensure we have an active conversation
            let convId = activeConversationId;
            if (!convId) {
                convId = await createConversation();
            }

            // Get current messages for history-aware classification
            const currentConv = await localStore.get(convId);
            const existingMessages = currentConv?.messages ?? [];

            // Create user message with history-aware intent
            const userMsg: Message = {
                id: nanoid(),
                role: "user",
                content: text.trim(),
                intent: classifyIntent(text, existingMessages),
                createdAt: new Date(),
            };

            // Persist & update local state
            await localStore.addMessage(convId, userMsg);
            await refreshConversations();

            // Create placeholder assistant message
            const assistantMsgId = nanoid();
            const assistantMsg: Message = {
                id: assistantMsgId,
                role: "assistant",
                content: "",
                createdAt: new Date(),
                isStreaming: true,
            };
            await localStore.addMessage(convId, assistantMsg);
            await refreshConversations();

            // Start streaming
            setIsStreaming(true);
            const controller = new AbortController();
            abortRef.current = controller;

            const currentConvId = convId;
            let fullContent = "";
            let accumulatedSources: SourceCitation[] | undefined;
            let accumulatedToolResult: ToolResult | undefined;

            // Get fresh messages including the new user message
            const freshConv = await localStore.get(currentConvId);
            const allMessages = freshConv?.messages ?? [];

            await streamCopilotResponse(
                allMessages,
                subjectContext,
                {
                    onChunk(chunk) {
                        fullContent += chunk;
                        setConversations((prev) =>
                            prev.map((c) =>
                                c.id === currentConvId
                                    ? {
                                        ...c,
                                        messages: c.messages.map((m) =>
                                            m.id === assistantMsgId
                                                ? { ...m, content: fullContent, isStreaming: true }
                                                : m
                                        ),
                                    }
                                    : c
                            )
                        );
                    },
                    onSources(sources: SourceCitation[]) {
                        accumulatedSources = sources;
                        setConversations((prev) =>
                            prev.map((c) =>
                                c.id === currentConvId
                                    ? {
                                        ...c,
                                        messages: c.messages.map((m) =>
                                            m.id === assistantMsgId
                                                ? { ...m, sources }
                                                : m
                                        ),
                                    }
                                    : c
                            )
                        );
                    },
                    onToolResult(toolResult: ToolResult) {
                        accumulatedToolResult = toolResult;
                        setConversations((prev) =>
                            prev.map((c) =>
                                c.id === currentConvId
                                    ? {
                                        ...c,
                                        messages: c.messages.map((m) =>
                                            m.id === assistantMsgId
                                                ? { ...m, toolResult }
                                                : m
                                        ),
                                    }
                                    : c
                            )
                        );
                    },
                    async onComplete(content) {
                        await localStore.updateMessage(currentConvId, assistantMsgId, {
                            content,
                            isStreaming: false,
                            ...(accumulatedSources ? { sources: accumulatedSources } : {}),
                            ...(accumulatedToolResult ? { toolResult: accumulatedToolResult } : {}),
                        });
                        const freshConvs = await localStore.list();
                        setConversations(
                            freshConvs.map((c) =>
                                c.id === currentConvId
                                    ? {
                                        ...c,
                                        messages: c.messages.map((m) =>
                                            m.id === assistantMsgId
                                                ? {
                                                    ...m,
                                                    isStreaming: false,
                                                    ...(accumulatedSources ? { sources: accumulatedSources } : {}),
                                                    ...(accumulatedToolResult ? { toolResult: accumulatedToolResult } : {}),
                                                }
                                                : m
                                        ),
                                    }
                                    : c
                            )
                        );
                        setIsStreaming(false);
                        abortRef.current = null;
                    },
                    onError(err) {
                        console.error("Copilot error:", err);
                        setConversations((prev) =>
                            prev.map((c) =>
                                c.id === currentConvId
                                    ? {
                                        ...c,
                                        messages: c.messages.map((m) =>
                                            m.id === assistantMsgId
                                                ? {
                                                    ...m,
                                                    content: "Sorry, something went wrong. Please try again.",
                                                    isStreaming: false,
                                                }
                                                : m
                                        ),
                                    }
                                    : c
                            )
                        );
                        setIsStreaming(false);
                    },
                },
                controller.signal,
                pageContext
            );
        },
        [
            activeConversationId,
            isStreaming,
            createConversation,
            refreshConversations,
            subjectContext,
            pageContext,
        ]
    );

    const regenerateLastMessage = useCallback(async () => {
        if (!activeConversation || isStreaming) return;
        const messages = activeConversation.messages;
        const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
        if (!lastUserMsg) return;

        // Remove the last assistant message
        const lastAssistantIdx = messages.length - 1;
        if (messages[lastAssistantIdx]?.role === "assistant") {
            const updated = messages.slice(0, lastAssistantIdx);
            await localStore.update(activeConversation.id, {
                messages: updated,
            } as Partial<Conversation>);
            await refreshConversations();
        }

        // Re-send the last user message
        await sendMessage(lastUserMsg.content);
    }, [activeConversation, isStreaming, refreshConversations, sendMessage]);

    // ── Context Value ──────────────────────────────────────────────────

    const value: CopilotContextValue = {
        isOpen,
        isSidebarCollapsed,
        activeConversationId,
        conversations,
        subjectContext,
        pageContext,
        isStreaming,
        toggleCopilot,
        openCopilot,
        closeCopilot,
        toggleSidebar,
        createConversation,
        selectConversation,
        deleteConversation,
        pinConversation,
        sendMessage,
        regenerateLastMessage,
        cancelStream,
        setPageContext,
        activeConversation,
    };

    return (
        <CopilotContext.Provider value={value}>
            {children}
        </CopilotContext.Provider>
    );
}
