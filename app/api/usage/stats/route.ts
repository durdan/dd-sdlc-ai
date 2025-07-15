import { NextRequest, NextResponse } from 'next/server'
import { UsageTrackingService } from '@/lib/usage-tracking-service'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create usage tracker instance with server client
    const usageTracker = await UsageTrackingService.createServerInstance()
    
    const stats = await usageTracker.getUserStats(user.id)
    
    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to get user statistics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error getting user stats:', error)
    return NextResponse.json(
      { error: 'Failed to get user statistics' },
      { status: 500 }
    )
  }
} 