import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        user: null 
      })
    }

    // Get all GitHub integrations for this user
    const { data: allIntegrations, error: allError } = await supabase
      .from('sdlc_github_integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Get active integrations with tokens
    const { data: activeIntegrations, error: activeError } = await supabase
      .from('sdlc_github_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .not('access_token_encrypted', 'is', null)
      .order('created_at', { ascending: false })

    // Test the token if we have one
    let tokenValid = false
    let githubUser = null
    if (activeIntegrations && activeIntegrations.length > 0) {
      const integration = activeIntegrations[0]
      try {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${integration.access_token_encrypted}`,
            'User-Agent': 'SDLC-AI-Platform',
          },
        })
        tokenValid = response.ok
        if (response.ok) {
          githubUser = await response.json()
        }
      } catch (error) {
        console.error('Error testing token:', error)
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      allIntegrations: allIntegrations?.map(i => ({
        id: i.id,
        repository_id: i.repository_id,
        is_active: i.is_active,
        has_token: !!i.access_token_encrypted,
        created_at: i.created_at,
      })),
      activeIntegrations: activeIntegrations?.map(i => ({
        id: i.id,
        repository_id: i.repository_id,
        is_active: i.is_active,
        has_token: !!i.access_token_encrypted,
        created_at: i.created_at,
      })),
      tokenValid,
      githubUser: githubUser ? {
        login: githubUser.login,
        name: githubUser.name,
        email: githubUser.email,
      } : null,
      summary: {
        totalIntegrations: allIntegrations?.length || 0,
        activeWithTokens: activeIntegrations?.length || 0,
        tokenWorks: tokenValid,
      }
    })

  } catch (error) {
    console.error('Error in debug test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}