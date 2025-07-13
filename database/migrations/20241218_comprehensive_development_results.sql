-- Comprehensive Development Results Table
-- Stores complete AI development workflow results with quality metrics and intelligence scores

CREATE TABLE IF NOT EXISTS comprehensive_development_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT NOT NULL UNIQUE,
    result_data JSONB NOT NULL,
    quality_score DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (quality_score >= 0 AND quality_score <= 1),
    pull_request_ready BOOLEAN NOT NULL DEFAULT false,
    repository_url TEXT,
    development_type TEXT CHECK (development_type IN ('feature', 'enhancement', 'bug_fix', 'refactor')),
    intelligence_metrics JSONB,
    estimated_review_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enhanced Claude Tasks Table
CREATE TABLE IF NOT EXISTS enhanced_claude_tasks (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('repository_analysis', 'bug_analysis', 'bug_fix', 'code_generation', 'test_generation', 'comprehensive_development')),
    description TEXT NOT NULL,
    repository_url TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'analyzing', 'processing', 'completed', 'failed')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    result_data JSONB,
    context_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Intelligence Metrics Table
CREATE TABLE IF NOT EXISTS intelligence_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_url TEXT NOT NULL,
    metrics_data JSONB NOT NULL,
    repository_understanding DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    code_quality DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    test_coverage DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    pattern_compliance DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    security_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    performance_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    maintainability_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    overall_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_comprehensive_development_results_task_id ON comprehensive_development_results(task_id);
CREATE INDEX IF NOT EXISTS idx_comprehensive_development_results_quality_score ON comprehensive_development_results(quality_score);
CREATE INDEX IF NOT EXISTS idx_comprehensive_development_results_repository_url ON comprehensive_development_results(repository_url);
CREATE INDEX IF NOT EXISTS idx_comprehensive_development_results_development_type ON comprehensive_development_results(development_type);
CREATE INDEX IF NOT EXISTS idx_comprehensive_development_results_user_id ON comprehensive_development_results(user_id);
CREATE INDEX IF NOT EXISTS idx_comprehensive_development_results_created_at ON comprehensive_development_results(created_at);

CREATE INDEX IF NOT EXISTS idx_enhanced_claude_tasks_type ON enhanced_claude_tasks(type);
CREATE INDEX IF NOT EXISTS idx_enhanced_claude_tasks_status ON enhanced_claude_tasks(status);
CREATE INDEX IF NOT EXISTS idx_enhanced_claude_tasks_priority ON enhanced_claude_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_enhanced_claude_tasks_repository_url ON enhanced_claude_tasks(repository_url);
CREATE INDEX IF NOT EXISTS idx_enhanced_claude_tasks_user_id ON enhanced_claude_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_claude_tasks_created_at ON enhanced_claude_tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_intelligence_metrics_repository_url ON intelligence_metrics(repository_url);
CREATE INDEX IF NOT EXISTS idx_intelligence_metrics_overall_score ON intelligence_metrics(overall_score);
CREATE INDEX IF NOT EXISTS idx_intelligence_metrics_user_id ON intelligence_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_metrics_created_at ON intelligence_metrics(created_at);

-- Add GIN indexes for JSONB data
CREATE INDEX IF NOT EXISTS idx_comprehensive_development_results_result_data ON comprehensive_development_results USING gin(result_data);
CREATE INDEX IF NOT EXISTS idx_comprehensive_development_results_intelligence_metrics ON comprehensive_development_results USING gin(intelligence_metrics);
CREATE INDEX IF NOT EXISTS idx_enhanced_claude_tasks_result_data ON enhanced_claude_tasks USING gin(result_data);
CREATE INDEX IF NOT EXISTS idx_enhanced_claude_tasks_context_data ON enhanced_claude_tasks USING gin(context_data);
CREATE INDEX IF NOT EXISTS idx_intelligence_metrics_metrics_data ON intelligence_metrics USING gin(metrics_data);

-- Add RLS (Row Level Security)
ALTER TABLE comprehensive_development_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_claude_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can manage their own comprehensive development results"
    ON comprehensive_development_results
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own enhanced claude tasks"
    ON enhanced_claude_tasks
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own intelligence metrics"
    ON intelligence_metrics
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_comprehensive_development_results_updated_at
    BEFORE UPDATE ON comprehensive_development_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get comprehensive development statistics
