import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Query the user role directly using the user ID
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError) {
      if (roleError.code === 'PGRST116') {
        // No role found - default to 'user'
        return NextResponse.json({
          user: {
            id: user.id,
            email: user.email
          },
          role: 'user'
        })
      } else {
        console.error('Role check error:', roleError)
        return NextResponse.json(
          { error: 'Error checking user role' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      role: roleData.role
    })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    )
  }
} 