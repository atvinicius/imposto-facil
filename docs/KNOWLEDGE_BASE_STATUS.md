# Knowledge Base Improvement - Status

Last updated: 2026-02-06

## What's Completed

### 1. Ingestion Pipeline (`scripts/knowledge-base/`)

| File | Purpose |
|------|---------|
| `types.ts` | Type definitions and Zod schemas |
| `chunker.ts` | Section-aware text chunking (500 tokens, 50 overlap) |
| `validator.ts` | Content validation (frontmatter, word count, citations) |
| `ingest.ts` | Main ingestion with OpenAI embeddings |
| `verify-sources.ts` | URL accessibility verification |
| `test-search.ts` | Search quality test cases |

### 2. Database Enhancement

- `supabase/migrations/00002_enhanced_content_chunks.sql`
  - New columns: `section_title`, `chunk_index`, `source_hash`, `difficulty`, `updated_at`
  - Updated `match_content_chunks` with category/difficulty filtering
  - Updated `search_content` with filtering
  - New `get_content_stats` function
  - New `find_related_content` function

- `src/types/database.ts` - Updated TypeScript types
- `src/lib/embeddings/search.ts` - Metadata support, filtering, `extractSources()`, `formatForContext()`

### 3. Content Updates (all 5 MDX files enhanced)

All files now have:
- Enhanced frontmatter (sources, lastVerified, difficulty, searchKeywords, commonQuestions, relatedArticles)
- Source citations to EC 132/2023 and LC 214/2025
- Improved content with official references

Files:
- `src/content/ibs/introducao.mdx`
- `src/content/cbs/introducao.mdx`
- `src/content/is/introducao.mdx`
- `src/content/transicao/cronograma.mdx`
- `src/content/glossario/termos-basicos.mdx`

### 4. Source Management

- `src/content/sources.json` - Registry of 8 official sources (EC 132/2023, LC 214/2025, RFB, etc.)
- `.github/workflows/verify-sources.yml` - Weekly GitHub Action for URL verification

### 5. Package Updates

**Dependencies added:**
- `tsx` (dev) - Run TypeScript directly
- `dotenv` (dev) - Load environment variables

**NPM scripts added:**
```bash
npm run kb:ingest        # Full ingestion to database
npm run kb:ingest:dry    # Preview without writing
npm run kb:ingest:force  # Force re-ingest all content
npm run kb:validate      # Validate all content
npm run kb:verify-sources # Check source URLs
npm run kb:test-search   # Test search quality
```

---

## Immediate Next Steps (to make AI chat work)

### Step 1: Run Database Migration

In Supabase SQL Editor, run:
```
supabase/migrations/00002_enhanced_content_chunks.sql
```

### Step 2: Run Ingestion

```bash
npm run kb:ingest
```

This will:
- Parse all MDX files
- Validate frontmatter
- Chunk content into sections
- Generate OpenAI embeddings
- Insert into `content_chunks` table

### Step 3: Test Search

```bash
npm run kb:test-search
```

Or test with a specific query:
```bash
npm run kb:test-search "O que e o IBS?"
```

---

## What Remains (from original plan)

### Phase 5: Content Expansion (not started)

**Priority 1 - Core (15 articles):**

| Category | Articles to create |
|----------|-------------------|
| IBS | aliquotas, creditos, comite-gestor, split-payment, nota-fiscal, cashback |
| CBS | aliquotas, creditos, regimes-especiais, obrigacoes, pis-cofins-comparativo |
| IS | aliquotas-produtos, bebidas, veiculos, mineracao |

**Priority 2 - Sector Guides (8 articles):**
- industria, comercio-varejo, servicos, tecnologia, saude, educacao, agronegocio, transporte

**Priority 3 - Transition (5 articles):**
- 2026-preparacao, 2027-2028-convivencia, 2029-2032-reducao, beneficios-fiscais, fundo-compensacao

**Priority 4 - FAQ (10 articles):**
- simples-nacional, mei, lucro-presumido, zona-franca, exportacoes, importacoes, e-commerce, nfe-nova, creditos-acumulados, planejamento

### Phase 6: UI Enhancement (not started)

- Source display component for article pages
- "View Official Source" links with icons
- Last verified date display
- Related articles sidebar

### Phase 7: Quality Assurance (not started)

- Pre-commit hook for content validation
- Automated search regression testing
- Content freshness monitoring

---

## File Structure Created

```
scripts/knowledge-base/
├── types.ts
├── chunker.ts
├── validator.ts
├── ingest.ts
├── verify-sources.ts
└── test-search.ts

src/content/
├── sources.json
├── ibs/introducao.mdx (updated)
├── cbs/introducao.mdx (updated)
├── is/introducao.mdx (updated)
├── transicao/cronograma.mdx (updated)
└── glossario/termos-basicos.mdx (updated)

supabase/migrations/
├── 00001_initial_schema.sql (existing)
└── 00002_enhanced_content_chunks.sql (new)

.github/workflows/
└── verify-sources.yml (new)
```

---

## Environment Variables Required

For ingestion scripts to work:
```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
```

---

## Verification

Run `npm run kb:ingest:dry` to verify setup:
```
🚀 Knowledge Base Ingestion
══════════════════════════════════════════════════
🔍 DRY RUN MODE - No changes will be made

📁 Found 5 MDX files
📖 Parsing content...
🔍 Validating content...
   ✅ All files valid (0 warnings)

📊 Dry run statistics:
   Total chunks: 23
```
