#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════════════════
// EzCA — Local Batch Ingestion Pipeline
// ═══════════════════════════════════════════════════════════════════════
//
// Scans the `content/` directory, extracts text from PDFs, chunks it,
// generates embeddings locally (all-MiniLM-L6-v2, 384 dims), and stores
// everything in Supabase/Postgres with pgvector.
//
// Usage:
//   npm run ingest                     # Process all subjects
//   npm run ingest -- --subject laws   # Process only 'laws' folder
//   npm run ingest -- --clear          # Clear all chunks before ingesting
//
// Directory structure expected:
//   content/
//     laws/
//       chapter1.pdf
//       chapter2.pdf
//     economics/
//       macro.pdf
//     accounting/
//       ...
//     qa/
//       ...
// ═══════════════════════════════════════════════════════════════════════

import { config } from 'dotenv';
import { resolve, join, basename, extname } from 'path';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load environment from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const CONTENT_DIR = resolve(process.cwd(), 'content');
const CHUNK_SIZE = 1500;   // ~375 tokens
const CHUNK_OVERLAP = 200;
const MIN_CHUNK_SIZE = 100;
const BATCH_SIZE = 10;     // Insert this many chunks at a time

// ─── Parse CLI args ────────────────────────────────────────────────────

const args = process.argv.slice(2);
const subjectFilter = args.includes('--subject')
    ? args[args.indexOf('--subject') + 1]
    : null;
const clearFirst = args.includes('--clear');

// ─── Supabase Client ──────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Text Chunking (inline to keep script self-contained) ─────────────

function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const cleaned = text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (cleaned.length < MIN_CHUNK_SIZE) {
        return cleaned.length > 0
            ? [{ content: cleaned, chunkIndex: 0, startOffset: 0, endOffset: cleaned.length }]
            : [];
    }

    const chunks = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < cleaned.length) {
        let end = Math.min(start + chunkSize, cleaned.length);

        if (end < cleaned.length) {
            const window = cleaned.substring(Math.max(0, end - 200), Math.min(cleaned.length, end + 100));
            const paraBreak = window.lastIndexOf('\n\n');
            if (paraBreak !== -1) {
                end = Math.max(0, end - 200) + paraBreak;
            } else {
                const sentBreak = window.search(/[.!?]\s/);
                if (sentBreak !== -1) {
                    end = Math.max(0, end - 200) + sentBreak + 1;
                }
            }
        }

        const content = cleaned.substring(start, end).trim();
        if (content.length >= MIN_CHUNK_SIZE) {
            chunks.push({ content, chunkIndex, startOffset: start, endOffset: end });
            chunkIndex++;
        }

        start = end - overlap;
        if (start >= cleaned.length || end >= cleaned.length) break;
    }

    return chunks;
}

function estimatePageRange(startOffset, endOffset, charsPerPage = 3000) {
    const s = Math.floor(startOffset / charsPerPage) + 1;
    const e = Math.floor(endOffset / charsPerPage) + 1;
    return s === e ? `${s}` : `${s}-${e}`;
}

// ─── PDF Text Extraction ──────────────────────────────────────────────

async function extractPdfText(filePath) {
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    const dataBuffer = readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
}

// ─── Embedding Generation ─────────────────────────────────────────────

let _extractor = null;

async function getExtractor() {
    if (_extractor) return _extractor;

    console.log('🔄 Loading embedding model (all-MiniLM-L6-v2)...');
    const { pipeline } = await import('@xenova/transformers');
    _extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
    });
    console.log('✅ Embedding model loaded (384 dimensions)');
    return _extractor;
}

