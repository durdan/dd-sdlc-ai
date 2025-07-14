-- =====================================================
-- GITDIGEST SCHEMA MIGRATION
-- =====================================================
-- File: 20241218_gitdigest_schema.sql
-- Purpose: Add GitDigest.ai functionality to existing SDLC platform
-- Dependencies: Existing auth.users table

-- =====================================================
-- 1. REPOSITORY DIGESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS repo_digests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    repo_url TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    repo_owner TEXT NOT NULL,
    repo_full_name TEXT NOT NULL, -- e.g., "owner/repo"
    digest_data JSONB NOT NULL DEFAULT '{}',
    sdlc_score INTEGER NOT NULL DEFAULT 0 CHECK (sdlc_score >= 0 AND sdlc_score <= 100),
    analysis_metadata JSONB DEFAULT '{}', -- Store analysis timestamps, versions, etc.
    last_analyzed TIMESTAMP DEFAULT NOW(),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure one digest per repo per user
    UNIQUE(user_id, repo_url)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_repo_digests_user_id ON repo_digests(user_id);
CREATE INDEX IF NOT EXISTS idx_repo_digests_repo_owner ON repo_digests(repo_owner);
CREATE INDEX IF NOT EXISTS idx_repo_digests_sdlc_score ON repo_digests(sdlc_score);
CREATE INDEX IF NOT EXISTS idx_repo_digests_last_analyzed ON repo_digests(last_analyzed);
CREATE INDEX IF NOT EXISTS idx_repo_digests_public ON repo_digests(is_public) WHERE is_public = true;

