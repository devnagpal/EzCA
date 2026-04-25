// ─── Intent Classifier ─────────────────────────────────────────────────
// Client-side intent classification using keyword/pattern matching.
// Determines what kind of action the user is requesting so the copilot
// can route to the appropriate handler (RAG, quiz gen, summary, etc).

import type { IntentType, Message } from './types';

interface IntentPattern {
    intent: IntentType;
    patterns: RegExp[];
    /** Higher priority wins when multiple intents match */
    priority: number;
}

const INTENT_PATTERNS: IntentPattern[] = [
    {
        intent: 'greeting',
        patterns: [
            /^(hi|hello|hey|howdy|good\s*(morning|afternoon|evening)|what'?s?\s*up|sup)\b/i,
            /^(greetings|hola|namaste|yo)\b/i,
        ],
        priority: 1,
    },
    {
        intent: 'quiz-me',
        patterns: [
            /\b(rapid\s*fire|quick\s*quiz|test\s*me\s*fast|speed\s*round)\b/i,
        ],
        priority: 11,
    },
    {
        intent: 'quiz',
        patterns: [
            /\b(quiz|mcq|multiple\s*choice|test\s*me|practice\s*questions?)\b/i,
            /\b(mock\s*test|sample\s*questions?)\b/i,
        ],
        priority: 10,
    },
    {
        intent: 'flashcard',
        patterns: [
            /\b(flashcard|flash\s*card|flip\s*card|memory\s*card|study\s*card)\b/i,
            /\b(create\s*cards?|make\s*cards?)\b/i,
        ],
        priority: 9,
    },
    {
        intent: 'summarize',
        patterns: [
            /\b(summarize|summary|brief|tldr|tl;dr|in\s*short|key\s*points?|overview)\b/i,
            /\b(give\s*me\s*a\s*summary|sum\s*up)\b/i,
        ],
        priority: 8,
    },
    {
        intent: 'revise',
        patterns: [
            /\b(revis(e|ion)|review\s*notes?|revision\s*notes?|cheat\s*sheet)\b/i,
            /\b(quick\s*review|last\s*minute)\b/i,
        ],
        priority: 7,
    },
    {
        intent: 'generate',
        patterns: [
            /\b(create|generate|make|build|prepare|draft|write)\b.*\b(notes?|material|guide|plan|schedule)\b/i,
            /\b(study\s*plan|study\s*schedule)\b/i,
        ],
        priority: 6,
    },
    {
        intent: 'explain',
        patterns: [
            /\b(explain|clarify|elaborate|break\s*down|what\s*does\s*.*\s*mean)\b/i,
            /\b(help\s*me\s*understand|make\s*it\s*simple|simplify|dumb\s*it\s*down)\b/i,
            /\b(what\s*is|define|meaning\s*of)\b/i,
        ],
        priority: 5,
    },
    {
        intent: 'related',
        patterns: [
            /\b(related|similar|also\s*learn|connected|associated|what\s*else)\b/i,
        ],
        priority: 4,
    },
    {
        intent: 'question',
        patterns: [
            /\b(what|why|how|when|where|who|which|can\s*you|tell\s*me|is\s*there|do\s*you|does)\b/i,
            /\?$/,
        ],
        priority: 3,
    },
];

// Follow-up indicators — phrases that reference the ongoing conversation
const FOLLOW_UP_PATTERNS = [
    /\b(more|continue|go\s*on|elaborate|expand)\b/i,
    /\b(also|and|what\s*about|how\s*about)\b/i,
    /\b(this|that|it|those|these|the\s*same)\b/i,
    /\b(previous|above|earlier|you\s*said|you\s*mentioned)\b/i,
    /\b(another|next|one\s*more)\b/i,
];

/**
 * Classifies user input text into an intent type.
 * Uses pattern matching with priority-based resolution.
 * Can detect follow-ups from conversation history.
 */
export function classifyIntent(text: string, history?: Message[]): IntentType {
    const trimmed = text.trim();

    // Very short messages that look like greetings
    if (trimmed.length < 10 && /^(hi|hey|hello|yo)\b/i.test(trimmed)) {
        return 'greeting';
    }

    let bestMatch: IntentType = 'question'; // default fallback
    let bestPriority = 0;

    for (const { intent, patterns, priority } of INTENT_PATTERNS) {
        for (const pattern of patterns) {
            if (pattern.test(trimmed) && priority > bestPriority) {
                bestMatch = intent;
                bestPriority = priority;
                break;
            }
        }
    }

    // Check for follow-up only if there's conversation history
    // and we matched a low-priority or default intent
    if (history && history.length >= 2 && bestPriority <= 3) {
        const followUpScore = FOLLOW_UP_PATTERNS.reduce(
            (score, pattern) => score + (pattern.test(trimmed) ? 1 : 0),
            0
        );
        // If multiple follow-up indicators match, treat as follow-up
        if (followUpScore >= 2 || (trimmed.length < 30 && followUpScore >= 1)) {
            return 'follow-up';
        }
    }

    return bestMatch;
}

/**
 * Returns a human-readable label for an intent type.
 */
export function getIntentLabel(intent: IntentType): string {
    const labels: Record<IntentType, string> = {
        greeting: 'Greeting',
        question: 'Question',
        quiz: 'Quiz',
        generate: 'Generate',
        summarize: 'Summary',
        revise: 'Revision',
        explain: 'Explanation',
        'quiz-me': 'Rapid Quiz',
        related: 'Related Topics',
        flashcard: 'Flashcards',
        'follow-up': 'Follow-up',
    };
    return labels[intent];
}
