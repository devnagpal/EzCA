// ─── RAG Retriever (Stub) ──────────────────────────────────────────────
// Searches mockResources by keyword matching against title/chapter.
// Interface ready for pgvector integration later.

import { mockResources } from '@/lib/data';
import type { SourceCitation } from './types';

export interface ContentRetriever {
    search(query: string, subjectSlug?: string): Promise<SourceCitation[]>;
}

/**
 * Keyword-based retriever that searches across mock resources.
 * Returns relevant resources as source citations.
 */
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
