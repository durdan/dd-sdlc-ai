import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's GitHub integration with token
    const { data: gitHubConfig, error: configError } = await supabase
      .from('sdlc_github_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .not('access_token_encrypted', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (configError || !gitHubConfig || !gitHubConfig.access_token_encrypted) {
      return NextResponse.json({ 
        error: 'GitHub not connected',
        connected: false 
      }, { status: 400 })
    }

    // Fetch actual GitHub username from API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${gitHubConfig.access_token_encrypted}`,
        'User-Agent': 'SDLC-AI-Platform',
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch GitHub user info',
        connected: false 
      }, { status: 500 })
    }

    const githubUser = await userResponse.json()

    // Update the record with the correct username if needed
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

    return NextResponse.json({
      success: true,
      username: githubUser.login,
      name: githubUser.name,
      avatar_url: githubUser.avatar_url,
      public_repos: githubUser.public_repos,
      followers: githubUser.followers,
      following: githubUser.following
    })

  } catch (error) {
    console.error('Error fetching GitHub username:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}