import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GitDigest Settings API
 * Manages user preferences for GitDigest automation using existing webhook infrastructure
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's GitDigest settings from the existing table structure
    const { data: userSettings, error } = await supabase
      .from('gitdigest_settings')
      .select('repository_full_name, enabled, auto_digest_on_push, auto_digest_on_pr, daily_digest_enabled')
      .eq('user_id', user.id)

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error loading GitDigest settings:', error)
      return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
    }

    // Convert existing table format to expected UI format
    const selectedRepos = userSettings?.map(setting => setting.repository_full_name) || []
    const hasAnyEnabled = userSettings?.some(setting => setting.enabled) || false
    const hasScheduleEnabled = userSettings?.some(setting => setting.daily_digest_enabled) || false

    const settings = {
      enabled: hasAnyEnabled,
      selectedRepos: selectedRepos,
      triggers: {
        push: userSettings?.some(setting => setting.auto_digest_on_push) ?? true,
        pullRequest: userSettings?.some(setting => setting.auto_digest_on_pr) ?? true,
        issues: false, // Not in existing schema
        release: true // Default
      },
      schedule: {
        enabled: hasScheduleEnabled,
        frequency: 'daily',
        time: '09:00'
      }
    }

    return NextResponse.json({ settings })

  } catch (error) {
    console.error('Error in GitDigest settings GET:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { enabled, selectedRepos, triggers, schedule } = body

    console.log('💾 Saving GitDigest settings for user:', user.email)
    console.log('Settings data:', { enabled, selectedRepos, triggers, schedule })

    // First, delete existing settings for this user
    await supabase
      .from('gitdigest_settings')
      .delete()
      .eq('user_id', user.id)

    // If enabled is false, don't insert any records
    if (!enabled || !selectedRepos || selectedRepos.length === 0) {
      console.log('✅ GitDigest disabled - removed all settings')
      return NextResponse.json({
        message: 'GitDigest disabled successfully',
        settings: { enabled: false, selectedRepos: [], triggers, schedule }
      })
    }

    // Insert new settings for each selected repository
    const settingsToInsert = selectedRepos.map((repoFullName: string) => ({
      user_id: user.id,
      repository_full_name: repoFullName,
      enabled: enabled,
      auto_digest_on_push: triggers?.push ?? true,
      auto_digest_on_pr: triggers?.pullRequest ?? true,
      daily_digest_enabled: schedule?.enabled ?? false
    }))

    const { error } = await supabase
      .from('gitdigest_settings')
      .insert(settingsToInsert)

    if (error) {
      console.error('Error saving GitDigest settings:', error)
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }

    console.log('✅ GitDigest settings saved successfully')

    return NextResponse.json({
      message: 'Settings saved successfully',
      settings: {
        enabled,
        selectedRepos,
        triggers,
        schedule
      }
    })

  } catch (error) {
    console.error('Error in GitDigest settings POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 