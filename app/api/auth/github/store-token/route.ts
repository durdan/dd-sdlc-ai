import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json()

    if (!access_token) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 })
    }

    // Store the token in an httpOnly cookie for security
    // In production, you might want to encrypt the token or store it in a database
    const response = NextResponse.json({ success: true })
    
    response.cookies.set('github_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Failed to store GitHub token:', error)
    return NextResponse.json({ 
      error: 'Failed to store GitHub token' 
    }, { status: 500 })
  }
}
