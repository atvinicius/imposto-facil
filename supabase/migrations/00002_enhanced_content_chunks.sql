-- ============================================
-- Enhanced Content Chunks Schema
-- Adds metadata fields for better search and source tracking
-- ============================================

-- Step 1: Add new columns to content_chunks
ALTER TABLE public.content_chunks
ADD COLUMN IF NOT EXISTS section_title TEXT,
ADD COLUMN IF NOT EXISTS chunk_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS source_hash TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'basico' CHECK (difficulty IN ('basico', 'intermediario', 'avancado')),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_content_chunks_difficulty ON public.content_chunks(difficulty);
CREATE INDEX IF NOT EXISTS idx_content_chunks_source_hash ON public.content_chunks(source_hash);
CREATE INDEX IF NOT EXISTS idx_content_chunks_section_title ON public.content_chunks(section_title) WHERE section_title IS NOT NULL;

-- Step 3: Add trigger for updated_at
DROP TRIGGER IF EXISTS update_content_chunks_updated_at ON public.content_chunks;
CREATE TRIGGER update_content_chunks_updated_at
  BEFORE UPDATE ON public.content_chunks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 4: Update match_content_chunks function to return metadata
CREATE OR REPLACE FUNCTION public.match_content_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5,
  filter_category text DEFAULT NULL,
  filter_difficulty text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source_path text,
  title text,
  section_title text,
  category text,
  content text,
  similarity float,
  difficulty text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.source_path,
    cc.title,
    cc.section_title,
    cc.category,
    cc.content,
    1 - (cc.embedding <=> query_embedding) AS similarity,
    cc.difficulty,
    cc.metadata
  FROM public.content_chunks cc
  WHERE cc.embedding IS NOT NULL
    AND 1 - (cc.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR cc.category = filter_category)
    AND (filter_difficulty IS NULL OR cc.difficulty = filter_difficulty)
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Step 5: Update search_content function to return metadata
CREATE OR REPLACE FUNCTION public.search_content(
  search_query text,
  filter_category text DEFAULT NULL,
  filter_difficulty text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source_path text,
  title text,
  section_title text,
  category text,
  content text,
  rank float,
  difficulty text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.source_path,
    cc.title,
    cc.section_title,
    cc.category,
    cc.content,
    ts_rank(cc.search_vector, websearch_to_tsquery('portuguese', search_query))::float AS rank,
    cc.difficulty,
    cc.metadata
  FROM public.content_chunks cc
  WHERE cc.search_vector @@ websearch_to_tsquery('portuguese', search_query)
    AND (filter_category IS NULL OR cc.category = filter_category)
    AND (filter_difficulty IS NULL OR cc.difficulty = filter_difficulty)
  ORDER BY rank DESC
  LIMIT 20;
END;
$$;

-- Step 6: Create function to get content stats
CREATE OR REPLACE FUNCTION public.get_content_stats()
RETURNS TABLE (
  category text,
  chunk_count bigint,
  article_count bigint,
  avg_similarity float
)
LANGUAGE sql
AS $$
  SELECT
    category,
    COUNT(*) as chunk_count,
    COUNT(DISTINCT source_path) as article_count,
    0.0::float as avg_similarity
  FROM public.content_chunks
  GROUP BY category
  ORDER BY chunk_count DESC;
$$;

-- Step 7: Create function to find related content
CREATE OR REPLACE FUNCTION public.find_related_content(
  chunk_id uuid,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  source_path text,
  title text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  source_embedding vector(1536);
BEGIN
  -- Get the embedding of the source chunk
  SELECT embedding INTO source_embedding
  FROM public.content_chunks
  WHERE public.content_chunks.id = chunk_id;

  IF source_embedding IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    cc.id,
    cc.source_path,
    cc.title,
    cc.category,
    1 - (cc.embedding <=> source_embedding) AS similarity
  FROM public.content_chunks cc
  WHERE cc.id != chunk_id
    AND cc.embedding IS NOT NULL
  ORDER BY cc.embedding <=> source_embedding
  LIMIT match_count;
END;
$$;

-- Step 8: Grant permissions
GRANT EXECUTE ON FUNCTION public.get_content_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_related_content(uuid, int) TO anon, authenticated;
