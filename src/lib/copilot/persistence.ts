// ─── Conversation Persistence (Supabase) ──────────────────────────────
// Database-driven conversation storage using Supabase.
// Replaces the former localStorage implementation with full CRUD
// operations against the conversations and messages tables.
// Falls back to localStorage if Supabase is not configured.

import type { Conversation, Message } from './types';
import { supabase } from '@/lib/supabase';

// ─── Store Interface ───────────────────────────────────────────────────

export interface ConversationStore {
    list(): Promise<Conversation[]>;
    get(id: string): Promise<(Conversation & { messages: Message[] }) | null>;
    create(title?: string, subjectSlug?: string): Promise<Conversation>;
    update(id: string, data: Partial<Conversation>): Promise<void>;
    addMessage(convId: string, msg: Message): Promise<void>;
    updateMessage(convId: string, msgId: string, data: Partial<Message>): Promise<void>;
    pin(convId: string, pinned: boolean): Promise<void>;
    search(query: string): Promise<Conversation[]>;
    delete(convId: string): Promise<void>;
}

// ─── Supabase availability check ───────────────────────────────────────

function isSupabaseConfigured(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url_here' &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here'
    );
}

// ─── Message Serialization Helpers ─────────────────────────────────────

function dbToMessage(row: Record<string, unknown>): Message {
    return {
        id: row.id as string,
        role: row.role as Message['role'],
        content: (row.content as string) || '',
        intent: (row.intent as Message['intent']) || undefined,
        toolResult: row.tool_result ? (row.tool_result as Message['toolResult']) : undefined,
        sources: row.sources ? (row.sources as Message['sources']) : undefined,
        createdAt: new Date(row.created_at as string),
    };
}

function dbToConversation(row: Record<string, unknown>, messages: Message[] = []): Conversation {
    return {
        id: row.id as string,
        title: row.title as string,
        pinned: row.pinned as boolean,
        subjectSlug: (row.subject_slug as string) || undefined,
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string),
        messages,
    };
}

// ─── Supabase Implementation ───────────────────────────────────────────

const supabaseStore: ConversationStore = {
    async list() {
        const { data: convRows, error } = await supabase
            .from('conversations')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error || !convRows) return [];

        // Fetch last message for each conversation (for preview)
        const conversations: Conversation[] = [];
        for (const row of convRows) {
            const { data: msgRows } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', row.id)
                .order('created_at', { ascending: true });

            const messages = (msgRows || []).map(dbToMessage);
            conversations.push(dbToConversation(row, messages));
        }

        return conversations;
    },

    async get(id) {
        const { data: convRow, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !convRow) return null;

        const { data: msgRows } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        const messages = (msgRows || []).map(dbToMessage);
        return dbToConversation(convRow, messages);
    },

    async create(title = 'New Chat', subjectSlug) {
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                title,
                subject_slug: subjectSlug || null,
            })
            .select()
            .single();

        if (error || !data) {
            // Fallback: generate local conversation
            const now = new Date();
            return {
                id: crypto.randomUUID?.() ?? `conv-${Date.now()}`,
                title,
                pinned: false,
                createdAt: now,
                updatedAt: now,
                subjectSlug,
                messages: [],
            };
        }

        return dbToConversation(data, []);
    },

    async update(id, data) {
        const updatePayload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };
        if (data.title !== undefined) updatePayload.title = data.title;
        if (data.pinned !== undefined) updatePayload.pinned = data.pinned;
        if (data.subjectSlug !== undefined) updatePayload.subject_slug = data.subjectSlug;

        await supabase
            .from('conversations')
            .update(updatePayload)
            .eq('id', id);
    },

    async addMessage(convId, msg) {
        await supabase
            .from('messages')
            .insert({
                id: msg.id,
                conversation_id: convId,
                role: msg.role,
                content: msg.content,
                intent: msg.intent || null,
                tool_result: msg.toolResult || null,
                sources: msg.sources || null,
            });

        // Auto-title from first user message
        if (msg.role === 'user') {
            const { data: conv } = await supabase
                .from('conversations')
                .select('title')
                .eq('id', convId)
                .single();

            if (conv && conv.title === 'New Chat') {
                const autoTitle = msg.content.slice(0, 50) + (msg.content.length > 50 ? '…' : '');
                await supabase
                    .from('conversations')
                    .update({ title: autoTitle, updated_at: new Date().toISOString() })
                    .eq('id', convId);
            } else {
                await supabase
                    .from('conversations')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', convId);
            }
        } else {
            await supabase
                .from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', convId);
        }
    },

    async updateMessage(convId, msgId, data) {
        const updatePayload: Record<string, unknown> = {};
        if (data.content !== undefined) updatePayload.content = data.content;
        if (data.intent !== undefined) updatePayload.intent = data.intent;
        if (data.toolResult !== undefined) updatePayload.tool_result = data.toolResult;
        if (data.sources !== undefined) updatePayload.sources = data.sources;

        await supabase
            .from('messages')
            .update(updatePayload)
            .eq('id', msgId);

        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', convId);
    },

    async pin(convId, pinned) {
        await supabase
            .from('conversations')
            .update({ pinned })
            .eq('id', convId);
    },

    async search(query) {
        const q = query.toLowerCase();
        // Search in conversation titles
        const { data: convRows } = await supabase
            .from('conversations')
            .select('*')
            .ilike('title', `%${q}%`)
            .order('updated_at', { ascending: false });

        if (!convRows) return [];

        const conversations: Conversation[] = [];
        for (const row of convRows) {
            const { data: msgRows } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', row.id)
                .order('created_at', { ascending: true });

            const messages = (msgRows || []).map(dbToMessage);
            conversations.push(dbToConversation(row, messages));
        }

        return conversations;
    },

    async delete(convId) {
        // Messages cascade-deleted via FK constraint
        await supabase
            .from('conversations')
            .delete()
            .eq('id', convId);
    },
};

