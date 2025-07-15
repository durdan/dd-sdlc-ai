import { NextRequest, NextResponse } from 'next/server'
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

    // Check if user is admin directly
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
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Call the correct function name we created
    const { data, error } = await adminSupabase.rpc('get_admin_user_stats')
    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Return in the format your frontend expects
    return NextResponse.json({ 
      success: true,
      data: data || [] 
    })
  } catch (error) {
    console.error('Error getting users stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Use regular client for auth check
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    let isAdmin = false
    
    // Method 1: Check if user is the specific super admin email
    if (user.email === 'durgeshdandotiya@gmail.com') {
      isAdmin = true
    } else {
      // Method 2: Check user_profiles table
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

    // Create SERVICE ROLE CLIENT for admin operations
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { user_id, role, daily_limit } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let success = true

    // Update role if provided
    if (role) {
      const { error: roleError } = await adminSupabase
        .from('user_profiles')
        .update({ role: role })
        .eq('user_id', user_id)
      if (roleError) {
        console.error('Role update error:', roleError)
        success = false
      }
    }

    // Update daily limit if provided
    if (daily_limit !== undefined) {
      const { error: limitError } = await adminSupabase
        .from('user_profiles')
        .update({ daily_project_limit: daily_limit })
        .eq('user_id', user_id)
      if (limitError) {
        console.error('Limit update error:', limitError)
        success = false
      }
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
} 

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    let isAdmin = false
    
    // Method 1: Check if user is the specific super admin email
    if (user.email === 'durgeshdandotiya@gmail.com') {
      isAdmin = true
    } else {
      // Method 2: Check user_profiles table
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

    // Add your user creation logic here if needed
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}