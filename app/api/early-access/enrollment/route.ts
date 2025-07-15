import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user has an existing enrollment
    const { data: enrollment, error: selectError } = await supabase
      .from('early_access_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (selectError) {
      console.error('Error checking enrollment:', selectError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    if (!enrollment) {
      return NextResponse.json({ 
        hasEnrollment: false,
        status: null,
        enrollment: null
      })
    }
    
    return NextResponse.json({
      hasEnrollment: true,
      status: enrollment.enrollment_status,
      enrollment: enrollment
    })
    
  } catch (error) {
    console.error('Error checking enrollment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 