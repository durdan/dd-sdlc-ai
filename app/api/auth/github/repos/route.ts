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
        error: 'GitHub not connected. Please connect your GitHub account first.',
        connected: false 
      }, { status: 400 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '30')
    const sort = searchParams.get('sort') || 'updated'
    const affiliation = searchParams.get('affiliation') || 'owner,collaborator'
    const visibility = searchParams.get('visibility') || 'all'

    // Fetch user repositories from GitHub API with user's token
    // NOTE: Cannot use both 'type' and 'affiliation' parameters together - GitHub API restriction
    const reposResponse = await fetch(
      `https://api.github.com/user/repos?` + 
      `page=${page}&per_page=${perPage}&sort=${sort}&affiliation=${affiliation}&visibility=${visibility}`,
      {
      headers: {
          Authorization: `Bearer ${gitHubConfig.access_token_encrypted}`,
          'User-Agent': 'SDLC-AI-Platform',
        'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    if (!reposResponse.ok) {
      console.error('GitHub API error:', reposResponse.status, reposResponse.statusText)
      return NextResponse.json({ 
        error: 'Failed to fetch repositories from GitHub',
        connected: false 
      }, { status: reposResponse.status })
    }

    const reposData = await reposResponse.json()
    
    // Transform repositories to consistent format
    const repositories = reposData.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      full_name: repo.full_name,
      private: repo.private,
      description: repo.description,
      language: repo.language,
      url: repo.html_url,
      html_url: repo.html_url,
      updated_at: repo.updated_at,
      permissions: repo.permissions,
      owner: {
        login: repo.owner.login,
        type: repo.owner.type,
        avatar_url: repo.owner.avatar_url
      }
    }))

    // Extract pagination info from headers
    const linkHeader = reposResponse.headers.get('Link')
    const pagination = {
      page,
      perPage,
      hasNext: false,
      hasPrev: false,
      nextPage: null,
      prevPage: null
    }

    if (linkHeader) {
      const links = linkHeader.split(',').map(link => {
        const [url, rel] = link.split(';')
        const pageMatch = url.match(/[?&]page=(\d+)/)
        const pageNum = pageMatch ? parseInt(pageMatch[1]) : null
        const relType = rel.includes('next') ? 'next' : rel.includes('prev') ? 'prev' : null
        return { rel: relType, page: pageNum }
      })

      links.forEach(link => {
        if (link.rel === 'next') {
          pagination.hasNext = true
          pagination.nextPage = link.page
        } else if (link.rel === 'prev') {
          pagination.hasPrev = true
          pagination.prevPage = link.page
        }
      })
    }

    // Update user's GitHub integration record with fresh repository data
    try {
      const { error: dbError } = await supabase
        .from('sdlc_github_integrations')
        .update({
          repositories: repositories,
          last_sync: new Date().toISOString()
        })
        .eq('id', gitHubConfig.id)

      if (dbError) {
        console.error('Error updating GitHub integration:', dbError)
      }
    } catch (dbError) {
      console.error('Error updating database:', dbError)
    }

    return NextResponse.json({
      success: true,
      repositories,
      pagination,
      totalCount: repositories.length,
      connected: true,
      metadata: {
        page,
        perPage,
        sort,
        affiliation,
        visibility,
        rateLimitRemaining: reposResponse.headers.get('X-RateLimit-Remaining'),
        rateLimitReset: reposResponse.headers.get('X-RateLimit-Reset')
      }
    })

  } catch (error) {
    console.error('Error fetching GitHub repositories:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      connected: false 
    }, { status: 500 })
  }
} 