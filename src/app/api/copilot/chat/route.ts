import { NextRequest, NextResponse } from 'next/server';
import { streamText, generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

export const maxDuration = 60;

// ─── Pluggable LLM Configuration ──────────────────────────────────────
// Configure model provider and model name via environment variables.
// Default: Anthropic Claude. Can be swapped to OpenAI, local models, etc.

function getClassifierModel() {
    const modelId = process.env.COPILOT_CLASSIFIER_MODEL || 'claude-3-haiku-20240307';
    return anthropic(modelId);
}

function getGenerationModel() {
    const modelId = process.env.COPILOT_GENERATION_MODEL || 'claude-3-haiku-20240307';
    return anthropic(modelId);
}

const MAX_TOKENS = parseInt(process.env.COPILOT_MAX_TOKENS || '4096', 10);

// ─── Layer 1: Intent Router Schema ────────────────────────────────────
const IntentSchema = z.object({
    intent: z.enum([
        'greeting', 'question', 'quiz', 'generate',
        'summarize', 'explain', 'revise', 'flashcard', 'follow-up'
    ]),
    topic: z.string().describe('The main subject or topic extracted from the message'),
    requiresRAG: z.boolean().describe('Whether we need to search the vector database for this request'),
});

// ─── Layer 2: Retrieval Helper ────────────────────────────────────────
// Tries vector similarity search first, falls back to full-text search.

async function retrieveContext(
    topic: string,
    subjectSlug?: string,
    resourceId?: string,
): Promise<string> {
    // Skip if Supabase isn't configured
    if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url_here'
    ) {
        return '';
    }

    // ── Strategy 1: Vector similarity search (pgvector) ──────────
    try {
        const { embedQuery } = await import('@/lib/copilot/embeddings');
        const queryEmbedding = await embedQuery(topic);

        if (queryEmbedding) {
            const { data, error } = await supabase.rpc('match_document_chunks', {
                query_embedding: `[${queryEmbedding.join(',')}]`,
                match_threshold: 0.45,
                match_count: 5,
                filter_subject: subjectSlug || null,
                filter_resource: resourceId || null,
            });

            if (!error && data && data.length > 0) {
                console.log(`[RAG] Vector search found ${data.length} chunks (similarity: ${data[0].similarity.toFixed(3)})`);
                return data
                    .map((chunk: { title: string; chapter: string; content: string; file_name: string; similarity: number }, i: number) =>
                        `[Source ${i + 1}: ${chunk.title} — ${chunk.chapter} (${chunk.file_name}, relevance: ${(chunk.similarity * 100).toFixed(0)}%)]\n${chunk.content}`
                    )
                    .join('\n\n---\n\n');
            }
        }
    } catch (e) {
        console.warn('[RAG] Vector search unavailable, trying text search:', e instanceof Error ? e.message : e);
    }

    // ── Strategy 2: Postgres full-text search fallback ────────────
    try {
        const searchTerms = topic.split(/\s+/).filter(w => w.length > 2).join(' | ');
        if (!searchTerms) return '';

        let query = supabase
            .from('document_chunks')
            .select('title, chapter, content, file_name')
            .textSearch('content', searchTerms, { type: 'plain', config: 'english' });

        if (subjectSlug) {
            query = query.eq('subject_slug', subjectSlug);
        }

        const { data } = await query.limit(5);

        if (data && data.length > 0) {
            console.log(`[RAG] Full-text search found ${data.length} chunks`);
            return data
                .map((doc: { title: string; chapter: string; content: string; file_name: string }, i: number) =>
                    `[Source ${i + 1}: ${doc.title} — ${doc.chapter} (${doc.file_name})]\n${doc.content}`
                )
                .join('\n\n---\n\n');
        }
    } catch (e) {
        console.warn('[RAG] Full-text search failed:', e);
    }

    return '';
}

// ─── Layer 3: System Prompt Builder ───────────────────────────────────

