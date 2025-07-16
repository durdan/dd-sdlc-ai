import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { page, userAgent, referrer, timestamp } = await request.json()
    
    // Use service role client to bypass RLS for anonymous analytics
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Log the visit to anonymous analytics
    const { error } = await supabase.from('anonymous_analytics').insert({
      action_type: 'page_visit',
      action_data: {
        page,
        referrer,
        timestamp
      },
      user_agent: userAgent,
      timestamp: new Date().toISOString()
    })
    
    if (error) {
      console.error('Error inserting visit:', error)
      throw error
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking visit:', error)
    return NextResponse.json({ error: 'Failed to track visit' }, { status: 500 })
  }
} 