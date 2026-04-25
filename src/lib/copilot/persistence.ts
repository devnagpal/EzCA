// ─── Conversation Persistence ──────────────────────────────────────────
// localStorage-based conversation storage for MVP.
// Interface designed so Supabase/Neon can be swapped in later
// by simply implementing the same ConversationStore contract.

import type { Conversation, Message } from './types';

const STORAGE_KEY = 'ezca-copilot-conversations';

// ─── Store Interface (for future DB swap) ──────────────────────────────

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

// ─── Serialization Helpers ─────────────────────────────────────────────

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

// ─── LocalStorage Implementation ───────────────────────────────────────

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

export const localStore: ConversationStore = {
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

        // Auto-title from first user message
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