function buildSystemPrompt(
    intent: string,
    topic: string,
    contextDocs: string,
    pageContext?: { title?: string; type?: string; content?: string } | null,
    subjectContext?: { title?: string; slug?: string } | null,
): string {
    let systemPrompt = `You are EzCA Copilot, a premium AI study assistant for Chartered Accountancy students in India.
You are professional, encouraging, and highly knowledgeable about CA Foundation subjects (Business Laws, Business Economics, Accounting, Quantitative Aptitude).
Never break character. Do not admit you are an AI model unless directly asked.
Always provide accurate, exam-oriented information. Use proper markdown formatting.

`;

    // Page context awareness
    if (pageContext?.content) {
        systemPrompt += `IMPORTANT — The user is currently viewing study material. Here is the content they can see:\n\n"""${pageContext.content.slice(0, 6000)}"""\n\nIf the user asks about "this page", "this", "this chapter", or similar, they are referring to the content above. Use it directly to answer.\n\n`;
    } else if (pageContext?.title) {
        systemPrompt += `The user is currently viewing: "${pageContext.title}" (${pageContext.type || 'document'}). Relate your answers to this resource when relevant.\n\n`;
    }

    // Subject context
    if (subjectContext?.title) {
        systemPrompt += `Active subject: ${subjectContext.title}. Tailor your responses to this subject area.\n\n`;
    }

    // RAG context
    if (contextDocs) {
        systemPrompt += `The following documents from EzCA's study materials are relevant to the user's query. Ground your response in these when applicable:\n\n${contextDocs}\n\n`;
    }

    // Intent-specific routing
    switch (intent) {
        case 'greeting':
            systemPrompt += `The user is greeting you. Keep your response brief (1-2 sentences), friendly, and natural. Suggest 1-2 quick study actions they can take. Do NOT output any JSON blocks.`;
            break;

        case 'quiz':
            systemPrompt += `The user wants a quiz on "${topic}".
Generate exactly 3 CA Foundation-level multiple choice questions.
You MUST start your response with exactly this JSON block:

[TOOL_RESULT]
{
  "type": "quiz",
  "data": [
    {
      "id": "q1",
      "question": "A real CA Foundation exam-style question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why this answer is correct."
    },
    {
      "id": "q2",
      "question": "Second question here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Explanation for Q2."
    },
    {
      "id": "q3",
      "question": "Third question here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "Explanation for Q3."
    }
  ]
}
[/TOOL_RESULT]

After the JSON block, add a brief friendly message like "Here's a quick quiz for you! Test your knowledge 📝"`;
            break;

        case 'flashcard':
            systemPrompt += `The user wants flashcards on "${topic}".
Generate exactly 5 study flashcards with term and definition.
You MUST start your response with exactly this JSON block:

[TOOL_RESULT]
{
  "type": "flashcard",
  "data": [
    { "id": "c1", "term": "Term 1", "definition": "Clear, concise definition" },
    { "id": "c2", "term": "Term 2", "definition": "Definition 2" },
    { "id": "c3", "term": "Term 3", "definition": "Definition 3" },
    { "id": "c4", "term": "Term 4", "definition": "Definition 4" },
    { "id": "c5", "term": "Term 5", "definition": "Definition 5" }
  ]
}
[/TOOL_RESULT]

After the JSON block, say something like "I've created a deck of flashcards for you! Tap each card to flip it. 🎴"`;
            break;

        case 'summarize':
            systemPrompt += `The user wants a summary of "${topic}". Provide a concise, high-yield summary using markdown:
- Use bullet points for key concepts
- Highlight important terms in **bold**
- Focus on CA exam-relevant content
- Keep it scannable and revision-friendly
Do NOT output any JSON blocks.`;
            break;

        case 'explain':
            systemPrompt += `The user wants an explanation of "${topic}". Provide a clear, student-friendly explanation:
- Start with a simple definition
- Use analogies where helpful
- Give a practical example
- Mention exam relevance
Do NOT output any JSON blocks.`;
            break;

        case 'revise':
            systemPrompt += `The user wants revision notes on "${topic}". Create structured, exam-oriented revision notes:
- Key definitions
- Important points (numbered)
- Common exam traps or mistakes
- Quick memory aids or mnemonics
Format with clear markdown headings and bullet points. Do NOT output any JSON blocks.`;
            break;

        case 'generate':
            systemPrompt += `The user wants to generate study content about "${topic}". Create well-structured, useful study material based on what they asked for (notes, study plan, schedule, etc.). Use markdown formatting. Do NOT output any JSON blocks.`;
            break;

        case 'follow-up':
            systemPrompt += `The user is asking a follow-up question. Use the conversation history to maintain context and provide a coherent continuation. Do NOT output any JSON blocks.`;
            break;

        case 'question':
        default:
            if (contextDocs) {
                systemPrompt += `Answer the user's question about "${topic}" using the context documents provided above. Be specific and cite relevant sections. If the documents don't contain enough information, supplement with your knowledge but mention this clearly. Do NOT output any JSON blocks.`;
            } else {
                systemPrompt += `Answer the user's question about "${topic}" accurately. Since no specific documents were found, use your extensive knowledge of CA Foundation subjects. Be helpful and precise. Do NOT output any JSON blocks.`;
            }
            break;
    }

    return systemPrompt;
}