-- =====================================================
-- 2. DAILY REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_digest_id UUID NOT NULL REFERENCES repo_digests(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    changes_summary JSONB NOT NULL DEFAULT '{}',
    commit_count INTEGER DEFAULT 0,
    pr_count INTEGER DEFAULT 0,
    issue_count INTEGER DEFAULT 0,
    contributors_count INTEGER DEFAULT 0,
    lines_added INTEGER DEFAULT 0,
    lines_removed INTEGER DEFAULT 0,
    ai_summary TEXT, -- AI-generated summary of the day's changes
    key_changes TEXT[], -- Array of key changes
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure one report per day per repo
    UNIQUE(repo_digest_id, report_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_reports_repo_digest_id ON daily_reports(repo_digest_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_repo_date ON daily_reports(repo_digest_id, report_date);

-- =====================================================
-- 3. DIGEST SHARES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS digest_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_digest_id UUID NOT NULL REFERENCES repo_digests(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    last_viewed TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure share token is unique
    CONSTRAINT unique_share_token UNIQUE(share_token)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_digest_shares_token ON digest_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_digest_shares_repo_digest_id ON digest_shares(repo_digest_id);
CREATE INDEX IF NOT EXISTS idx_digest_shares_created_by ON digest_shares(created_by);
CREATE INDEX IF NOT EXISTS idx_digest_shares_expires_at ON digest_shares(expires_at) WHERE expires_at IS NOT NULL;

-- =====================================================
-- 4. DIGEST ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS digest_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_digest_id UUID NOT NULL REFERENCES repo_digests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous views
    event_type TEXT NOT NULL, -- 'view', 'share', 'export', 'daily_report', 'analyze'
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_digest_analytics_repo_digest_id ON digest_analytics(repo_digest_id);
CREATE INDEX IF NOT EXISTS idx_digest_analytics_event_type ON digest_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_digest_analytics_created_at ON digest_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_digest_analytics_user_id ON digest_analytics(user_id) WHERE user_id IS NOT NULL;

-- =====================================================
-- 5. DIGEST SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS digest_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    repo_digest_id UUID NOT NULL REFERENCES repo_digests(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekly', 'on_change'
    is_active BOOLEAN DEFAULT true,
    delivery_method TEXT NOT NULL DEFAULT 'email', -- 'email', 'slack', 'webhook'
    delivery_config JSONB DEFAULT '{}', -- Store delivery-specific config
    last_delivered TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure one subscription per user per repo per type
    UNIQUE(user_id, repo_digest_id, subscription_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_digest_subscriptions_user_id ON digest_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_digest_subscriptions_repo_digest_id ON digest_subscriptions(repo_digest_id);
CREATE INDEX IF NOT EXISTS idx_digest_subscriptions_active ON digest_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_digest_subscriptions_type ON digest_subscriptions(subscription_type);

-- =====================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE repo_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_subscriptions ENABLE ROW LEVEL SECURITY;

-- Repo Digests Policies
CREATE POLICY "Users can view their own digests" ON repo_digests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public digests" ON repo_digests
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own digests" ON repo_digests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own digests" ON repo_digests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own digests" ON repo_digests
    FOR DELETE USING (auth.uid() = user_id);

-- Daily Reports Policies
CREATE POLICY "Users can view reports for their digests" ON daily_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM repo_digests 
            WHERE repo_digests.id = daily_reports.repo_digest_id 
            AND repo_digests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view reports for public digests" ON daily_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM repo_digests 
            WHERE repo_digests.id = daily_reports.repo_digest_id 
            AND repo_digests.is_public = true
        )
    );

CREATE POLICY "System can create daily reports" ON daily_reports
    FOR INSERT WITH CHECK (true); -- System service will create reports

-- Digest Shares Policies
CREATE POLICY "Users can view their own shares" ON digest_shares
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create shares for their digests" ON digest_shares
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM repo_digests 
            WHERE repo_digests.id = digest_shares.repo_digest_id 
            AND repo_digests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own shares" ON digest_shares
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own shares" ON digest_shares
    FOR DELETE USING (auth.uid() = created_by);

-- Analytics Policies (more permissive for system tracking)
CREATE POLICY "Users can view analytics for their digests" ON digest_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM repo_digests 
            WHERE repo_digests.id = digest_analytics.repo_digest_id 
            AND repo_digests.user_id = auth.uid()
        )
    );

CREATE POLICY "System can create analytics events" ON digest_analytics
    FOR INSERT WITH CHECK (true); -- System service will create events

-- Subscription Policies
CREATE POLICY "Users can manage their own subscriptions" ON digest_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to generate unique share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to get user's digest count
CREATE OR REPLACE FUNCTION get_user_digest_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM repo_digests
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get digest with analytics
CREATE OR REPLACE FUNCTION get_digest_with_stats(digest_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'digest', row_to_json(rd.*),
        'daily_reports_count', (
            SELECT COUNT(*) FROM daily_reports 
            WHERE repo_digest_id = digest_id
        ),
        'total_views', (
            SELECT COUNT(*) FROM digest_analytics 
            WHERE repo_digest_id = digest_id AND event_type = 'view'
        ),
        'last_analyzed', rd.last_analyzed,
        'sdlc_score', rd.sdlc_score
    )
    INTO result
    FROM repo_digests rd
    WHERE rd.id = digest_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update digest last analyzed timestamp
CREATE OR REPLACE FUNCTION update_digest_analyzed(digest_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE repo_digests 
    SET last_analyzed = NOW(), updated_at = NOW()
    WHERE id = digest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_repo_digests_updated_at
    BEFORE UPDATE ON repo_digests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digest_subscriptions_updated_at
    BEFORE UPDATE ON digest_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. SAMPLE DATA (FOR DEVELOPMENT)
-- =====================================================

-- Insert sample digest prompts into existing prompt_templates table
INSERT INTO prompt_templates (
    name,
    document_type,
    prompt_content,
    variables,
    created_by,
    is_system_default,
    version
) VALUES (
    'Repository Analysis Prompt',
    'repo_analysis',
    'Analyze the following GitHub repository and provide a comprehensive summary:

Repository: {{repo_name}}
Owner: {{repo_owner}}
Description: {{repo_description}}
Primary Language: {{primary_language}}
Stars: {{stars}}
Forks: {{forks}}

Recent Commits:
{{recent_commits}}

Pull Requests:
{{recent_prs}}

Issues:
{{recent_issues}}

Code Structure:
{{code_structure}}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Features and Functionality
3. Code Quality Assessment
4. Documentation Quality
5. Testing Coverage Analysis
6. SDLC Readiness Score (0-100) with breakdown
7. Recommendations for Improvement

Format the response as structured JSON with clear sections.',
    '["repo_name", "repo_owner", "repo_description", "primary_language", "stars", "forks", "recent_commits", "recent_prs", "recent_issues", "code_structure"]',
    (SELECT id FROM auth.users WHERE email = 'durgeshdandotiya@gmail.com' LIMIT 1),
    true,
    1
) ON CONFLICT (name, document_type) DO NOTHING;

INSERT INTO prompt_templates (
    name,
    document_type,
    prompt_content,
    variables,
    created_by,
    is_system_default,
    version
) VALUES (
    'Daily Report Generation Prompt',
    'daily_report',
    'Generate a daily standup report for the following repository changes:

Repository: {{repo_name}}
Date: {{report_date}}

Changes Summary:
- Commits: {{commit_count}}
- Pull Requests: {{pr_count}}
- Issues: {{issue_count}}
- Contributors: {{contributors_count}}
- Lines Added: {{lines_added}}
- Lines Removed: {{lines_removed}}

Detailed Changes:
{{detailed_changes}}

Please provide:
1. Executive Summary (1-2 sentences)
2. Key Changes Made
3. Contributors Active Today
4. Issues Resolved
5. New Issues Created
6. Pull Requests Status
7. Notable Code Changes
8. Recommendations for Tomorrow

Format as a professional standup report suitable for team communication.',
    '["repo_name", "report_date", "commit_count", "pr_count", "issue_count", "contributors_count", "lines_added", "lines_removed", "detailed_changes"]',
    (SELECT id FROM auth.users WHERE email = 'durgeshdandotiya@gmail.com' LIMIT 1),
    true,
    1
) ON CONFLICT (name, document_type) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comment to track migration
COMMENT ON TABLE repo_digests IS 'GitDigest.ai - Repository analysis and digest storage';
COMMENT ON TABLE daily_reports IS 'GitDigest.ai - Daily standup reports for repositories';
COMMENT ON TABLE digest_shares IS 'GitDigest.ai - Shareable digest links and access control';
COMMENT ON TABLE digest_analytics IS 'GitDigest.ai - Analytics and usage tracking';
COMMENT ON TABLE digest_subscriptions IS 'GitDigest.ai - User subscriptions for automated reports'; 