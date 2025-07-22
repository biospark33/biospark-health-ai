
-- Performance Optimization Migration for Health AI System
-- Phase 1D: Database indexes and connection pooling

-- Index for user lookups by email (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Indexes for health assessments (frequent queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_assessments_user_id ON health_assessments(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_assessments_created_at ON health_assessments(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_assessments_status ON health_assessments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_assessments_user_created ON health_assessments(user_id, created_at);

-- Indexes for biomarkers (analysis queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_biomarkers_user_id ON biomarkers(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_biomarkers_category ON biomarkers(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_biomarkers_name ON biomarkers(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_biomarkers_test_date ON biomarkers(test_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_biomarkers_user_category ON biomarkers(user_id, category);

-- Indexes for analyses (performance critical)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analyses_status ON analyses(status);

-- Indexes for audit logs (HIPAA compliance queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);

-- Indexes for user consent (compliance checks)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_consent_user_id ON user_consent(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_consent_consent_type ON user_consent(consent_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_consent_status ON user_consent(status);

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_assessments_user_type_status ON health_assessments(user_id, assessment_type, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_biomarkers_user_date_category ON biomarkers(user_id, test_date, category);

-- Optimize database settings for performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET log_min_duration_statement = 1000;
