-- 🔒 SECURITY VERIFICATION SCRIPT
-- This script verifies that user isolation is working correctly for AI configurations

-- 1. Check if RLS is enabled on user_configurations
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_configurations', 'sdlc_user_ai_configurations');

-- 2. Check existing RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('user_configurations', 'sdlc_user_ai_configurations');

-- 3. Verify AI provider configurations are user-specific
SELECT 
  'User Configuration Check' as verification_type,
  COUNT(*) as total_configs,
  COUNT(DISTINCT user_id) as unique_users,
  CASE 
    WHEN COUNT(*) = 0 THEN 'No configurations found'
    WHEN COUNT(DISTINCT user_id) = COUNT(*) THEN 'All configs are user-specific ✅'
    ELSE 'WARNING: Some configs may not be user-specific ⚠️'
  END as status
FROM sdlc_user_ai_configurations;

-- 4. Check for any shared configurations (should be none)
SELECT 
  'Shared Configuration Check' as verification_type,
  provider_id,
  COUNT(*) as user_count,
  string_agg(user_id::text, ', ') as user_ids
FROM sdlc_user_ai_configurations
GROUP BY provider_id
HAVING COUNT(*) > 1;

-- 5. Verify AI providers exist and are properly configured
SELECT 
  'AI Provider Check' as verification_type,
  id,
  name,
  type,
  is_active,
  created_at
FROM sdlc_ai_providers
WHERE is_active = true
ORDER BY name;

-- 6. Check for user-specific Claude configurations
SELECT 
  'Claude Configuration Check' as verification_type,
  u.email,
  c.id as config_id,
  p.name as provider_name,
  c.is_active,
  c.last_used,
  CASE 
    WHEN c.encrypted_api_key IS NOT NULL THEN 'Has API Key ✅'
    ELSE 'No API Key'
  END as key_status
FROM sdlc_user_ai_configurations c
JOIN sdlc_ai_providers p ON c.provider_id = p.id
JOIN auth.users u ON c.user_id = u.id
WHERE p.type = 'anthropic'
ORDER BY u.email;

-- 7. Check for any NULL user_id values (security vulnerability)
SELECT 
  'NULL User ID Check' as verification_type,
  COUNT(*) as null_user_configs,
  CASE 
    WHEN COUNT(*) = 0 THEN 'No NULL user IDs found ✅'
    ELSE 'WARNING: Found NULL user IDs - SECURITY VULNERABILITY! ⚠️'
  END as status
FROM sdlc_user_ai_configurations
WHERE user_id IS NULL;

-- 8. Verify encryption key storage (should not be plaintext)
SELECT 
  'API Key Encryption Check' as verification_type,
  COUNT(*) as total_keys,
  COUNT(CASE WHEN encrypted_api_key LIKE 'sk-ant-%' THEN 1 END) as plaintext_keys,
  CASE 
    WHEN COUNT(CASE WHEN encrypted_api_key LIKE 'sk-ant-%' THEN 1 END) = 0 THEN 'All keys encrypted ✅'
    ELSE 'WARNING: Found plaintext API keys - IMPLEMENT ENCRYPTION! ⚠️'
  END as status
FROM sdlc_user_ai_configurations
WHERE encrypted_api_key IS NOT NULL;

-- 9. Check GitHub integrations user isolation
SELECT 
  'GitHub Integration Check' as verification_type,
  COUNT(*) as total_integrations,
  COUNT(DISTINCT user_id) as unique_users,
  CASE 
    WHEN COUNT(*) = 0 THEN 'No GitHub integrations found'
    WHEN COUNT(DISTINCT user_id) = COUNT(*) THEN 'All integrations are user-specific ✅'
    ELSE 'WARNING: Some integrations may not be user-specific ⚠️'
  END as status
FROM sdlc_github_integrations
WHERE is_active = true;

-- 10. Check for duplicate configurations per user
SELECT 
  'Duplicate Configuration Check' as verification_type,
  user_id,
  provider_id,
  COUNT(*) as duplicate_count
FROM sdlc_user_ai_configurations
GROUP BY user_id, provider_id
HAVING COUNT(*) > 1;

-- 11. Summary report
SELECT 
  '=== SECURITY VERIFICATION SUMMARY ===' as summary,
  '' as details
UNION ALL
SELECT 
  'Total Users with AI Configs: ' || COUNT(DISTINCT user_id)::text as summary,
  '' as details
FROM sdlc_user_ai_configurations
UNION ALL
SELECT 
  'Total AI Configurations: ' || COUNT(*)::text as summary,
  '' as details
FROM sdlc_user_ai_configurations
UNION ALL
SELECT 
  'Active AI Providers: ' || COUNT(*)::text as summary,
  '' as details
FROM sdlc_ai_providers
WHERE is_active = true
UNION ALL
SELECT 
  'GitHub Integrations: ' || COUNT(*)::text as summary,
  '' as details
FROM sdlc_github_integrations
WHERE is_active = true;

-- 12. Test query for user isolation (replace with actual user ID)
-- This query should only return configurations for the specified user
-- SELECT 
--   'User Isolation Test' as test_type,
--   c.id,
--   p.name as provider_name,
--   c.is_active,
--   c.last_used
-- FROM sdlc_user_ai_configurations c
-- JOIN sdlc_ai_providers p ON c.provider_id = p.id
-- WHERE c.user_id = 'YOUR_USER_ID_HERE'; 