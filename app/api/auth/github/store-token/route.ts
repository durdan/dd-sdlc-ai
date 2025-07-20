import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json()

    if (!access_token) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify the token belongs to the current user by fetching GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': 'SDLC-AI-Platform',
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Invalid GitHub token' }, { status: 400 })
    }

    const githubUserData = await userResponse.json()

    // Store the token in the database with user-specific isolation
    const { data: gitHubConfig, error: dbError } = await supabase
      .from('sdlc_github_integrations')
      .upsert({
        user_id: user.id,
        github_username: githubUserData.login,
        access_token_hash: access_token, // In production, this should be encrypted
        repository_url: `https://github.com/${githubUserData.login}`,
        repository_id: githubUserData.login,
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
      .select()
      .single()

    if (dbError) {
      console.error('Error storing GitHub token:', dbError)
      return NextResponse.json({ 
        error: 'Failed to store GitHub token' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: `GitHub token stored for user ${githubUserData.login}`,
      config: gitHubConfig
    })

  } catch (error) {
    console.error('Failed to store GitHub token:', error)
    return NextResponse.json({ 
      error: 'Failed to store GitHub token' 
    }, { status: 500 })
  }
}
