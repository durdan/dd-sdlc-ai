-- =====================================================
-- CLAUDE REPOSITORY ANALYSIS STORAGE
-- =====================================================

-- Repository analysis storage
CREATE TABLE IF NOT EXISTS claude_repository_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_url VARCHAR(500) NOT NULL UNIQUE,
  
  -- Analysis results
  structure JSONB NOT NULL DEFAULT '{}',
  patterns JSONB NOT NULL DEFAULT '{}',
  dependencies JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  framework VARCHAR(100),
  primary_language VARCHAR(50),
  summary TEXT,
  recommendations JSONB DEFAULT '[]',
  
  -- File categorization
  file_count INTEGER DEFAULT 0,
  code_files JSONB DEFAULT '[]',
  test_files JSONB DEFAULT '[]',
  config_files JSONB DEFAULT '[]',
  
  -- Timestamps
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_claude_repo_analysis_url ON claude_repository_analysis(repo_url);
CREATE INDEX IF NOT EXISTS idx_claude_repo_analysis_framework ON claude_repository_analysis(framework);
CREATE INDEX IF NOT EXISTS idx_claude_repo_analysis_language ON claude_repository_analysis(primary_language);
CREATE INDEX IF NOT EXISTS idx_claude_repo_analysis_analyzed_at ON claude_repository_analysis(analyzed_at DESC);

-- =====================================================
-- ENHANCED AI TASK EXECUTIONS FOR REPOSITORY ANALYSIS
-- =====================================================

-- Add repository analysis specific columns if they don't exist
DO $$ 
BEGIN
    -- Add repository_analysis_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sdlc_ai_task_executions' 
                   AND column_name = 'repository_analysis_id') THEN
        ALTER TABLE sdlc_ai_task_executions 
        ADD COLUMN repository_analysis_id UUID REFERENCES claude_repository_analysis(id);
    END IF;
    
    -- Add codebase_context if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sdlc_ai_task_executions' 
                   AND column_name = 'codebase_context') THEN
        ALTER TABLE sdlc_ai_task_executions 
        ADD COLUMN codebase_context TEXT;
    END IF;
END $$;

-- Index for linking task executions to repository analysis
CREATE INDEX IF NOT EXISTS idx_task_executions_repo_analysis 
ON sdlc_ai_task_executions(repository_analysis_id) 
WHERE repository_analysis_id IS NOT NULL;

-- =====================================================
-- REPOSITORY ANALYSIS FUNCTIONS
-- =====================================================

-- Function to get repository analysis with caching check
CREATE OR REPLACE FUNCTION get_repository_analysis(repo_url_param VARCHAR, max_age_hours INTEGER DEFAULT 24)
RETURNS TABLE (
  analysis_data JSONB,
  is_cached BOOLEAN,
  age_hours INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
  analysis_record RECORD;
  analysis_age_hours INTEGER;
BEGIN
  -- Get the most recent analysis for this repository
  SELECT * INTO analysis_record
  FROM claude_repository_analysis
  WHERE repo_url = repo_url_param
  ORDER BY analyzed_at DESC
  LIMIT 1;
  
  IF analysis_record IS NULL THEN
    -- No analysis found
    RETURN QUERY SELECT NULL::JSONB, FALSE, NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Calculate age in hours
  analysis_age_hours := EXTRACT(EPOCH FROM (now() - analysis_record.analyzed_at)) / 3600;
  
  -- Check if analysis is fresh enough
  IF analysis_age_hours <= max_age_hours THEN
    -- Return cached analysis
    RETURN QUERY SELECT 
      row_to_json(analysis_record)::JSONB,
      TRUE,
      analysis_age_hours::INTEGER;
  ELSE
    -- Analysis is too old
    RETURN QUERY SELECT 
      row_to_json(analysis_record)::JSONB,
      FALSE,
      analysis_age_hours::INTEGER;
  END IF;
END;
$$;

-- Function to get repository statistics
CREATE OR REPLACE FUNCTION get_repository_statistics()
RETURNS TABLE (
  total_repositories INTEGER,
  analyzed_today INTEGER,
  analyzed_this_week INTEGER,
  top_frameworks JSONB,
  top_languages JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*)::INTEGER as total_repos,
      COUNT(*) FILTER (WHERE analyzed_at >= CURRENT_DATE)::INTEGER as today_count,
      COUNT(*) FILTER (WHERE analyzed_at >= CURRENT_DATE - INTERVAL '7 days')::INTEGER as week_count
    FROM claude_repository_analysis
  ),
  framework_stats AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'framework', framework,
        'count', count
      ) ORDER BY count DESC
    ) as frameworks
    FROM (
      SELECT framework, COUNT(*)::INTEGER as count
      FROM claude_repository_analysis
      WHERE framework IS NOT NULL
      GROUP BY framework
      ORDER BY count DESC
      LIMIT 10
    ) f
  ),
  language_stats AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'language', primary_language,
        'count', count
      ) ORDER BY count DESC
    ) as languages
    FROM (
      SELECT primary_language, COUNT(*)::INTEGER as count
      FROM claude_repository_analysis
      WHERE primary_language IS NOT NULL
      GROUP BY primary_language
      ORDER BY count DESC
      LIMIT 10
    ) l
  )
  SELECT 
    s.total_repos,
    s.today_count,
    s.week_count,
    COALESCE(f.frameworks, '[]'::jsonb),
    COALESCE(l.languages, '[]'::jsonb)
  FROM stats s
  CROSS JOIN framework_stats f
  CROSS JOIN language_stats l;
