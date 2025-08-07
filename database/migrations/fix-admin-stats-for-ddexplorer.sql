-- Fix admin user stats function for ddexplorer database structure
-- Run this in the Supabase SQL Editor

-- Drop existing function
DROP FUNCTION IF EXISTS get_admin_user_stats();

-- Create simplified function that works with existing table structure
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
      sp.user_id::uuid as project_user_id,
      COUNT(*) as total_projects,
      COUNT(CASE WHEN sp.created_at > NOW() - INTERVAL '1 day' THEN 1 END) as today_projects
    FROM public.sdlc_projects sp
    WHERE sp.user_id IS NOT NULL
    GROUP BY sp.user_id
  ),
  user_role_data AS (
    SELECT 
      ur.user_id as role_user_id,
      ur.role as user_role
    FROM public.user_roles ur
  )
  SELECT 
    au.id,
    au.email::text,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email)::text as full_name,
    COALESCE(urd.user_role, 'user')::text as role,
    COALESCE(au.raw_user_meta_data->>'subscription_type', 'free')::text as subscription_type,
    COALESCE(up.total_projects, 0)::bigint as total_projects_created,
    COALESCE(up.today_projects, 0)::bigint as projects_today,
    au.last_sign_in_at,
    au.created_at
  FROM auth.users au
  LEFT JOIN user_projects up ON up.project_user_id = au.id
  LEFT JOIN user_role_data urd ON urd.role_user_id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_admin_user_stats() TO authenticated;