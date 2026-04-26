// ─── RAG Retriever (Supabase pgvector + Keyword Fallback) ─────────────
// Searches documents via pgvector similarity when configured, otherwise
// falls back to keyword matching against mockResources.

import { supabase } from '@/lib/supabase';
import { mockResources } from '@/lib/data';
import type { SourceCitation } from './types';

export interface ContentRetriever {
    search(query: string, subjectSlug?: string): Promise<SourceCitation[]>;
}

// ─── Supabase pgvector Retriever ───────────────────────────────────────

export const vectorRetriever: ContentRetriever = {
    async search(query: string, subjectSlug?: string): Promise<SourceCitation[]> {
        try {
            // Check if Supabase is configured
            if (
                !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url_here'
            ) {
                return keywordRetriever.search(query, subjectSlug);
            }

            // First try text-based search in documents table
            let dbQuery = supabase
                .from('documents')
                .select('id, resource_id, title, chapter, content, subject_slug, metadata')
                .textSearch('content', query.split(/\s+/).filter(w => w.length > 2).join(' & '), {
                    type: 'plain',
                    config: 'english',
                });

            if (subjectSlug) {
                dbQuery = dbQuery.eq('subject_slug', subjectSlug);
            }

            const { data: textResults } = await dbQuery.limit(5);

            if (textResults && textResults.length > 0) {
                return textResults.map((doc) => ({
                    resourceId: doc.resource_id,
                    title: doc.title,
                    chapter: doc.chapter,
                    type: ((doc.metadata as Record<string, unknown>)?.type as 'pdf' | 'audio') || 'pdf',
                    fileUrl: (doc.metadata as Record<string, unknown>)?.fileUrl as string | undefined,
                    relevanceScore: 0.85,
                    // Attach content snippet for RAG context
                    _content: doc.content,
                })) as (SourceCitation & { _content?: string })[];
            }

            // Fall back to keyword retriever if no documents indexed yet
            return keywordRetriever.search(query, subjectSlug);
        } catch {
            // On any DB error, fall back to keyword search
            return keywordRetriever.search(query, subjectSlug);
        }
    },
};

// ─── Keyword Fallback Retriever ────────────────────────────────────────

export const keywordRetriever: ContentRetriever = {
    async search(query: string, subjectSlug?: string): Promise<SourceCitation[]> {
        const q = query.toLowerCase();
        const keywords = q.split(/\s+/).filter((w) => w.length > 2);

        const results: (SourceCitation & { score: number })[] = [];

        const slugsToSearch = subjectSlug
            ? [subjectSlug]
            : Object.keys(mockResources);

        for (const slug of slugsToSearch) {
            const resources = mockResources[slug] || [];
            for (const res of resources) {
                const titleLower = res.title.toLowerCase();
                const chapterLower = res.chapter.toLowerCase();
                const combined = `${titleLower} ${chapterLower}`;

                let score = 0;
                for (const kw of keywords) {
                    if (combined.includes(kw)) score += 1;
                }

                // Boost exact phrase match
                if (combined.includes(q)) score += 3;

                if (score > 0) {
                    results.push({
                        resourceId: res.id,
                        title: res.title,
                        chapter: res.chapter,
                        type: res.type,
                        fileUrl: res.fileUrl,
                        relevanceScore: score,
                        score,
                    });
                }
            }
        }

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(({ score: _score, ...citation }) => citation);
    },
};
