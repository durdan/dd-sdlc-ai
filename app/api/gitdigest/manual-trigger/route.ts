import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Manual GitDigest Trigger API
 * For testing digest generation without webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { repository_full_name, trigger_type = 'manual' } = body

    if (!repository_full_name) {
      return NextResponse.json({ 
        error: 'repository_full_name is required' 
      }, { status: 400 })
    }

    console.log(`🔧 Manual trigger for ${repository_full_name} by ${user.email}`)

    // Check if user has GitDigest enabled for this repository
    const { data: settings } = await supabase
      .from('gitdigest_settings')
      .select('enabled')
      .eq('user_id', user.id)
      .eq('repository_full_name', repository_full_name)
      .eq('enabled', true)
      .single()

    if (!settings) {
      return NextResponse.json({ 
        error: 'GitDigest not enabled for this repository' 
      }, { status: 403 })
    }

    // Add to digest queue
    const { data: queueItem, error: queueError } = await supabase
      .from('gitdigest_queue')
      .insert({
        user_id: user.id,
        repository_full_name,
        trigger_type,
        trigger_context: {
          manual: true,
          triggered_by: user.email,
          timestamp: new Date().toISOString()
        },
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (queueError) {
      console.error('Error queuing digest:', queueError)
      return NextResponse.json({ 
        error: 'Failed to queue digest generation' 
      }, { status: 500 })
    }

    console.log('✅ Digest generation queued:', queueItem?.id)

    // TODO: Trigger background processor here
    // For now, we'll just queue it
    
    return NextResponse.json({
      message: 'Digest generation queued successfully',
      queue_id: queueItem?.id,
      repository: repository_full_name,
      trigger_type,
      status: 'pending'
    })

  } catch (error) {
    console.error('Error in manual trigger:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 