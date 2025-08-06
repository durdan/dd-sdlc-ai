import { NextRequest, NextResponse } from 'next/server'
import { rateLimitService } from '@/lib/rate-limit-service'
import { anonymousProjectService } from '@/lib/anonymous-project-service'

export async function GET(request: NextRequest) {
  try {
    // Get session ID from header or generate one
    const sessionId = request.headers.get('x-session-id') || 
                     anonymousProjectService.generateSessionId()
    
    // Get IP address for additional checks
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Check IP reputation
    const ipAllowed = await rateLimitService.checkIPReputation(ipAddress)
    if (!ipAllowed) {
      return NextResponse.json({
        allowed: false,
        remaining: 0,
        reason: 'Too many requests from your network. Please try again later.'
      }, { status: 429 })
    }

    // Check rate limit
    const limitStatus = await rateLimitService.checkAnonymousLimit(sessionId)
    const status = await rateLimitService.getRateLimitStatus(sessionId)

    return NextResponse.json({
      ...limitStatus,
      status,
      sessionId
    })
  } catch (error) {
    console.error('Rate limit check error:', error)
    return NextResponse.json({
      error: 'Failed to check rate limit'
    }, { status: 500 })
  }
}