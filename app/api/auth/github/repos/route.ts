import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const githubToken = cookieStore.get('github_token')?.value

    if (!githubToken) {
      return NextResponse.json({ 
        error: 'GitHub not connected',
        repositories: []
      }, { status: 401 })
    }

    // Fetch user's repositories from GitHub API
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SDLC-AI-Platform'
      }
    })

    if (!response.ok) {
      console.error('GitHub API error:', response.status, response.statusText)
      return NextResponse.json({ 
        error: 'Failed to fetch repositories',
        repositories: []
      }, { status: response.status })
    }

    const repos = await response.json()
    
    // Filter and format repositories
    const formattedRepos = repos
      .filter((repo: any) => !repo.archived && !repo.disabled) // Only active repos
      .map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        defaultBranch: repo.default_branch,
        private: repo.private,
        description: repo.description,
        language: repo.language,
        updatedAt: repo.updated_at,
        permissions: {
          admin: repo.permissions?.admin || false,
          push: repo.permissions?.push || false,
          pull: repo.permissions?.pull || false
        }
      }))
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) // Sort by most recently updated

    return NextResponse.json(formattedRepos)

  } catch (error) {
    console.error('Error fetching GitHub repositories:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      repositories: []
    }, { status: 500 })
  }
} 