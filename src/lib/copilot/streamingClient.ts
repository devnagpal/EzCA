// ─── Streaming Client ──────────────────────────────────────────────────
// Client-side streaming consumer that talks to the Next.js API route.

import type { Message, SubjectContext, SourceCitation, ToolResult, PageContext } from './types';
import { keywordRetriever } from './ragRetriever';

export interface StreamCallbacks {
    onChunk: (chunk: string) => void;
    onSources: (sources: SourceCitation[]) => void;
    onToolResult: (result: ToolResult) => void;
    onComplete: (fullContent: string) => void;
    onError: (error: Error) => void;
}

/**
 * Sends a message and streams the response back via callbacks from the AI API route.
 */
export async function streamCopilotResponse(
    messages: Message[],
    context: SubjectContext | null,
    callbacks: StreamCallbacks,
    signal?: AbortSignal,
    pageContext?: PageContext | null
): Promise<void> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) {
        callbacks.onError(new Error('No user message found'));
        return;
    }

    try {
        // 1. Initial frontend retrieval (optional, could be fully moved to backend later)
        const sources = await keywordRetriever.search(
            lastUserMessage.content,
            context?.slug
        );
        if (sources.length > 0) {
            callbacks.onSources(sources.slice(0, 5));
        }

        // 2. Call the API route
        const response = await fetch('/api/copilot/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                subjectContext: context,
                pageContext,
                history: [] // the backend can reconstruct history from messages if needed
            }),
            signal,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        if (!response.body) {
            throw new Error('No readable stream in response');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let isToolBlock = false;
        let toolBuffer = '';

        // 3. Read the stream chunks
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (signal?.aborted) break;

            const chunk = decoder.decode(value, { stream: true });
            
            // Parse for [TOOL_RESULT] JSON injections
            let chunkToRender = chunk;

            if (chunk.includes('[TOOL_RESULT]')) {
                isToolBlock = true;
                const parts = chunk.split('[TOOL_RESULT]');
                chunkToRender = parts[0]; // Render anything before the block
                toolBuffer = parts[1] || '';
            } else if (isToolBlock) {
                if (chunk.includes('[/TOOL_RESULT]')) {
                    isToolBlock = false;
                    const parts = chunk.split('[/TOOL_RESULT]');
                    toolBuffer += parts[0];
                    
                    try {
                        const parsedTool = JSON.parse(toolBuffer);
                        callbacks.onToolResult(parsedTool);
                    } catch (e) {
                        console.error('Failed to parse tool result block:', e);
                    }
                    
                    toolBuffer = '';
                    chunkToRender = parts[1] || ''; // Render anything after the block
                } else {
                    toolBuffer += chunk;
                    chunkToRender = ''; // Don't render JSON parts
                }
            }

            if (chunkToRender && !isToolBlock) {
                fullContent += chunkToRender;
                callbacks.onChunk(chunkToRender);
            }
        }

        // Send the complete string (without tool json) back
        callbacks.onComplete(fullContent);
    } catch (err) {
        if (signal?.aborted) return;
        callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
}
