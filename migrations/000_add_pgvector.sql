
-- ===================================================================
-- BMAD SUPABASE MIGRATION - Phase 1: Enable pgvector Extension
-- Created: July 21, 2025
-- Purpose: Enable vector similarity search capabilities
-- ===================================================================

-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Create custom vector similarity functions if needed
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS float AS $$
BEGIN
    RETURN 1 - (a <=> b);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function for normalized vector operations
CREATE OR REPLACE FUNCTION normalize_vector(v vector)
RETURNS vector AS $$
BEGIN
    RETURN v / sqrt(array_sum(array_agg(val * val)))
    FROM unnest(v::float[]) AS val;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON EXTENSION vector IS 'BMAD Health AI - Vector similarity search for RAG operations';