// ─── LocalStorage Fallback ─────────────────────────────────────────────

const STORAGE_KEY = 'ezca-copilot-conversations';

function serialize(conversations: Conversation[]): string {
    return JSON.stringify(conversations, (key, value) => {
        if (value instanceof Date) return value.toISOString();
        return value;
    });
}

function deserialize(json: string): Conversation[] {
    try {
        const data = JSON.parse(json);
        if (!Array.isArray(data)) return [];
        return data.map((conv: Record<string, unknown>) => ({
            ...conv,
            createdAt: new Date(conv.createdAt as string),
            updatedAt: new Date(conv.updatedAt as string),
            messages: Array.isArray(conv.messages)
                ? (conv.messages as Record<string, unknown>[]).map((msg) => ({
                    ...msg,
                    createdAt: new Date(msg.createdAt as string),
                }))
                : [],
        })) as Conversation[];
    } catch {
        return [];
    }
}

function readAll(): Conversation[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return deserialize(raw);
}

function writeAll(conversations: Conversation[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, serialize(conversations));
}

const localFallbackStore: ConversationStore = {
    async list() {
        return readAll().sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    },
    async get(id) {
        return readAll().find((c) => c.id === id) ?? null;
    },
    async create(title = 'New Chat', subjectSlug) {
        const conversations = readAll();
        const now = new Date();
        const conv: Conversation = {
            id: crypto.randomUUID?.() ?? `conv-${Date.now()}`,
            title,
            pinned: false,
            createdAt: now,
            updatedAt: now,
            subjectSlug,
            messages: [],
        };
        conversations.unshift(conv);
        writeAll(conversations);
        return conv;
    },
    async update(id, data) {
        const conversations = readAll();
        const idx = conversations.findIndex((c) => c.id === id);
        if (idx === -1) return;
        conversations[idx] = { ...conversations[idx], ...data, updatedAt: new Date() };
        writeAll(conversations);
    },
    async addMessage(convId, msg) {
        const conversations = readAll();
        const conv = conversations.find((c) => c.id === convId);
        if (!conv) return;
        conv.messages.push(msg);
        conv.updatedAt = new Date();
        if (conv.title === 'New Chat' && msg.role === 'user') {
            conv.title = msg.content.slice(0, 50) + (msg.content.length > 50 ? '…' : '');
        }
        writeAll(conversations);
    },
    async updateMessage(convId, msgId, data) {
        const conversations = readAll();
        const conv = conversations.find((c) => c.id === convId);
        if (!conv) return;
        const msg = conv.messages.find((m) => m.id === msgId);
        if (!msg) return;
        Object.assign(msg, data);
        conv.updatedAt = new Date();
        writeAll(conversations);
    },
    async pin(convId, pinned) {
        const conversations = readAll();
        const conv = conversations.find((c) => c.id === convId);
        if (!conv) return;
        conv.pinned = pinned;
        writeAll(conversations);
    },
    async search(query) {
        const q = query.toLowerCase();
        return readAll().filter(
            (c) =>
                c.title.toLowerCase().includes(q) ||
                c.messages.some((m) => m.content.toLowerCase().includes(q))
        );
    },
    async delete(convId) {
        const conversations = readAll().filter((c) => c.id !== convId);
        writeAll(conversations);
    },
};

// ─── Exported Store ────────────────────────────────────────────────────
// Automatically uses Supabase if configured, otherwise falls back to localStorage.

export const localStore: ConversationStore = isSupabaseConfigured()
    ? supabaseStore
    : localFallbackStore;
