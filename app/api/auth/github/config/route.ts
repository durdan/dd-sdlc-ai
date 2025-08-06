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

    // Get GitHub integration configuration from database - prioritize records with tokens
    const { data: gitHubConfig, error } = await supabase
      .from('sdlc_github_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .not('access_token_encrypted', 'is', null)
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

    // Check if we actually have a valid token
    if (!gitHubConfig.access_token_encrypted) {
      // No token means not really connected
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

    // Fetch actual GitHub username from API
    let actualUsername = gitHubConfig.repository_id || ''
    try {
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${gitHubConfig.access_token_encrypted}`,
          'User-Agent': 'SDLC-AI-Platform',
        },
      })
      
      if (userResponse.ok) {
        const githubUser = await userResponse.json()
        actualUsername = githubUser.login
        
        // Update the record with correct username if it's different
        if (gitHubConfig.repository_id !== githubUser.login) {
          await supabase
            .from('sdlc_github_integrations')
            .update({
              repository_id: githubUser.login,
              repository_url: `https://github.com/${githubUser.login}`,
              last_sync: new Date().toISOString()
            })
            .eq('id', gitHubConfig.id)
        }
      }
    } catch (error) {
      console.error('Error fetching GitHub user:', error)
    }

    // Parse permissions and return configuration
    return NextResponse.json({
      connected: true,
      username: actualUsername,
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

    // Only allow updating configuration if username is provided
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Store/update GitHub integration configuration
    // Note: This only updates metadata, not the access token
    // The access token should be stored via the /api/auth/github/store-token endpoint
    const { data: gitHubConfig, error } = await supabase
      .from('sdlc_github_integrations')
      .upsert({
        user_id: user.id,
        repository_url: `https://github.com/${username}`,
        repository_id: `${username}_config`, // Use _config suffix for configuration records
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