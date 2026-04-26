// ─── AI Copilot Type Definitions ───────────────────────────────────────
// Central type system for conversations, messages, intent classification,
// source citations, tool results, and page context awareness.

export type IntentType =
    | 'greeting'
    | 'question'
    | 'quiz'
    | 'generate'
    | 'summarize'
    | 'revise'
    | 'explain'
    | 'quiz-me'
    | 'related'
    | 'flashcard'
    | 'follow-up';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface SourceCitation {
    resourceId: string;
    title: string;
    chapter: string;
    type: 'pdf' | 'audio';
    fileUrl?: string;
    relevanceScore?: number;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

export interface FlashcardData {
    id: string;
    term: string;
    definition: string;
}

export interface SummaryData {
    title: string;
    sections: { heading: string; content: string }[];
}

export type ToolResultType = 'quiz' | 'flashcard' | 'summary';

export interface ToolResult {
    type: ToolResultType;
    data: QuizQuestion[] | FlashcardData[] | SummaryData;
}

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    intent?: IntentType;
    sources?: SourceCitation[];
    toolResult?: ToolResult;
    createdAt: Date;
    isStreaming?: boolean;
}

export interface Conversation {
    id: string;
    title: string;
    pinned: boolean;
    createdAt: Date;
    updatedAt: Date;
    subjectSlug?: string;
    messages: Message[];
}

export interface SubjectContext {
    slug: string;
    title: string;
    description: string;
    color: string;
    availableResources: {
        id: string;
        title: string;
        type: 'pdf' | 'audio';
        chapter: string;
    }[];
}

// ─── Page Context ──────────────────────────────────────────────────────
// Tracks what content the user is actively viewing (current PDF/audio).

export interface PageContext {
    /** The currently viewed resource, if any */
    activeResource?: {
        id: string;
        title: string;
        type: 'pdf' | 'audio';
        chapter: string;
        fileUrl?: string;
    };
    /** Subject slug from URL */
    subjectSlug?: string;
    /** Currently active tab on subject page */
    activeTab?: 'pdf' | 'audio';
    /** Extracted text content from active document (for RAG) */
    content?: string;
}

export interface CopilotState {
    isOpen: boolean;
    isSidebarCollapsed: boolean;
    activeConversationId: string | null;
    conversations: Conversation[];
    subjectContext: SubjectContext | null;
    pageContext: PageContext | null;
    isStreaming: boolean;
}
