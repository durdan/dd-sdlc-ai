import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    const debug = {
      timestamp: new Date().toISOString(),
      supabase_user: {
        authenticated: !authError && !!user,
        user_id: user?.id || null,
        email: user?.email || null,
        error: authError?.message || null
      },
      github_token: {
        present: false,
        expires: null,
        value_preview: null
      },
      github_api: {
        user_endpoint: null,
        repos_endpoint: null
      }
    }

    if (authError || !user) {
      return NextResponse.json({ 
        debug,
        summary: 'Not authenticated with Supabase'
      })
    }

    // Check GitHub token
    const cookieStore = await cookies()
    const githubToken = cookieStore.get('github_token')

    if (githubToken) {
      debug.github_token.present = true
      debug.github_token.value_preview = githubToken.value.substring(0, 8) + '...'
      
      // Test GitHub API user endpoint
      try {
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${githubToken.value}`,
            'User-Agent': 'SDLC-AI-Platform',
          },
        })
        
        debug.github_api.user_endpoint = {
          status: userResponse.status,
          ok: userResponse.ok,
          rate_limit_remaining: userResponse.headers.get('X-RateLimit-Remaining'),
          rate_limit_reset: userResponse.headers.get('X-RateLimit-Reset')
        }

        if (userResponse.ok) {
          const userData = await userResponse.json()
          debug.github_api.user_endpoint.username = userData.login
        } else {
          const errorData = await userResponse.json().catch(() => ({}))
          debug.github_api.user_endpoint.error = errorData.message || 'Unknown error'
        }
      } catch (error) {
        debug.github_api.user_endpoint = {
          error: error instanceof Error ? error.message : 'Network error'
        }
      }

      // Test GitHub repos endpoint
      try {
        const reposResponse = await fetch('https://api.github.com/user/repos?per_page=5&affiliation=owner,collaborator', {
          headers: {
            Authorization: `Bearer ${githubToken.value}`,
            'User-Agent': 'SDLC-AI-Platform',
          },
        })
        
        debug.github_api.repos_endpoint = {
          status: reposResponse.status,
          ok: reposResponse.ok,
          rate_limit_remaining: reposResponse.headers.get('X-RateLimit-Remaining'),
          rate_limit_reset: reposResponse.headers.get('X-RateLimit-Reset')
        }

        if (reposResponse.ok) {
          const reposData = await reposResponse.json()
          debug.github_api.repos_endpoint.repo_count = reposData.length
          debug.github_api.repos_endpoint.first_repo = reposData[0]?.full_name || null
        } else {
          const errorData = await reposResponse.json().catch(() => ({}))
          debug.github_api.repos_endpoint.error = errorData.message || 'Unknown error'
        }
      } catch (error) {
        debug.github_api.repos_endpoint = {
          error: error instanceof Error ? error.message : 'Network error'
        }
      }
    }

    let summary = 'Unknown status'
    if (!debug.github_token.present) {
      summary = 'GitHub token not found in cookies'
    } else if (!debug.github_api.user_endpoint?.ok) {
      summary = 'GitHub token invalid or expired'
    } else if (!debug.github_api.repos_endpoint?.ok) {
      summary = 'GitHub user API works but repos API fails'
    } else {
      summary = 'GitHub integration working properly'
    }

    return NextResponse.json({ 
      debug,
      summary
    })

  } catch (error) {
    return NextResponse.json({ 
      debug: {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      summary: 'Debug endpoint error'
    }, { status: 500 })
  }
} 