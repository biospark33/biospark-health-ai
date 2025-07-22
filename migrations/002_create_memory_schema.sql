
-- ===================================================================
-- BMAD SUPABASE MIGRATION - Phase 3: Memory & Session Schema
-- Created: July 21, 2025
-- Purpose: Create memory management tables for Zep integration
-- ===================================================================

-- Create user sessions table for memory management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    session_type VARCHAR(50) DEFAULT 'health_consultation',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    zep_session_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    message_id TEXT UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    content_embedding vector(1536),
    token_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    zep_message_id TEXT,
    is_deleted BOOLEAN DEFAULT false
);

-- Create memory summaries table for long-term retention
CREATE TABLE IF NOT EXISTS memory_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    summary_text TEXT NOT NULL,
    summary_embedding vector(1536),
    summary_type VARCHAR(50) DEFAULT 'session_summary',
    importance_score FLOAT DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    zep_summary_id TEXT
);

-- Create user preferences and context table
CREATE TABLE IF NOT EXISTS user_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    health_goals TEXT[],
    dietary_preferences TEXT[],
    health_conditions TEXT[],
    preferred_communication_style VARCHAR(50),
    context_embedding vector(1536),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_session_id_idx ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS user_sessions_is_active_idx ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS user_sessions_last_activity_idx ON user_sessions(last_activity DESC);

CREATE INDEX IF NOT EXISTS conversation_messages_session_id_idx ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS conversation_messages_created_at_idx ON conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS conversation_messages_role_idx ON conversation_messages(role);

-- Vector similarity indexes for memory search
CREATE INDEX IF NOT EXISTS conversation_messages_embedding_idx 
ON conversation_messages USING ivfflat (content_embedding vector_cosine_ops) 
WITH (lists = 50);

CREATE INDEX IF NOT EXISTS memory_summaries_embedding_idx 
ON memory_summaries USING ivfflat (summary_embedding vector_cosine_ops) 
WITH (lists = 50);

CREATE INDEX IF NOT EXISTS user_context_embedding_idx 
ON user_context USING ivfflat (context_embedding vector_cosine_ops) 
WITH (lists = 10);

-- Apply updated_at triggers
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY "Users can access own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Users can only access their own messages
CREATE POLICY "Users can access own messages" ON conversation_messages
    FOR ALL USING (
        session_id IN (
            SELECT id FROM user_sessions WHERE user_id = auth.uid()
        )
    );

-- Users can only access their own memory summaries
CREATE POLICY "Users can access own memory summaries" ON memory_summaries
    FOR ALL USING (auth.uid() = user_id);

-- Users can only access their own context
CREATE POLICY "Users can access own context" ON user_context
    FOR ALL USING (auth.uid() = user_id);

COMMENT ON TABLE user_sessions IS 'BMAD Health AI - User session management for memory tracking';
COMMENT ON TABLE conversation_messages IS 'BMAD Health AI - Conversation messages with embeddings';
COMMENT ON TABLE memory_summaries IS 'BMAD Health AI - Long-term memory summaries';
COMMENT ON TABLE user_context IS 'BMAD Health AI - User context and preferences';