// ─── Layer 4: Validation ──────────────────────────────────────────────

function validateResponse(content: string, intent: string): string {
    // For RAG-backed responses, check if the model indicated uncertainty
    if (intent === 'question' && content.toLowerCase().includes('i don\'t have')) {
        return content + '\n\n> 💡 *Tip: EzCA\'s knowledge base is growing. Check your study PDFs for the most accurate reference.*';
    }
    return content;
}

// ─── Layer 5: Memory (DB Logging) ─────────────────────────────────────

async function logUsage(
    conversationId: string | null,
    intent: string,
    modelUsed: string,
    tokensIn: number,
    tokensOut: number,
    latencyMs: number,
) {
    try {
        if (
            process.env.NEXT_PUBLIC_SUPABASE_URL &&
            process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url_here'
        ) {
            await supabase.from('usage_logs').insert({
                conversation_id: conversationId,
                intent,
                model_used: modelUsed,
                tokens_in: tokensIn,
                tokens_out: tokensOut,
                latency_ms: latencyMs,
            });
        }
    } catch (e) {
        console.warn('Usage logging failed:', e);
    }
}

// ─── Main API Handler ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        const body = await req.json();
        const { messages, subjectContext, pageContext, conversationId } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
        }

        const latestMessage = messages[messages.length - 1].content;

        // ── Check API Key ────────────────────────────────────────────
        if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(
                        new TextEncoder().encode(
                            '⚠️ **API Key Required**\n\nThe `ANTHROPIC_API_KEY` environment variable is not configured. Please add your Claude API key to `.env.local` to enable the AI Copilot.\n\n```\nANTHROPIC_API_KEY=sk-ant-...\n```'
                        )
                    );
                    controller.close();
                },
            });
            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'X-Copilot-Intent': 'error',
                },
            });
        }

        // ── Layer 1: Intent Classification ───────────────────────────
        const classifierModel = getClassifierModel();
        const { object: intentData } = await generateObject({
            model: classifierModel,
            schema: IntentSchema,
            prompt: `Classify the user's latest message into one of the intent types.

Active Subject: ${subjectContext?.title || 'None'}
Active Resource: ${pageContext?.title || 'None'}
Conversation has ${messages.length} messages.

Latest Message: "${latestMessage}"

Rules:
- "greeting" = simple hi/hello/hey with no question
- "quiz" = user wants quiz, MCQ, test questions, practice
- "flashcard" = user wants flashcards, study cards, flip cards
- "summarize" = user wants a summary, key points, TLDR
- "explain" = user wants an explanation, clarification, definition
- "revise" = user wants revision notes, cheat sheet, quick review
- "generate" = user wants notes, study plan, schedule, material created
- "follow-up" = short message referencing previous context (e.g. "more", "continue", "what about X")
- "question" = any other knowledge question

Set requiresRAG to true for question, explain, summarize, revise intents. False for greeting, quiz, flashcard, generate, follow-up.`,
        });

        // ── Layer 2: Retrieval ───────────────────────────────────────
        let contextDocs = '';
        if (intentData.requiresRAG) {
            contextDocs = await retrieveContext(
                intentData.topic,
                subjectContext?.slug
            );
        }

        // ── Layer 3: Build System Prompt ─────────────────────────────
        const systemPrompt = buildSystemPrompt(
            intentData.intent,
            intentData.topic,
            contextDocs,
            pageContext,
            subjectContext,
        );

        // ── Layer 3: Generate Streamed Response ──────────────────────
        const genModel = getGenerationModel();
        const result = streamText({
            model: genModel,
            system: systemPrompt,
            messages: messages.map((m: { role: string; content: string }) => ({
                role: m.role as 'user' | 'assistant' | 'system',
                content: m.content,
            })),
            maxOutputTokens: MAX_TOKENS,
            temperature: intentData.intent === 'quiz' || intentData.intent === 'flashcard' ? 0.6 : 0.7,
        });

        // ── Layer 5: Log usage (non-blocking) ───────────────────────
        const modelUsed = process.env.COPILOT_GENERATION_MODEL || 'claude-3-haiku-20240307';
        logUsage(conversationId || null, intentData.intent, modelUsed, 0, 0, Date.now() - startTime);

        // Stream the response back
        return result.toTextStreamResponse({
            headers: {
                'X-Copilot-Intent': intentData.intent,
            },
        });
    } catch (error) {
        console.error('Copilot API error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Internal server error', details: message },
            { status: 500 }
        );
    }
}
