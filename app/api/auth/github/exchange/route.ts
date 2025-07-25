import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json({ 
        error: 'GitHub OAuth not configured. Please set NEXT_PUBLIC_GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.' 
      }, { status: 500 })
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`GitHub token exchange failed: ${tokenResponse.statusText}`)
    }

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.json({ 
        error: `GitHub OAuth error: ${tokenData.error_description || tokenData.error}` 
      }, { status: 400 })
    }

    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
    })

  } catch (error) {
    console.error('GitHub OAuth exchange error:', error)
    return NextResponse.json({ 
      error: 'Failed to exchange authorization code for access token' 
    }, { status: 500 })
  }
}
