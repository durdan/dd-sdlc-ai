import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated', hasAccess: false },
        { status: 401 }
      )
    }

    // Check if user is the specific super admin email (bootstrap)
    if (user.email === 'durgeshdandotiya@gmail.com') {
      return NextResponse.json({
        hasAccess: true,
        userRole: 'super_admin',
        source: 'email_bootstrap',
        user: {
          id: user.id,
          email: user.email
        }
      })
    }

    // Check user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile && !profileError) {
      const userRole = profile.role || 'user'
      const hasAdminAccess = userRole === 'admin' || userRole === 'super_admin'
      
      return NextResponse.json({
        hasAccess: hasAdminAccess,
        userRole,
        source: 'user_profiles',
        user: {
          id: user.id,
          email: user.email
        }
      })
    }

    // Fallback to user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleData && !roleError) {
      const userRole = roleData.role || 'user'
      const hasAdminAccess = userRole === 'admin' || userRole === 'super_admin'
      
      return NextResponse.json({
        hasAccess: hasAdminAccess,
        userRole,
        source: 'user_roles',
        user: {
          id: user.id,
          email: user.email
        }
      })
    }

    // Default to no access
    return NextResponse.json({
      hasAccess: false,
      userRole: 'user',
      source: 'default',
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Admin access check error:', error)
    return NextResponse.json(
      { error: 'Internal server error', hasAccess: false },
      { status: 500 }
    )
  }
} 