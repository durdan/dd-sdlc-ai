import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { apiKey, model } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'API key is required' 
      }, { status: 400 })
    }

    if (!apiKey.startsWith('sk-ant-')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid API key format. Claude API keys start with "sk-ant-"' 
      }, { status: 400 })
    }

    // Test the API key with a simple request
    const anthropic = new Anthropic({
      apiKey: apiKey,
    })

    try {
      const message = await anthropic.messages.create({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ]
      })

      return NextResponse.json({ 
        success: true, 
        message: 'API key is valid and working',
        model: model || 'claude-3-5-sonnet-20241022'
      })

    } catch (apiError: any) {
      console.error('Claude API test error:', apiError)
      
      let errorMessage = 'Invalid API key or connection failed'
      
      if (apiError.status === 401) {
        errorMessage = 'Invalid API key. Please check your Anthropic Console for the correct key.'
      } else if (apiError.status === 403) {
        errorMessage = 'API key does not have permission to use Claude. Please check your billing and usage limits.'
      } else if (apiError.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.'
      } else if (apiError.message) {
        errorMessage = apiError.message
      }

      return NextResponse.json({ 
        success: false, 
        error: errorMessage 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Claude test endpoint error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 