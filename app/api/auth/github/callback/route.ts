import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // This endpoint handles the GitHub OAuth callback
  // The actual processing is done on the frontend to maintain state
  // This route just ensures the callback URL exists and redirects back
  
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // If there's an error from GitHub
  if (error) {
    const errorDescription = searchParams.get('error_description') || 'Unknown error'
    return NextResponse.redirect(new URL(`/?github_error=${encodeURIComponent(errorDescription)}`, request.url))
  }

  // If successful, redirect back to the main page with the code and state
  // The frontend will handle the token exchange
  if (code && state) {
    return NextResponse.redirect(new URL(`/?code=${code}&state=${state}`, request.url))
  }

  // If no code or state, redirect back to main page
  return NextResponse.redirect(new URL('/', request.url))
}
