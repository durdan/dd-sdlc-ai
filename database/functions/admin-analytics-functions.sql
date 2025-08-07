-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_live_admin_analytics();
DROP FUNCTION IF EXISTS get_admin_user_stats();

-- Function to get live analytics for admin dashboard
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
      COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as projects_today,
      COUNT(CASE WHEN user_id IS NULL THEN 1 END) as anonymous_projects,
      COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as authenticated_projects
    FROM public.sdlc_projects
  ),
  usage_stats AS (
    SELECT 
      COALESCE(SUM(CASE WHEN api_key_type = 'system' THEN 1 ELSE 0 END), 0) as system_key_usage,
      COALESCE(SUM(CASE WHEN api_key_type = 'user' THEN 1 ELSE 0 END), 0) as user_key_usage,
      COALESCE(SUM(tokens_used), 0) as total_tokens,
      COALESCE(SUM(estimated_cost), 0) as total_cost,
      COALESCE(AVG(generation_time_ms), 0) as avg_time
    FROM public.generation_metrics
    WHERE created_at > NOW() - INTERVAL '24 hours'
  )
  SELECT 
    CURRENT_DATE as analytics_date,
    u.total_users::bigint,
    u.active_users::bigint,
    u.new_users::bigint,
    p.total_projects::bigint,
    p.projects_today::bigint,
    p.anonymous_projects::bigint,
    p.authenticated_projects::bigint,
    us.system_key_usage::integer,
    us.user_key_usage::integer,
    us.total_tokens::bigint,
    us.total_cost::numeric(10,2),
    0.0::numeric as error_rate,
    us.avg_time::numeric
  FROM user_stats u, project_stats p, usage_stats us;
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
GRANT EXECUTE ON FUNCTION get_live_admin_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_user_stats() TO authenticated;