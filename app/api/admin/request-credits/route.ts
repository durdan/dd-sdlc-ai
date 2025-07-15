import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { message, currentUsage } = await request.json()
    
    // Store credit request in database
    const { error: insertError } = await supabase
      .from('credit_requests')
      .insert({
        user_id: user.id,
        message: message || 'Requesting additional credits',
        current_usage: currentUsage || {},
        status: 'pending',
        created_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('Error storing credit request:', insertError)
      return NextResponse.json({ error: 'Failed to store request' }, { status: 500 })
    }
    
    // Optionally, send notification to admin team
    // This could be a webhook, email, or Slack notification
    try {
      console.log(`Credit request from user ${user.email}: ${message}`)
      // TODO: Add notification logic here (email, Slack, etc.)
    } catch (notifyError) {
      console.warn('Failed to send notification:', notifyError)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Credit request submitted successfully' 
    })
    
  } catch (error) {
    console.error('Error in credit request API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 