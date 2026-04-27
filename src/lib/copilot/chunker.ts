// ─── Text Chunker ──────────────────────────────────────────────────────
// Splits extracted document text into overlapping chunks for embedding.
// Designed for study materials: respects paragraph boundaries when possible.

export interface ChunkOptions {
    /** Target chunk size in characters (default: 1500 ≈ ~375 tokens) */
    chunkSize?: number;
    /** Overlap between chunks in characters (default: 200) */
    overlap?: number;
    /** Minimum chunk size to keep (default: 100) */
    minChunkSize?: number;
}

export interface TextChunk {
    /** The text content of this chunk */
    content: string;
    /** Zero-based index of this chunk within the document */
    chunkIndex: number;
    /** Estimated page range (if page markers are available) */
    pageRange?: string;
    /** Character offset in the original text */
    startOffset: number;
    /** Character end offset in the original text */
    endOffset: number;
}

/**
 * Split text into overlapping chunks, respecting paragraph boundaries.
 */
export function chunkText(text: string, options: ChunkOptions = {}): TextChunk[] {
    const {
        chunkSize = 1500,
        overlap = 200,
        minChunkSize = 100,
    } = options;

    if (!text || text.trim().length < minChunkSize) {
        return text?.trim()
            ? [{ content: text.trim(), chunkIndex: 0, startOffset: 0, endOffset: text.length }]
            : [];
    }

    // Clean the text: normalize whitespace, remove excessive newlines
    const cleaned = text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    const chunks: TextChunk[] = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < cleaned.length) {
        let end = Math.min(start + chunkSize, cleaned.length);

        // Try to break at a paragraph boundary
        if (end < cleaned.length) {
            const searchWindow = cleaned.substring(end - 200, end + 100);
            const paragraphBreak = searchWindow.lastIndexOf('\n\n');
            if (paragraphBreak !== -1) {
                end = (end - 200) + paragraphBreak;
            } else {
                // Fall back to sentence boundary
                const sentenceBreak = searchWindow.search(/[.!?]\s/);
                if (sentenceBreak !== -1) {
                    end = (end - 200) + sentenceBreak + 1;
                }
            }
        }

        const content = cleaned.substring(start, end).trim();

        if (content.length >= minChunkSize) {
            chunks.push({
                content,
                chunkIndex,
                startOffset: start,
                endOffset: end,
            });
            chunkIndex++;
        }

        // Move forward with overlap
        start = end - overlap;
        if (start >= cleaned.length) break;
        // Prevent infinite loops
        if (end >= cleaned.length) break;
    }

    return chunks;
}

/**
 * Estimate page numbers from character offsets.
 * Assumes ~3000 characters per page (typical for study PDFs).
 */
export function estimatePageRange(
    startOffset: number,
    endOffset: number,
    charsPerPage = 3000
): string {
    const startPage = Math.floor(startOffset / charsPerPage) + 1;
    const endPage = Math.floor(endOffset / charsPerPage) + 1;
    return startPage === endPage ? `${startPage}` : `${startPage}-${endPage}`;
}
