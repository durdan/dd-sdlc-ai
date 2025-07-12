-- 🔒 ENABLE ROW LEVEL SECURITY (RLS) FOR USER AI CONFIGURATIONS
-- This script fixes the critical security vulnerability where users can access other users' AI configurations

-- 1. Enable Row Level Security on sdlc_user_ai_configurations table
ALTER TABLE sdlc_user_ai_configurations ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policy for users to only access their own configurations
CREATE POLICY "Users can only access their own AI configurations"
ON sdlc_user_ai_configurations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Create RLS policy for sdlc_ai_providers (read-only for authenticated users)
CREATE POLICY "Authenticated users can read AI providers"
ON sdlc_ai_providers
FOR SELECT
TO authenticated
USING (true);

-- 4. Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_configurations', 'sdlc_user_ai_configurations', 'sdlc_ai_providers')
ORDER BY tablename;

-- 5. Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('user_configurations', 'sdlc_user_ai_configurations', 'sdlc_ai_providers')
ORDER BY tablename, policyname;

-- 6. Test user isolation (should only show configurations for the authenticated user)
SELECT 
  'RLS Test - User Configurations' as test_name,
  COUNT(*) as visible_configs,
  COUNT(DISTINCT user_id) as unique_users
FROM sdlc_user_ai_configurations
WHERE is_active = true; 