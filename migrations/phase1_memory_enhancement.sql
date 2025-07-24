
-- Phase 1 Memory Enhancement Database Migration
-- Extends existing schema with progressive disclosure tracking and memory integration

-- Add progressive disclosure tracking to health_assessments table
ALTER TABLE health_assessments 
ADD COLUMN IF NOT EXISTS layer_progress JSONB DEFAULT '{"layer1": false, "layer2": false, "layer3": false}',
ADD COLUMN IF NOT EXISTS engagement_metrics JSONB DEFAULT '{"timeSpent": 0, "layerTransitions": [], "achievements": []}',
ADD COLUMN IF NOT EXISTS memory_context JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS personalization_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS zep_session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS memory_enhanced BOOLEAN DEFAULT false;

-- Create index for memory-enhanced queries
CREATE INDEX IF NOT EXISTS idx_health_assessments_memory_enhanced 
ON health_assessments(memory_enhanced, user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_health_assessments_zep_session 
ON health_assessments(zep_session_id);

-- Add engagement tracking table for detailed analytics
CREATE TABLE IF NOT EXISTS user_engagement_analytics (
    id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_id VARCHAR(30) NOT NULL REFERENCES health_assessments(id) ON DELETE CASCADE,
    
    -- Engagement metrics
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    total_time_spent INTEGER DEFAULT 0, -- seconds
    
    -- Layer engagement
    layer1_time INTEGER DEFAULT 0,
    layer2_time INTEGER DEFAULT 0,
    layer3_time INTEGER DEFAULT 0,
    layer_transitions JSONB DEFAULT '[]',
    
    -- Memory integration
    zep_session_id VARCHAR(255),
    memory_context_used BOOLEAN DEFAULT false,
    personalized_insights_shown BOOLEAN DEFAULT false,
    
    -- Achievement tracking
    achievements JSONB DEFAULT '[]',
    engagement_score FLOAT DEFAULT 0.0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for engagement analytics
CREATE INDEX IF NOT EXISTS idx_engagement_analytics_user_id 
ON user_engagement_analytics(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_engagement_analytics_assessment_id 
ON user_engagement_analytics(assessment_id);

CREATE INDEX IF NOT EXISTS idx_engagement_analytics_zep_session 
ON user_engagement_analytics(zep_session_id);

-- Add memory preferences table for user personalization
CREATE TABLE IF NOT EXISTS user_memory_preferences (
    id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Communication preferences
    preferred_detail_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    communication_style VARCHAR(20) DEFAULT 'balanced', -- 'concise', 'balanced', 'detailed'
    
    -- Engagement preferences
    preferred_layers INTEGER[] DEFAULT ARRAY[1],
    average_session_time INTEGER DEFAULT 300, -- seconds
    completion_rate FLOAT DEFAULT 0.0,
    
    -- Health focus areas
    focus_areas JSONB DEFAULT '[]',
    health_goals JSONB DEFAULT '{}',
    avoidance_topics JSONB DEFAULT '[]',
    
    -- Memory settings
    enable_personalization BOOLEAN DEFAULT true,
    memory_retention_days INTEGER DEFAULT 365,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Create index for memory preferences
CREATE INDEX IF NOT EXISTS idx_memory_preferences_user_id 
ON user_memory_preferences(user_id);

-- Add progressive disclosure metrics to existing biomarkers table
ALTER TABLE biomarkers 
ADD COLUMN IF NOT EXISTS disclosure_layer INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS user_interest_score FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS memory_context JSONB DEFAULT '{}';

-- Create index for biomarker disclosure queries
CREATE INDEX IF NOT EXISTS idx_biomarkers_disclosure_layer 
ON biomarkers(user_id, disclosure_layer, user_interest_score);

-- Update existing health assessments with default memory enhancement values
UPDATE health_assessments 
SET 
    layer_progress = '{"layer1": true, "layer2": false, "layer3": false}',
    engagement_metrics = '{"timeSpent": 0, "layerTransitions": [], "achievements": []}',
    memory_enhanced = false
WHERE layer_progress IS NULL;

-- Create function to update engagement metrics
CREATE OR REPLACE FUNCTION update_engagement_metrics()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Calculate engagement score based on time spent and layer completion
    NEW.engagement_score = LEAST(
        (COALESCE(NEW.layer1_time, 0) + COALESCE(NEW.layer2_time, 0) + COALESCE(NEW.layer3_time, 0)) / 300.0 +
        (CASE WHEN NEW.layer1_time > 0 THEN 0.2 ELSE 0 END) +
        (CASE WHEN NEW.layer2_time > 0 THEN 0.3 ELSE 0 END) +
        (CASE WHEN NEW.layer3_time > 0 THEN 0.5 ELSE 0 END),
        1.0
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for engagement metrics updates
DROP TRIGGER IF EXISTS trigger_update_engagement_metrics ON user_engagement_analytics;
CREATE TRIGGER trigger_update_engagement_metrics
    BEFORE UPDATE ON user_engagement_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_engagement_metrics();

-- Create function to automatically update user memory preferences
CREATE OR REPLACE FUNCTION update_memory_preferences()
RETURNS TRIGGER AS $$
DECLARE
    user_pref_exists BOOLEAN;
BEGIN
    -- Check if user preferences exist
    SELECT EXISTS(
        SELECT 1 FROM user_memory_preferences 
        WHERE user_id = NEW.user_id
    ) INTO user_pref_exists;
    
    -- Create or update preferences based on engagement
    IF user_pref_exists THEN
        UPDATE user_memory_preferences 
        SET 
            average_session_time = (
                SELECT AVG(total_time_spent) 
                FROM user_engagement_analytics 
                WHERE user_id = NEW.user_id
            ),
            completion_rate = (
                SELECT AVG(engagement_score) 
                FROM user_engagement_analytics 
                WHERE user_id = NEW.user_id
            ),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    ELSE
        INSERT INTO user_memory_preferences (user_id, average_session_time, completion_rate)
        VALUES (NEW.user_id, NEW.total_time_spent, NEW.engagement_score);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic preference updates
DROP TRIGGER IF EXISTS trigger_update_memory_preferences ON user_engagement_analytics;
CREATE TRIGGER trigger_update_memory_preferences
    AFTER INSERT OR UPDATE ON user_engagement_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_memory_preferences();

-- Add comments for documentation
COMMENT ON TABLE user_engagement_analytics IS 'Tracks detailed user engagement with progressive disclosure layers';
COMMENT ON TABLE user_memory_preferences IS 'Stores user preferences for memory-enhanced personalization';
COMMENT ON COLUMN health_assessments.layer_progress IS 'Tracks which progressive disclosure layers user has completed';
COMMENT ON COLUMN health_assessments.engagement_metrics IS 'Stores engagement metrics for memory enhancement';
COMMENT ON COLUMN health_assessments.memory_context IS 'Stores Zep memory context for personalization';
COMMENT ON COLUMN health_assessments.zep_session_id IS 'Links to Zep Cloud session for memory integration';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON user_engagement_analytics TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE ON user_memory_preferences TO your_app_user;

-- Migration completion log
INSERT INTO migration_log (migration_name, executed_at, description) 
VALUES (
    'phase1_memory_enhancement', 
    NOW(), 
    'Phase 1 memory enhancement with progressive disclosure tracking and Zep integration'
) ON CONFLICT (migration_name) DO UPDATE SET 
    executed_at = NOW(),
    description = EXCLUDED.description;