END;
$$;

-- =====================================================
-- REPOSITORY ANALYSIS TRIGGERS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_claude_repo_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_claude_repo_analysis_timestamp ON claude_repository_analysis;
CREATE TRIGGER trigger_update_claude_repo_analysis_timestamp
  BEFORE UPDATE ON claude_repository_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_claude_repo_analysis_timestamp();

-- =====================================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- =====================================================

-- Insert sample repository analysis for testing
INSERT INTO claude_repository_analysis (
  repo_url,
  structure,
  patterns,
  dependencies,
  framework,
  primary_language,
  summary,
  recommendations,
  file_count,
  code_files,
  test_files,
  config_files
) VALUES (
  'https://github.com/example/sample-repo',
  '{"path": "root", "type": "directory", "children": [{"path": "src", "type": "directory"}, {"path": "package.json", "type": "file"}]}',
  '{"framework": "React", "architecture": ["SPA"], "patterns": ["Component Pattern"], "conventions": {"naming": "camelCase", "structure": "Feature-based", "imports": "ES6"}, "technologies": ["React", "TypeScript", "Webpack"]}',
  '{"imports": {"src/App.tsx": ["react", "react-dom"]}, "exports": {"src/App.tsx": ["App"]}, "functions": {}, "classes": {}, "relationships": []}',
  'React',
  'typescript',
  'A sample React application built with TypeScript featuring modern development practices.',
  '["Implement comprehensive testing", "Add error boundaries", "Optimize bundle size", "Improve accessibility"]',
  25,
  '["src/App.tsx", "src/components/Header.tsx", "src/utils/helpers.ts"]',
  '["src/__tests__/App.test.tsx", "src/components/__tests__/Header.test.tsx"]',
  '["package.json", "tsconfig.json", "webpack.config.js", ".eslintrc.js"]'
) ON CONFLICT (repo_url) DO NOTHING;

-- =====================================================
-- PERMISSIONS AND SECURITY
-- =====================================================

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON claude_repository_analysis TO authenticated;
GRANT USAGE ON SEQUENCE claude_repository_analysis_id_seq TO authenticated;
GRANT EXECUTE ON FUNCTION get_repository_analysis(VARCHAR, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_repository_statistics() TO authenticated;

-- Row Level Security (RLS) - repositories are public data, so allow read access
-- For write access, we can restrict based on user authentication if needed
ALTER TABLE claude_repository_analysis ENABLE ROW LEVEL SECURITY;

-- Policy for reading repository analysis (public repositories)
CREATE POLICY "Allow read access to repository analysis" ON claude_repository_analysis
  FOR SELECT TO authenticated
  USING (true);

-- Policy for inserting repository analysis (authenticated users only)
CREATE POLICY "Allow insert repository analysis" ON claude_repository_analysis
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Policy for updating repository analysis (authenticated users only)
CREATE POLICY "Allow update repository analysis" ON claude_repository_analysis
  FOR UPDATE TO authenticated
  USING (true);

-- =====================================================
-- CLEANUP AND MAINTENANCE
-- =====================================================

-- Function to clean up old repository analyses (older than X days)
CREATE OR REPLACE FUNCTION cleanup_old_repository_analyses(days_old INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM claude_repository_analysis
  WHERE analyzed_at < now() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_old_repository_analyses(INTEGER) TO authenticated; 