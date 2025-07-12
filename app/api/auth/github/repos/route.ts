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

    // Get GitHub token from httpOnly cookie (user-specific)
    const cookieStore = await cookies()
    const githubToken = cookieStore.get('github_token')

    if (!githubToken) {
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
          Authorization: `Bearer ${githubToken.value}`,
          'User-Agent': 'SDLC-AI-Platform',
        'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    if (!reposResponse.ok) {
      const errorData = await reposResponse.json().catch(() => ({}))
      return NextResponse.json({ 
        error: 'Failed to fetch repositories from GitHub',
        details: errorData.message || 'GitHub API error',
        connected: false
      }, { status: reposResponse.status })
    }

    const reposData = await reposResponse.json()
    
    // Process and filter repositories
    const repositories = reposData
      .filter((repo: any) => !repo.fork || searchParams.get('include_forks') === 'true')
      .map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        description: repo.description,
        language: repo.language,
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        sshUrl: repo.ssh_url,
        defaultBranch: repo.default_branch,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        size: repo.size,
        stargazersCount: repo.stargazers_count,
        watchersCount: repo.watchers_count,
        forksCount: repo.forks_count,
        openIssuesCount: repo.open_issues_count,
        hasIssues: repo.has_issues,
        hasProjects: repo.has_projects,
        hasWiki: repo.has_wiki,
        hasPages: repo.has_pages,
        archived: repo.archived,
        disabled: repo.disabled,
        permissions: repo.permissions,
        topics: repo.topics || [],
        visibility: repo.visibility
      }))

    // Get Link header for pagination info
    const linkHeader = reposResponse.headers.get('Link')
    const pagination = parseLinkHeader(linkHeader)

    // Update user's GitHub integration record with fresh repository data
    try {
      const { error: dbError } = await supabase
        .from('sdlc_github_integrations')
        .upsert({
          user_id: user.id,
          repository_url: `https://github.com/repos`, // General endpoint
          repository_id: 'user_repos', // Identifier for user repos
          permissions: {
            "issues": "write",
            "pull_requests": "write",
            "contents": "write"
          },
          is_active: true,
          last_sync: new Date().toISOString(),
          metadata: {
            total_repos: repositories.length,
            last_fetch: new Date().toISOString(),
            api_rate_limit: reposResponse.headers.get('X-RateLimit-Remaining')
          }
        }, {
          onConflict: 'user_id,repository_id'
        })

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

// Helper function to parse GitHub's Link header for pagination
function parseLinkHeader(linkHeader: string | null): any {
  if (!linkHeader) return {}
  
  const links: any = {}
  const parts = linkHeader.split(',')
  
  parts.forEach(part => {
    const section = part.split(';')
    if (section.length !== 2) return
    
    const url = section[0].replace(/<(.*)>/, '$1').trim()
    const name = section[1].replace(/rel="(.*)"/, '$1').trim()
    
    const urlObj = new URL(url)
    const page = urlObj.searchParams.get('page')
    
    links[name] = {
      url,
      page: page ? parseInt(page) : null
    }
  })
  
  return links
} 