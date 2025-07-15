import { NextRequest, NextResponse } from 'next/server'
import { UsageTrackingService } from '@/lib/usage-tracking-service'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Use regular client for auth check
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin check (reuse your logic)
    let isAdmin = false
    if (user.email === 'durgeshdandotiya@gmail.com') {
      isAdmin = true
    } else {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
        isAdmin = true
      }
    }
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Create SERVICE ROLE CLIENT for admin operations (bypasses RLS)
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!  // This bypasses RLS
    )

    // LIVE AGGREGATION QUERY using service role
    const { data, error } = await adminSupabase.rpc('get_live_admin_analytics')
    if (error) {
      console.error('Error fetching live analytics:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Ensure analytics is always a flat array
    const analytics = Array.isArray(data) ? data : data ? [data] : [];

    return NextResponse.json({
      success: true,
      data: {
        analytics,
      }
    })
  } catch (error) {
    console.error('Error getting analytics:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}