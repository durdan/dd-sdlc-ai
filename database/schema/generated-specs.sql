-- Generated Specs Table for GitHub Repo Analyzer
-- Run this in Supabase SQL Editor

-- Create the generated_specs table
CREATE TABLE IF NOT EXISTS generated_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id VARCHAR(12) UNIQUE NOT NULL,
  repo_owner VARCHAR(255) NOT NULL,
  repo_name VARCHAR(255) NOT NULL,
  repo_url TEXT NOT NULL,
  commit_sha VARCHAR(40),
  spec_markdown TEXT NOT NULL,
  spec_json JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_generated_specs_share_id ON generated_specs(share_id);
CREATE INDEX IF NOT EXISTS idx_generated_specs_repo ON generated_specs(repo_owner, repo_name);
CREATE INDEX IF NOT EXISTS idx_generated_specs_user_id ON generated_specs(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_specs_created_at ON generated_specs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE generated_specs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read public specs
CREATE POLICY "Public specs are viewable by everyone"
  ON generated_specs
  FOR SELECT
  USING (is_public = true);

-- Policy: Authenticated users can read their own specs
CREATE POLICY "Users can view their own specs"
  ON generated_specs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Anyone can insert specs (for anonymous usage)
CREATE POLICY "Anyone can create specs"
  ON generated_specs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own specs
CREATE POLICY "Users can update their own specs"
  ON generated_specs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own specs
CREATE POLICY "Users can delete their own specs"
  ON generated_specs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_generated_specs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_generated_specs_updated_at ON generated_specs;
CREATE TRIGGER trigger_update_generated_specs_updated_at
  BEFORE UPDATE ON generated_specs
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_specs_updated_at();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_spec_view_count(spec_share_id VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE generated_specs
  SET view_count = view_count + 1
  WHERE share_id = spec_share_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Analytics view for popular repos analyzed
CREATE OR REPLACE VIEW popular_analyzed_repos AS
SELECT
  repo_owner,
  repo_name,
  repo_url,
  COUNT(*) as analysis_count,
  SUM(view_count) as total_views,
  MAX(created_at) as last_analyzed
FROM generated_specs
WHERE is_public = true
GROUP BY repo_owner, repo_name, repo_url
ORDER BY analysis_count DESC, total_views DESC
LIMIT 100;

-- Grant permissions
GRANT SELECT ON popular_analyzed_repos TO authenticated;
GRANT SELECT ON popular_analyzed_repos TO anon;
