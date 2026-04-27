// ─── Embedding Provider (Modular & Swappable) ──────────────────────────
// Uses @xenova/transformers with all-MiniLM-L6-v2 (384 dimensions) locally.
// To swap to OpenAI or another provider, implement EmbeddingProvider and
// change getEmbeddingProvider() — no other code needs to change.

// ─── Provider Interface ────────────────────────────────────────────────

export interface EmbeddingProvider {
    /** Vector dimensionality (384 for MiniLM, 1536 for OpenAI, etc.) */
    readonly dimensions: number;
    /** Human-readable model name */
    readonly modelName: string;
    /** Embed a single text string */
    embed(text: string): Promise<number[]>;
    /** Embed multiple texts in a batch */
    embedBatch(texts: string[]): Promise<number[][]>;
}

// ─── Local Transformers.js Provider ────────────────────────────────────

let _localProvider: EmbeddingProvider | null = null;
let _initPromise: Promise<EmbeddingProvider | null> | null = null;

async function createLocalProvider(): Promise<EmbeddingProvider | null> {
    try {
        // Dynamic import to avoid bundling issues in Next.js client code
        const { pipeline } = await import('@xenova/transformers');

        console.log('[Embeddings] Loading all-MiniLM-L6-v2 model...');
        const extractor = await pipeline(
            'feature-extraction',
            'Xenova/all-MiniLM-L6-v2',
            { quantized: true } // Use quantized model for speed
        );
        console.log('[Embeddings] Model loaded successfully.');

        const provider: EmbeddingProvider = {
            dimensions: 384,
            modelName: 'all-MiniLM-L6-v2',

            async embed(text: string): Promise<number[]> {
                const output = await extractor(text, {
                    pooling: 'mean',
                    normalize: true,
                });
                return Array.from(output.data as Float32Array);
            },

            async embedBatch(texts: string[]): Promise<number[][]> {
                const results: number[][] = [];
                // Process in small batches to avoid memory issues
                for (const text of texts) {
                    const output = await extractor(text, {
                        pooling: 'mean',
                        normalize: true,
                    });
                    results.push(Array.from(output.data as Float32Array));
                }
                return results;
            },
        };

        return provider;
    } catch (err) {
        console.warn('[Embeddings] Failed to load local model:', err);
        return null;
    }
}

/**
 * Get the singleton embedding provider.
 * Returns null if the model cannot be loaded (e.g., on Vercel serverless).
 * In that case, the system falls back to Postgres full-text search.
 */
export async function getEmbeddingProvider(): Promise<EmbeddingProvider | null> {
    if (_localProvider) return _localProvider;
    if (_initPromise) return _initPromise;

    _initPromise = createLocalProvider();
    _localProvider = await _initPromise;
    _initPromise = null;
    return _localProvider;
}

/**
 * Convenience: embed a single query string.
 * Returns null if no provider is available.
 */
export async function embedQuery(text: string): Promise<number[] | null> {
    const provider = await getEmbeddingProvider();
    if (!provider) return null;
    return provider.embed(text);
}

/** Current embedding dimensions (for schema validation) */
export const EMBEDDING_DIMENSIONS = 384;
