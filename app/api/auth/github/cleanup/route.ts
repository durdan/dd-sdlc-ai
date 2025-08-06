import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Delete all GitHub integrations for this user that don't have access tokens
    const { error: deleteError } = await supabase
      .from('sdlc_github_integrations')
      .delete()
      .eq('user_id', user.id)
      .is('access_token_encrypted', null)

    if (deleteError) {
      console.error('Error cleaning up GitHub integrations:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to cleanup GitHub integrations' 
      }, { status: 500 })
    }

    // Also set any remaining integrations without tokens to inactive
    const { error: updateError } = await supabase
      .from('sdlc_github_integrations')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .is('access_token_encrypted', null)

    if (updateError) {
      console.error('Error deactivating invalid integrations:', updateError)
    }

    return NextResponse.json({ 
      success: true,
      message: 'GitHub integrations cleaned up successfully. Please reconnect your GitHub account.' 
    })

  } catch (error) {
    console.error('Failed to cleanup GitHub integrations:', error)
    return NextResponse.json({ 
      error: 'Failed to cleanup GitHub integrations' 
    }, { status: 500 })
  }
}