async function generateEmbedding(text) {
    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

// ─── Main Ingestion Pipeline ──────────────────────────────────────────

async function ingest() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  EzCA — RAG Document Ingestion Pipeline');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    if (!existsSync(CONTENT_DIR)) {
        console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
        console.log('   Create it and add subject folders with PDFs:');
        console.log('   content/laws/chapter1.pdf');
        console.log('   content/economics/macro.pdf');
        console.log('   ...');
        process.exit(1);
    }

    // Clear existing chunks if requested
    if (clearFirst) {
        console.log('🗑️  Clearing existing document chunks...');
        if (subjectFilter) {
            await supabase.from('document_chunks').delete().eq('subject_slug', subjectFilter);
        } else {
            await supabase.from('document_chunks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
        console.log('   Done.\n');
    }

    // Discover subject folders
    const subjectDirs = readdirSync(CONTENT_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .filter(d => !subjectFilter || d.name === subjectFilter)
        .map(d => d.name);

    if (subjectDirs.length === 0) {
        console.log('⚠️  No subject folders found in content/');
        if (subjectFilter) console.log(`   (Filtered to: ${subjectFilter})`);
        process.exit(0);
    }

    console.log(`📚 Found ${subjectDirs.length} subject(s): ${subjectDirs.join(', ')}\n`);

    let totalChunks = 0;
    let totalFiles = 0;

    for (const subject of subjectDirs) {
        const subjectDir = join(CONTENT_DIR, subject);
        const pdfFiles = readdirSync(subjectDir)
            .filter(f => extname(f).toLowerCase() === '.pdf');

        if (pdfFiles.length === 0) {
            console.log(`  ⚠️  ${subject}: No PDF files found, skipping.`);
            continue;
        }

        console.log(`\n📂 Processing: ${subject} (${pdfFiles.length} file(s))`);
        console.log('─'.repeat(50));

        for (const pdfFile of pdfFiles) {
            const filePath = join(subjectDir, pdfFile);
            const fileName = basename(pdfFile, '.pdf');
            const resourceId = `${subject}-${fileName.replace(/\s+/g, '-').toLowerCase()}`;

            console.log(`\n  📄 ${pdfFile}`);

            // 1. Extract text
            let text;
            try {
                text = await extractPdfText(filePath);
                console.log(`     ✅ Extracted ${text.length.toLocaleString()} chars`);
            } catch (err) {
                console.error(`     ❌ Failed to extract: ${err.message}`);
                continue;
            }

            if (text.trim().length < MIN_CHUNK_SIZE) {
                console.log('     ⚠️  Text too short, skipping.');
                continue;
            }

            // 2. Check for existing chunks (skip if already indexed)
            const { count } = await supabase
                .from('document_chunks')
                .select('id', { count: 'exact', head: true })
                .eq('resource_id', resourceId);

            if (count && count > 0 && !clearFirst) {
                console.log(`     ⏭️  Already indexed (${count} chunks). Use --clear to re-index.`);
                continue;
            }

            // 3. Chunk the text
            const chunks = chunkText(text);
            console.log(`     📦 Split into ${chunks.length} chunks`);

            // 4. Generate embeddings & insert in batches
            const rows = [];
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                process.stdout.write(`     🧮 Embedding chunk ${i + 1}/${chunks.length}...\r`);

                const embedding = await generateEmbedding(chunk.content);

                rows.push({
                    resource_id: resourceId,
                    subject_slug: subject,
                    type: 'pdf',
                    title: fileName.replace(/-/g, ' ').replace(/_/g, ' '),
                    chapter: fileName,
                    chunk_index: chunk.chunkIndex,
                    content: chunk.content,
                    page_range: estimatePageRange(chunk.startOffset, chunk.endOffset),
                    file_name: pdfFile,
                    metadata: {
                        type: 'pdf',
                        charCount: chunk.content.length,
                        fileUrl: `/content/${subject}/${pdfFile}`,
                    },
                    embedding: `[${embedding.join(',')}]`,
                });

                // Flush batch
                if (rows.length >= BATCH_SIZE) {
                    const { error } = await supabase.from('document_chunks').insert(rows);
                    if (error) {
                        console.error(`\n     ❌ Insert error: ${error.message}`);
                    }
                    totalChunks += rows.length;
                    rows.length = 0;
                }
            }

            // Flush remaining
            if (rows.length > 0) {
                const { error } = await supabase.from('document_chunks').insert(rows);
                if (error) {
                    console.error(`\n     ❌ Insert error: ${error.message}`);
                }
                totalChunks += rows.length;
            }

            console.log(`     ✅ Indexed ${chunks.length} chunks                `);
            totalFiles++;
        }
    }

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  ✅ Ingestion Complete`);
    console.log(`  📄 Files processed: ${totalFiles}`);
    console.log(`  📦 Chunks indexed:  ${totalChunks}`);
    console.log(`  🧮 Embedding model: all-MiniLM-L6-v2 (384 dims)`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 Next: If this is your first ingestion, create the IVFFlat index:');
    console.log('   Run in Supabase SQL Editor:');
    console.log('   CREATE INDEX document_chunks_embedding_idx');
    console.log('     ON document_chunks');
    console.log('     USING ivfflat (embedding vector_cosine_ops)');
    console.log('     WITH (lists = 100);');
    console.log('');
}

ingest().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
