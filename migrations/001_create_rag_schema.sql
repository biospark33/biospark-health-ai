
-- ===================================================================
-- BMAD SUPABASE MIGRATION - Phase 2: RAG Schema Creation
-- Created: July 21, 2025
-- Purpose: Create optimized RAG tables with vector search capabilities
-- ===================================================================

-- Create RAG knowledge base table with vector embeddings
CREATE TABLE IF NOT EXISTS rag_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_url TEXT,
    source_type VARCHAR(50) DEFAULT 'article',
    author TEXT,
    published_date TIMESTAMP WITH TIME ZONE,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
    metadata JSONB DEFAULT '{}',
    chunk_index INTEGER DEFAULT 0,
    parent_document_id UUID REFERENCES rag_documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create vector similarity index for fast retrieval
CREATE INDEX IF NOT EXISTS rag_documents_embedding_idx 
ON rag_documents USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Create additional indexes for filtering
CREATE INDEX IF NOT EXISTS rag_documents_source_type_idx ON rag_documents(source_type);
CREATE INDEX IF NOT EXISTS rag_documents_created_at_idx ON rag_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS rag_documents_is_active_idx ON rag_documents(is_active);
CREATE INDEX IF NOT EXISTS rag_documents_parent_id_idx ON rag_documents(parent_document_id);

-- Create RAG query logs for analytics and optimization
CREATE TABLE IF NOT EXISTS rag_query_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id TEXT,
    query_text TEXT NOT NULL,
    query_embedding vector(1536),
    results_count INTEGER DEFAULT 0,
    top_similarity_score FLOAT,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create index for query analytics
CREATE INDEX IF NOT EXISTS rag_query_logs_created_at_idx ON rag_query_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS rag_query_logs_user_id_idx ON rag_query_logs(user_id);

-- Create RAG feedback table for continuous improvement
CREATE TABLE IF NOT EXISTS rag_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_log_id UUID REFERENCES rag_query_logs(id),
    document_id UUID REFERENCES rag_documents(id),
    user_id UUID,
    feedback_type VARCHAR(20) CHECK (feedback_type IN ('helpful', 'not_helpful', 'irrelevant')),
    feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to rag_documents
CREATE TRIGGER update_rag_documents_updated_at
    BEFORE UPDATE ON rag_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for security
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_feedback ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active documents
CREATE POLICY "Public read access to active RAG documents" ON rag_documents
    FOR SELECT USING (is_active = true);

-- Allow authenticated users to log queries
CREATE POLICY "Authenticated users can log queries" ON rag_query_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to provide feedback
CREATE POLICY "Authenticated users can provide feedback" ON rag_feedback
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE rag_documents IS 'BMAD Health AI - RAG knowledge base with vector embeddings';
COMMENT ON TABLE rag_query_logs IS 'BMAD Health AI - RAG query analytics and optimization';
COMMENT ON TABLE rag_feedback IS 'BMAD Health AI - RAG feedback for continuous improvement';
