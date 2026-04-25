import { NextRequest, NextResponse } from 'next/server';
import { streamText, generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

export const maxDuration = 60;

// ─── Intent Router Schema ──────────────────────────────────────────────
const IntentSchema = z.object({
    intent: z.enum([
        'greeting', 'question', 'quiz', 'generate',
        'summarize', 'explain', 'revise', 'flashcard', 'follow-up'
    ]),
    topic: z.string().describe('The main subject or topic extracted from the message'),
    requiresRAG: z.boolean().describe('Whether we need to search the vector database for this request'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, subjectContext, pageContext, history } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
        }

        const latestMessage = messages[messages.length - 1].content;
        const allMessages = [...(history || []), ...messages];

        // Ensure API Key is available
        if (!process.env.ANTHROPIC_API_KEY) {
            // Fallback to a mock response if no API key is provided, so the UI doesn't crash
            // while the user is setting up their environment.
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode('0:"API Error: ANTHROPIC_API_KEY is not set in your environment variables. Please add it to .env.local to enable the real AI Copilot."\n'));
                    controller.close();
                }
            });
            return new Response(stream, { headers: { 'Content-Type': 'text/plain' } });
        }

        // 1. Intent Router Layer
        // Using Haiku for fast intent classification
        const { object: intentData } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: IntentSchema,
            prompt: `Classify the user's latest message based on the context.
            Active Subject: ${subjectContext?.title || 'None'}
            Active Resource: ${pageContext?.title || 'None'}
            Latest Message: "${latestMessage}"
            `,
        });

        // 2. Retrieval Layer
        let contextDocs = "";
        if (intentData.requiresRAG) {
            // TODO: Implement pgvector similarity search here using Supabase
            // const embedding = await generateEmbedding(intentData.topic);
            // const { data } = await supabase.rpc('match_documents', { query_embedding: embedding, match_threshold: 0.78, match_count: 5 });
            contextDocs = "No vector database documents indexed yet. Rely on your base knowledge.";
        }

        // 3. Generation Layer Setup
        let systemPrompt = `You are EzCA Copilot, a premium AI study assistant for Chartered Accountancy students in India.
You are professional, encouraging, and highly knowledgeable about CA Foundation subjects (Business Laws, Economics, Accounting, Quantitative Aptitude).
Never break character. Do not admit you are an AI model unless directly asked.

`;

        if (pageContext) {
            systemPrompt += `The user is currently viewing a study resource: "${pageContext.title}" (${pageContext.type}). If relevant, explicitly relate your answers to this resource. `;
        }

        // 4. Intent-Specific Routing Instructions
        // We instruct the model to output our custom [TOOL_RESULT] JSON block to maintain compatibility with our UI
        if (intentData.intent === 'quiz') {
            systemPrompt += `
The user has requested a quiz on ${intentData.topic}. 
You MUST start your response with exactly this JSON block, and then provide a friendly text intro after it:
[TOOL_RESULT]
{
  "type": "quiz",
  "data": {
    "title": "Quiz: ${intentData.topic}",
    "questions": [
      {
        "id": "q1",
        "question": "Generate a real CA Foundation level question here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Explanation for the correct answer."
      },
      // Generate exactly 3 questions
    ]
  }
}
[/TOOL_RESULT]
Here's a quick quiz for you! Good luck!`;
        } else if (intentData.intent === 'flashcard') {
            systemPrompt += `
The user has requested flashcards on ${intentData.topic}. 
You MUST start your response with exactly this JSON block, and then provide a friendly text intro after it:
[TOOL_RESULT]
{
  "type": "flashcard",
  "data": {
    "title": "${intentData.topic} Flashcards",
    "cards": [
      {
        "id": "c1",
        "front": "Term 1",
        "back": "Detailed definition 1"
      },
      // Generate exactly 5 flashcards
    ]
  }
}
[/TOOL_RESULT]
I've created a deck of flashcards for you to review.`;
        } else if (intentData.intent === 'greeting') {
            systemPrompt += `The user is just greeting you. Keep your response extremely brief, friendly, and natural. Suggest 1 or 2 study actions they can take (e.g. "I can generate a quick quiz on Contract Law or summarize your current PDF"). Do not output any JSON.`;
        } else if (intentData.intent === 'summarize') {
            systemPrompt += `The user wants a summary of ${intentData.topic}. Provide a concise, high-yield summary using markdown bullet points. Focus on key CA exam concepts. Do not output any JSON.`;
        } else {
            systemPrompt += `Answer the user's request about ${intentData.topic}. If it's a question, use the context documents: ${contextDocs}. Be helpful and precise.`;
        }

        // 5. Memory Layer (Logging the conversation/message to Supabase)
        // In a production environment, we would insert the message into Supabase here before generating the response.
        // await supabase.from('messages').insert({ ... })

        // 6. Generate Streamed Response
        const result = streamText({
            model: anthropic('claude-3-haiku-20240307'), // Or claude-3-opus-20240229 for maximum reasoning
            system: systemPrompt,
            messages: allMessages,
            temperature: 0.7,
        });

        // Use the AI SDK's text stream format
        return result.toTextStreamResponse({
            headers: {
                'X-Copilot-Intent': intentData.intent,
            }
        });
    } catch (error) {
        console.error('Copilot API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
