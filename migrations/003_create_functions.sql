
-- ===================================================================
-- BMAD SUPABASE MIGRATION - Phase 4: Utility Functions
-- Created: July 21, 2025
-- Purpose: Create utility functions for RAG and memory operations
-- ===================================================================

-- Function to search RAG documents by similarity
CREATE OR REPLACE FUNCTION search_rag_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5,
    filter_source_type text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    title text,
    content text,
    source_url text,
    source_type varchar(50),
    similarity float,
    metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rd.id,
        rd.title,
        rd.content,
        rd.source_url,
        rd.source_type,
        1 - (rd.embedding <=> query_embedding) as similarity,
        rd.metadata
    FROM rag_documents rd
    WHERE rd.is_active = true
        AND (filter_source_type IS NULL OR rd.source_type = filter_source_type)
        AND 1 - (rd.embedding <=> query_embedding) > match_threshold
    ORDER BY rd.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to search conversation history by similarity
CREATE OR REPLACE FUNCTION search_conversation_memory(
    user_session_id uuid,
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    role varchar(20),
    content text,
    created_at timestamptz,
    similarity float,
    metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.id,
        cm.role,
        cm.content,
        cm.created_at,
        1 - (cm.content_embedding <=> query_embedding) as similarity,
        cm.metadata
    FROM conversation_messages cm
    WHERE cm.session_id = user_session_id
        AND cm.is_deleted = false
        AND cm.content_embedding IS NOT NULL
        AND 1 - (cm.content_embedding <=> query_embedding) > match_threshold
    ORDER BY cm.content_embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to get user context with similarity
CREATE OR REPLACE FUNCTION get_user_context_similarity(
    target_user_id uuid,
    query_embedding vector(1536)
)
RETURNS TABLE (
    user_id uuid,
    health_goals text[],
    dietary_preferences text[],
    health_conditions text[],
    preferred_communication_style varchar(50),
    context_similarity float,
    metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uc.user_id,
        uc.health_goals,
        uc.dietary_preferences,
        uc.health_conditions,
        uc.preferred_communication_style,
        CASE 
            WHEN uc.context_embedding IS NOT NULL 
            THEN 1 - (uc.context_embedding <=> query_embedding)
            ELSE 0.0
        END as context_similarity,
        uc.metadata
    FROM user_context uc
    WHERE uc.user_id = target_user_id;
END;
$$;

-- Function to log RAG queries for analytics
CREATE OR REPLACE FUNCTION log_rag_query(
    p_user_id uuid,
    p_session_id text,
    p_query_text text,
    p_query_embedding vector(1536),
    p_results_count int,
    p_top_similarity_score float,
    p_response_time_ms int,
    p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    query_log_id uuid;
BEGIN
    INSERT INTO rag_query_logs (
        user_id,
        session_id,
        query_text,
        query_embedding,
        results_count,
        top_similarity_score,
        response_time_ms,
        metadata
    ) VALUES (
        p_user_id,
        p_session_id,
        p_query_text,
        p_query_embedding,
        p_results_count,
        p_top_similarity_score,
        p_response_time_ms,
        p_metadata
    ) RETURNING id INTO query_log_id;
    
    RETURN query_log_id;
END;
$$;

-- Function to create or update user session
CREATE OR REPLACE FUNCTION upsert_user_session(
    p_user_id uuid,
    p_session_id text,
    p_session_type varchar(50) DEFAULT 'health_consultation',
    p_zep_session_id text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    session_uuid uuid;
BEGIN
    INSERT INTO user_sessions (
        user_id,
        session_id,
        session_type,
        zep_session_id,
        metadata
    ) VALUES (
        p_user_id,
        p_session_id,
        p_session_type,
        p_zep_session_id,
        p_metadata
    )
    ON CONFLICT (session_id) 
    DO UPDATE SET
        last_activity = NOW(),
        is_active = true,
        zep_session_id = COALESCE(EXCLUDED.zep_session_id, user_sessions.zep_session_id),
        metadata = EXCLUDED.metadata
    RETURNING id INTO session_uuid;
    
    RETURN session_uuid;
END;
$$;

-- Function to add conversation message
CREATE OR REPLACE FUNCTION add_conversation_message(
    p_session_id uuid,
    p_message_id text,
    p_role varchar(20),
    p_content text,
    p_content_embedding vector(1536) DEFAULT NULL,
    p_token_count int DEFAULT NULL,
    p_zep_message_id text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    message_uuid uuid;
BEGIN
    INSERT INTO conversation_messages (
        session_id,
        message_id,
        role,
        content,
        content_embedding,
        token_count,
        zep_message_id,
        metadata
    ) VALUES (
        p_session_id,
        p_message_id,
        p_role,
        p_content,
        p_content_embedding,
        p_token_count,
        p_zep_message_id,
        p_metadata
    ) RETURNING id INTO message_uuid;
    
    RETURN message_uuid;
END;
$$;

-- Function to clean up old sessions and messages
CREATE OR REPLACE FUNCTION cleanup_old_data(
    retention_days int DEFAULT 90
)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count int := 0;
BEGIN
    -- Mark old sessions as inactive
    UPDATE user_sessions 
    SET is_active = false, ended_at = NOW()
    WHERE last_activity < NOW() - INTERVAL '1 day' * retention_days
        AND is_active = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Soft delete old messages
    UPDATE conversation_messages 
    SET is_deleted = true
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days
        AND is_deleted = false;
    
    RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION search_rag_documents IS 'BMAD Health AI - Search RAG documents by vector similarity';
COMMENT ON FUNCTION search_conversation_memory IS 'BMAD Health AI - Search conversation history by similarity';
COMMENT ON FUNCTION get_user_context_similarity IS 'BMAD Health AI - Get user context with similarity score';
COMMENT ON FUNCTION log_rag_query IS 'BMAD Health AI - Log RAG queries for analytics';
COMMENT ON FUNCTION upsert_user_session IS 'BMAD Health AI - Create or update user session';
COMMENT ON FUNCTION add_conversation_message IS 'BMAD Health AI - Add conversation message';
COMMENT ON FUNCTION cleanup_old_data IS 'BMAD Health AI - Clean up old sessions and messages';
