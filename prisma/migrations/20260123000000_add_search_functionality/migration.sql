-- Enable pg_trgm extension for fuzzy/trigram search (handles typos and partial matches)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for full-text search on videos table
-- These indexes dramatically improve search performance using trigram matching

-- Index for searching video titles with fuzzy matching
CREATE INDEX IF NOT EXISTS videos_title_trgm_idx ON videos USING gin (title gin_trgm_ops);

-- Index for searching video descriptions with fuzzy matching
CREATE INDEX IF NOT EXISTS videos_description_trgm_idx ON videos USING gin (description gin_trgm_ops);

-- Index for searching tags array with fuzzy matching
CREATE INDEX IF NOT EXISTS videos_tags_trgm_idx ON videos USING gin (tags gin_trgm_ops);

-- Create a composite tsvector index for advanced full-text search
-- This combines title and description into a single searchable text vector
CREATE INDEX IF NOT EXISTS videos_search_vector_idx ON videos USING gin (
  to_tsvector('english', 
    title || ' ' || COALESCE(description, '')
  )
);

-- Optional: Create a function for weighted search scoring
-- This gives more importance to title matches than description matches
CREATE OR REPLACE FUNCTION videos_search_rank(
  video_title TEXT,
  video_description TEXT,
  search_query TEXT
) RETURNS FLOAT AS $$
BEGIN
  RETURN (
    -- Title match score (weighted 3x)
    (similarity(video_title, search_query) * 3) +
    -- Description match score (weighted 1x)
    (similarity(COALESCE(video_description, ''), search_query) * 1)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE;

-- Create index on tags table for searching tag names
CREATE INDEX IF NOT EXISTS tags_name_trgm_idx ON tags USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS tags_slug_trgm_idx ON tags USING gin (slug gin_trgm_ops);
