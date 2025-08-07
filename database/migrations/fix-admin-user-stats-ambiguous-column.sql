-- Fix ambiguous column reference in get_admin_user_stats function
-- Run this in the Supabase SQL Editor

-- Drop existing function
DROP FUNCTION IF EXISTS get_admin_user_stats();

-- Recreate with fixed ambiguous column reference
CREATE OR REPLACE FUNCTION get_admin_user_stats()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  subscription_type text,
  total_projects_created bigint,
  projects_today bigint,
  last_login_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_projects AS (
    SELECT 
      user_id::uuid,
      COUNT(*) as total_projects,
      COUNT(CASE WHEN sp.created_at > NOW() - INTERVAL '1 day' THEN 1 END) as today_projects
    FROM public.sdlc_projects sp
    WHERE user_id IS NOT NULL
    GROUP BY user_id
  ),
  user_roles AS (
    SELECT 
      user_id::uuid,
      role as user_role
    FROM public.user_roles
  )
  SELECT 
    au.id,
    au.email::text,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email)::text as full_name,
    COALESCE(ur.user_role, 'user')::text as role,
    COALESCE(au.raw_user_meta_data->>'subscription_type', 'free')::text as subscription_type,
    COALESCE(up.total_projects, 0)::bigint as total_projects_created,
    COALESCE(up.today_projects, 0)::bigint as projects_today,
    au.last_sign_in_at,
    au.created_at
  FROM auth.users au
  LEFT JOIN user_projects up ON up.user_id = au.id
  LEFT JOIN user_roles ur ON ur.user_id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_admin_user_stats() TO authenticated;