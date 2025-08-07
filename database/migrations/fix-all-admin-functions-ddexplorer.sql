-- Complete fix for admin functions to work with ddexplorer database structure
-- Run this in the Supabase SQL Editor

-- Drop existing functions
DROP FUNCTION IF EXISTS get_live_admin_analytics();
DROP FUNCTION IF EXISTS get_admin_user_stats();

-- Function to get live analytics (using real data from your tables)
CREATE OR REPLACE FUNCTION get_live_admin_analytics()
RETURNS TABLE (
  analytics_date date,
  total_users bigint,
  active_users bigint,
  new_users bigint,
  total_projects bigint,
  projects_today bigint,
  anonymous_projects bigint,
  authenticated_projects bigint,
  system_key_usage integer,
  user_key_usage integer,
  total_tokens_used bigint,
  total_cost_estimate numeric,
  error_rate numeric,
  avg_generation_time_ms numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      COUNT(DISTINCT au.id) as total_users,
      COUNT(DISTINCT CASE WHEN au.last_sign_in_at > NOW() - INTERVAL '7 days' THEN au.id END) as active_users,
      COUNT(DISTINCT CASE WHEN au.created_at > NOW() - INTERVAL '1 day' THEN au.id END) as new_users
    FROM auth.users au
  ),
  project_stats AS (
    SELECT 
      COUNT(*) as total_projects,
      COUNT(CASE WHEN sp.created_at > NOW() - INTERVAL '1 day' THEN 1 END) as projects_today,
      COUNT(CASE WHEN sp.user_id IS NULL THEN 1 END) as anonymous_projects,
      COUNT(CASE WHEN sp.user_id IS NOT NULL THEN 1 END) as authenticated_projects
    FROM public.sdlc_projects sp
  ),
  -- Use system_analytics table if it has recent data, otherwise use default values
  usage_stats AS (
    SELECT 
      COALESCE(MAX(sa.system_key_usage), 0) as system_key_usage,
      COALESCE(MAX(sa.user_key_usage), 0) as user_key_usage,
      COALESCE(MAX(sa.total_tokens_used), 0) as total_tokens,
      COALESCE(MAX(sa.total_cost_estimate), 0) as total_cost,
      COALESCE(MAX(sa.avg_generation_time_ms), 0) as avg_time
    FROM public.system_analytics sa
    WHERE sa.analytics_date >= CURRENT_DATE - INTERVAL '1 day'
  )
  SELECT 
    CURRENT_DATE as analytics_date,
    us.total_users::bigint,
    us.active_users::bigint,
    us.new_users::bigint,
    ps.total_projects::bigint,
    ps.projects_today::bigint,
    ps.anonymous_projects::bigint,
    ps.authenticated_projects::bigint,
    uss.system_key_usage::integer,
    uss.user_key_usage::integer,
    uss.total_tokens::bigint,
    uss.total_cost::numeric(10,2),
    0.0::numeric as error_rate,
    uss.avg_time::numeric
  FROM user_stats us, project_stats ps, usage_stats uss;
END;
$$;

-- Function to get user statistics for admin dashboard
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
GRANT EXECUTE ON FUNCTION get_live_admin_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_user_stats() TO authenticated;

-- Test the functions
SELECT * FROM get_live_admin_analytics();
SELECT * FROM get_admin_user_stats() LIMIT 5;