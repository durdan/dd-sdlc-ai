import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get GitHub integration configuration from database
    const { data: gitHubConfig, error } = await supabase
      .from('sdlc_github_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching GitHub config:', error)
      return NextResponse.json({ error: 'Failed to fetch GitHub configuration' }, { status: 500 })
    }

    // If no config exists, return default disconnected state
    if (!gitHubConfig) {
      return NextResponse.json({
        connected: false,
        username: '',
        repositories: [],
        permissions: {},
        settings: {
          autoCreateRepo: true,
          generateReadme: true,
          defaultBranch: 'main',
          visibility: 'private',
          enableCodeGeneration: true,
          enableIssueSync: true,
        }
      })
    }

    // Parse permissions and return configuration
    return NextResponse.json({
      connected: true,
      username: gitHubConfig.repository_id || '', // repository_id is stored as username directly
      repositories: [], // Will be populated by separate API call
      permissions: gitHubConfig.permissions || {},
      lastSync: gitHubConfig.last_sync,
      settings: {
        autoCreateRepo: true,
        generateReadme: true,
        defaultBranch: 'main',
        visibility: 'private',
        enableCodeGeneration: true,
        enableIssueSync: true,
      }
    })

  } catch (error) {
    console.error('Error in GitHub config GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { username, repositories, permissions, settings } = await request.json()

    // Get GitHub token from cookie to verify connection
    const cookieStore = await cookies()
    const githubToken = cookieStore.get('github_token')

    if (!githubToken) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 400 })
    }

    // Store/update GitHub integration configuration
    // For now, create a general account record using username as repository_id
    const { data: gitHubConfig, error } = await supabase
      .from('sdlc_github_integrations')
      .upsert({
        user_id: user.id,
        repository_url: `https://github.com/${username}`,
        repository_id: username, // Store username as repository_id for account-level config
        permissions: permissions || {
          "repo": "full",
          "contents": "write",
          "pull_requests": "write", 
          "issues": "write",
          "actions": "write",
          "workflows": "write",
          "hooks": "admin"
        },
        is_active: true,
        last_sync: new Date().toISOString(),
      }, {
        onConflict: 'user_id,repository_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error storing GitHub config:', error)
      return NextResponse.json({ error: 'Failed to store GitHub configuration' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'GitHub configuration saved successfully',
      config: gitHubConfig
    })

  } catch (error) {
    console.error('Error in GitHub config POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 