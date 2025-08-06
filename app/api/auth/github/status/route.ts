import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        connected: false, 
        message: 'Not authenticated' 
      })
    }

    // Get user's GitHub integration from database
    const { data: gitHubConfig, error: configError } = await supabase
      .from('sdlc_github_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (configError || !gitHubConfig || !gitHubConfig.access_token_encrypted) {
      return NextResponse.json({ 
        connected: false, 
        message: 'No GitHub integration found for this user' 
      })
    }

    // Verify token by fetching user info from GitHub API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${gitHubConfig.access_token_encrypted}`,
        'User-Agent': 'SDLC-AI-Platform',
      },
    })

    if (!userResponse.ok) {
      // Token is invalid or expired - mark as inactive
      await supabase
        .from('sdlc_github_integrations')
        .update({ is_active: false })
        .eq('id', gitHubConfig.id)
      
      return NextResponse.json({ 
        connected: false, 
        message: 'Invalid or expired GitHub token' 
      })
    }

    const userData = await userResponse.json()

    // Verify the token belongs to the current user
    if (userData.login !== gitHubConfig.github_username) {
      console.error('Token mismatch: expected', gitHubConfig.github_username, 'got', userData.login)
      return NextResponse.json({ 
        connected: false, 
        message: 'GitHub token does not belong to this user' 
      })
    }

    // Fetch user repositories
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${gitHubConfig.access_token_hash}`,
        'User-Agent': 'SDLC-AI-Platform',
      },
    })

    let repositories = []
    if (reposResponse.ok) {
      const reposData = await reposResponse.json()
      repositories = reposData
        .filter((repo: any) => !repo.fork)
        .map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name, // Add camelCase version
          full_name: repo.full_name, // Keep original
          private: repo.private,
          description: repo.description,
          language: repo.language,
          url: repo.html_url, // Add URL for consistency
          html_url: repo.html_url, // Keep original
          updated_at: repo.updated_at,
          permissions: repo.permissions,
        }))
    }

    // Update last sync timestamp
    await supabase
      .from('sdlc_github_integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', gitHubConfig.id)

    return NextResponse.json({
      connected: true,
      user: {
        login: userData.login,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
      },
      repositories: repositories,
      message: `Connected as ${userData.login}`,
    })

  } catch (error) {
    console.error('Error checking GitHub status:', error)
    return NextResponse.json({ 
      connected: false, 
      message: 'Error checking GitHub connection' 
    }, { status: 500 })
  }
} 