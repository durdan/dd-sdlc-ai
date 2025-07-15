import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UsageTrackingService } from '@/lib/usage-tracking-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { success: false, error: 'Authentication error', details: authError.message },
        { status: 401 }
      )
    }
    
    if (!user) {
      console.log('No user found in request')
      return NextResponse.json(
        { success: false, error: 'No user found' },
        { status: 401 }
      )
    }

    console.log('Checking usage for user:', user.id)
    const usageService = await UsageTrackingService.createServerInstance()
    const usageData = await usageService.checkDailyLimit(user.id)
    
    console.log('Usage data:', usageData)

    return NextResponse.json({
      success: true,
      data: {
        daily_limit: usageData.daily_limit,
        projects_today: usageData.projects_today,
        remaining_projects: usageData.remaining,
        can_create_project: usageData.can_create
      }
    })
  } catch (error) {
    console.error('Error checking usage limit:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 