CREATE OR REPLACE FUNCTION get_comprehensive_development_stats(
    repo_url TEXT DEFAULT NULL,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    total_developments INTEGER,
    avg_quality_score DECIMAL(3,2),
    pr_ready_count INTEGER,
    pr_ready_rate DECIMAL(3,2),
    by_development_type JSONB,
    quality_distribution JSONB,
    avg_review_time_minutes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_developments,
        ROUND(AVG(cdr.quality_score), 2)::DECIMAL(3,2) as avg_quality_score,
        COUNT(CASE WHEN cdr.pull_request_ready THEN 1 END)::INTEGER as pr_ready_count,
        ROUND(
            CASE 
                WHEN COUNT(*) > 0 
                THEN COUNT(CASE WHEN cdr.pull_request_ready THEN 1 END)::DECIMAL / COUNT(*)
                ELSE 0 
            END, 2
        )::DECIMAL(3,2) as pr_ready_rate,
        
        -- Development type distribution
        jsonb_object_agg(
            COALESCE(cdr.development_type, 'unknown'),
            COUNT(CASE WHEN cdr.development_type IS NOT NULL THEN 1 END)
        ) as by_development_type,
        
        -- Quality score distribution
        jsonb_build_object(
            'high_quality', COUNT(CASE WHEN cdr.quality_score >= 0.8 THEN 1 END),
            'medium_quality', COUNT(CASE WHEN cdr.quality_score >= 0.6 AND cdr.quality_score < 0.8 THEN 1 END),
            'low_quality', COUNT(CASE WHEN cdr.quality_score < 0.6 THEN 1 END)
        ) as quality_distribution,
        
        -- Average review time in minutes
        ROUND(AVG(
            CASE 
                WHEN cdr.estimated_review_time LIKE '%hours%' 
                THEN CAST(REGEXP_REPLACE(cdr.estimated_review_time, '[^0-9.]', '', 'g') AS DECIMAL) * 60
                WHEN cdr.estimated_review_time LIKE '%minutes%'
                THEN CAST(REGEXP_REPLACE(cdr.estimated_review_time, '[^0-9.]', '', 'g') AS DECIMAL)
                ELSE 30 -- default 30 minutes
            END
        ))::INTEGER as avg_review_time_minutes
        
    FROM comprehensive_development_results cdr
    WHERE cdr.created_at >= NOW() - INTERVAL '1 day' * days_back
    AND (repo_url IS NULL OR cdr.repository_url = repo_url)
    AND auth.uid() = cdr.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get intelligence metrics trends
CREATE OR REPLACE FUNCTION get_intelligence_metrics_trends(
    repo_url TEXT,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    date DATE,
    avg_overall_score DECIMAL(3,2),
    avg_code_quality DECIMAL(3,2),
    avg_test_coverage DECIMAL(3,2),
    avg_security_score DECIMAL(3,2),
    improvement_rate DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(im.created_at) as date,
        ROUND(AVG(im.overall_score), 2)::DECIMAL(3,2) as avg_overall_score,
        ROUND(AVG(im.code_quality), 2)::DECIMAL(3,2) as avg_code_quality,
        ROUND(AVG(im.test_coverage), 2)::DECIMAL(3,2) as avg_test_coverage,
        ROUND(AVG(im.security_score), 2)::DECIMAL(3,2) as avg_security_score,
        ROUND(
            CASE 
                WHEN LAG(AVG(im.overall_score)) OVER (ORDER BY DATE(im.created_at)) IS NOT NULL
                THEN (AVG(im.overall_score) - LAG(AVG(im.overall_score)) OVER (ORDER BY DATE(im.created_at))) / LAG(AVG(im.overall_score)) OVER (ORDER BY DATE(im.created_at))
                ELSE 0
            END, 3
        )::DECIMAL(3,2) as improvement_rate
    FROM intelligence_metrics im
    WHERE im.repository_url = repo_url
    AND im.created_at >= NOW() - INTERVAL '1 day' * days_back
    AND auth.uid() = im.user_id
    GROUP BY DATE(im.created_at)
    ORDER BY DATE(im.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get task performance metrics
CREATE OR REPLACE FUNCTION get_task_performance_metrics(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    task_type TEXT,
    total_tasks INTEGER,
    completed_tasks INTEGER,
    success_rate DECIMAL(3,2),
    avg_completion_time_minutes INTEGER,
    avg_progress INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ect.type as task_type,
        COUNT(*)::INTEGER as total_tasks,
        COUNT(CASE WHEN ect.status = 'completed' THEN 1 END)::INTEGER as completed_tasks,
        ROUND(
            CASE 
                WHEN COUNT(*) > 0 
                THEN COUNT(CASE WHEN ect.status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)
                ELSE 0 
            END, 2
        )::DECIMAL(3,2) as success_rate,
        ROUND(AVG(
            CASE 
                WHEN ect.completed_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (ect.completed_at - ect.created_at)) / 60
                ELSE NULL
            END
        ))::INTEGER as avg_completion_time_minutes,
        ROUND(AVG(ect.progress))::INTEGER as avg_progress
    FROM enhanced_claude_tasks ect
    WHERE ect.created_at >= NOW() - INTERVAL '1 day' * days_back
    AND auth.uid() = ect.user_id
    GROUP BY ect.type
    ORDER BY success_rate DESC, total_tasks DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create materialized view for intelligence analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS intelligence_analytics AS
SELECT 
    DATE(created_at) as metrics_date,
    ROUND(AVG(overall_score), 2) as avg_overall_score,
    ROUND(AVG(repository_understanding), 2) as avg_repo_understanding,
    ROUND(AVG(code_quality), 2) as avg_code_quality,
    ROUND(AVG(test_coverage), 2) as avg_test_coverage,
    ROUND(AVG(pattern_compliance), 2) as avg_pattern_compliance,
    ROUND(AVG(security_score), 2) as avg_security_score,
    ROUND(AVG(performance_score), 2) as avg_performance_score,
    ROUND(AVG(maintainability_score), 2) as avg_maintainability_score,
    COUNT(*) as total_analyses,
    COUNT(CASE WHEN overall_score >= 0.8 THEN 1 END) as high_quality_count
FROM intelligence_metrics
GROUP BY DATE(created_at)
ORDER BY metrics_date DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_intelligence_analytics_date ON intelligence_analytics(metrics_date);

-- Create function to refresh intelligence analytics
CREATE OR REPLACE FUNCTION refresh_intelligence_analytics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY intelligence_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to auto-update intelligence metrics
CREATE OR REPLACE FUNCTION update_intelligence_metrics_on_development()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract intelligence metrics from the comprehensive development result
    IF NEW.intelligence_metrics IS NOT NULL THEN
        INSERT INTO intelligence_metrics (
            repository_url,
            metrics_data,
            repository_understanding,
            code_quality,
            test_coverage,
            pattern_compliance,
            security_score,
            performance_score,
            maintainability_score,
            overall_score,
            user_id
        ) VALUES (
            NEW.repository_url,
            NEW.intelligence_metrics,
            COALESCE((NEW.intelligence_metrics->>'repositoryUnderstanding')::DECIMAL, 0),
            COALESCE((NEW.intelligence_metrics->>'codeQuality')::DECIMAL, 0),
            COALESCE((NEW.intelligence_metrics->>'testCoverage')::DECIMAL, 0),
            COALESCE((NEW.intelligence_metrics->>'patternCompliance')::DECIMAL, 0),
            COALESCE((NEW.intelligence_metrics->>'securityScore')::DECIMAL, 0),
            COALESCE((NEW.intelligence_metrics->>'performanceScore')::DECIMAL, 0),
            COALESCE((NEW.intelligence_metrics->>'maintainabilityScore')::DECIMAL, 0),
            COALESCE((NEW.intelligence_metrics->>'overallScore')::DECIMAL, 0),
            NEW.user_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating intelligence metrics
CREATE TRIGGER trigger_update_intelligence_metrics_on_development
    AFTER INSERT ON comprehensive_development_results
    FOR EACH ROW
    EXECUTE FUNCTION update_intelligence_metrics_on_development();

-- Add comments for documentation
COMMENT ON TABLE comprehensive_development_results IS 'Stores complete AI development workflow results with quality metrics';
COMMENT ON TABLE enhanced_claude_tasks IS 'Tracks enhanced Claude tasks with intelligence capabilities';
COMMENT ON TABLE intelligence_metrics IS 'Stores repository intelligence metrics and scores';

COMMENT ON COLUMN comprehensive_development_results.task_id IS 'Unique identifier for the comprehensive development task';
COMMENT ON COLUMN comprehensive_development_results.result_data IS 'Complete development result including code, tests, and analysis';
COMMENT ON COLUMN comprehensive_development_results.quality_score IS 'Overall quality score (0-1) for the development result';
COMMENT ON COLUMN comprehensive_development_results.pull_request_ready IS 'Whether the result is ready for pull request creation';
COMMENT ON COLUMN comprehensive_development_results.intelligence_metrics IS 'AI intelligence metrics for the development';

COMMENT ON COLUMN enhanced_claude_tasks.type IS 'Type of enhanced Claude task being performed';
COMMENT ON COLUMN enhanced_claude_tasks.priority IS 'Priority level of the task';
COMMENT ON COLUMN enhanced_claude_tasks.progress IS 'Completion progress percentage (0-100)';
COMMENT ON COLUMN enhanced_claude_tasks.result_data IS 'Task execution result data';
COMMENT ON COLUMN enhanced_claude_tasks.context_data IS 'Additional context and parameters for the task';

COMMENT ON COLUMN intelligence_metrics.overall_score IS 'Overall intelligence score combining all metrics (0-1)';
COMMENT ON COLUMN intelligence_metrics.repository_understanding IS 'How well the AI understands the repository structure (0-1)';
COMMENT ON COLUMN intelligence_metrics.code_quality IS 'Code quality assessment score (0-1)';
COMMENT ON COLUMN intelligence_metrics.test_coverage IS 'Test coverage assessment score (0-1)';
COMMENT ON COLUMN intelligence_metrics.pattern_compliance IS 'Pattern compliance score (0-1)';
COMMENT ON COLUMN intelligence_metrics.security_score IS 'Security assessment score (0-1)';
COMMENT ON COLUMN intelligence_metrics.performance_score IS 'Performance assessment score (0-1)';
COMMENT ON COLUMN intelligence_metrics.maintainability_score IS 'Maintainability assessment score (0-1)';

COMMENT ON FUNCTION get_comprehensive_development_stats IS 'Returns comprehensive statistics for AI development workflows';
COMMENT ON FUNCTION get_intelligence_metrics_trends IS 'Returns trends for intelligence metrics over time';
COMMENT ON FUNCTION get_task_performance_metrics IS 'Returns performance metrics for enhanced Claude tasks';
COMMENT ON MATERIALIZED VIEW intelligence_analytics IS 'Aggregated analytics for intelligence metrics and performance'; 