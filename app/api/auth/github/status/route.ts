import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
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

    // Get GitHub token from httpOnly cookie
    const cookieStore = await cookies()
    const githubToken = cookieStore.get('github_token')

    if (!githubToken) {
      return NextResponse.json({ 
        connected: false, 
        message: 'No GitHub token found' 
      })
    }

    // Verify token by fetching user info from GitHub API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubToken.value}`,
        'User-Agent': 'SDLC-AI-Platform',
      },
    })

    if (!userResponse.ok) {
      // Token is invalid or expired
      return NextResponse.json({ 
        connected: false, 
        message: 'Invalid or expired GitHub token' 
      })
    }

    const userData = await userResponse.json()

    // Fetch user repositories
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${githubToken.value}`,
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
          full_name: repo.full_name,
          private: repo.private,
          description: repo.description,
          language: repo.language,
          updated_at: repo.updated_at,
          permissions: repo.permissions,
        }))
    }

    // Store/update GitHub integration configuration in database
    try {
      const { error: dbError } = await supabase
        .from('sdlc_github_integrations')
        .upsert({
          user_id: user.id,
          repository_url: `https://github.com/${userData.login}`,
          repository_id: userData.login, // Store username as repository_id for account-level config
          permissions: {
            "issues": "write",
            "pull_requests": "write", 
            "contents": "write"
          },
          is_active: true,
          last_sync: new Date().toISOString(),
        }, {
          onConflict: 'user_id,repository_id'
        })

      if (dbError) {
        console.error('Error storing GitHub config to database:', dbError)
        // Don't fail the request if database storage fails
      }
    } catch (dbError) {
      console.error('Error updating GitHub config in database:', dbError)
      // Continue with response even if database update fails
    }

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
      message: 'Failed to check GitHub connection status' 
    }, { status: 500 })
  }
} 