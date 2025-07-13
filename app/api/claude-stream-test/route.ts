import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { ClaudeCodeService, AgenticCodeRequest } from '@/lib/claude-service'

export async function POST(request: NextRequest) {
  try {
    console.log('🌊 Claude Stream Test API called')
    
    const supabase = createAdminClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { description = "Create a simple React component" } = await request.json()
    
    console.log(`👤 User ID: ${user.id}`)
    console.log(`📝 Description: ${description}`)

    // Get Claude API key
    let claudeApiKey: string | null = null
    
    try {
      const { data: claudeConfig, error } = await supabase
        .from('sdlc_user_ai_configurations')
        .select('encrypted_api_key, is_active')
        .eq('user_id', user.id)
        .eq('provider_id', 'a346dae4-1425-45ad-9eab-9e4a1cb53122')
        .eq('is_active', true)
        .single()

      if (claudeConfig?.encrypted_api_key) {
        claudeApiKey = claudeConfig.encrypted_api_key
        console.log('✅ Found user Claude API key')
      }
    } catch (error) {
      console.log('⚠️ No user Claude API key found, trying environment')
    }

    if (!claudeApiKey) {
      claudeApiKey = process.env.ANTHROPIC_API_KEY
      if (!claudeApiKey) {
        return NextResponse.json({
          error: 'Claude API key not configured. Please set up Claude in Integration Hub or environment variables.'
        }, { status: 400 })
      }
      console.log('✅ Using environment Claude API key')
    }

    // Create Claude service
    console.log('🤖 Creating Claude service...')
    const claudeService = new ClaudeCodeService({
      apiKey: claudeApiKey,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 8192,
      temperature: 0.1
    })

    // Create a simple request
    const agenticRequest: AgenticCodeRequest = {
      task_type: 'feature_implementation',
      codebase_context: 'React TypeScript project',
      specific_request: description,
      requirements: description
    }

    console.log('🌊 Starting streaming test...')

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('🚀 Stream started')
          controller.enqueue(`data: 🚀 Starting Claude stream test\n\n`)
          
          const streamGenerator = claudeService.streamAgenticCode(agenticRequest)
          let chunkCount = 0
          
          for await (const chunk of streamGenerator) {
            chunkCount++
            console.log(`🌊 Stream chunk ${chunkCount}:`, chunk.slice(0, 100) + '...')
            
            // Send chunk to client
            controller.enqueue(`data: ${JSON.stringify({ 
              type: 'chunk', 
              count: chunkCount, 
              content: chunk 
            })}\n\n`)
            
            // Add a small delay to prevent overwhelming
            await new Promise(resolve => setTimeout(resolve, 10))
          }
          
          console.log(`✅ Streaming completed with ${chunkCount} chunks`)
          controller.enqueue(`data: ${JSON.stringify({ 
            type: 'complete', 
            totalChunks: chunkCount 
          })}\n\n`)
          
        } catch (error) {
          console.error('❌ Streaming failed:', error)
          controller.enqueue(`data: ${JSON.stringify({ 
            type: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })}\n\n`)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('❌ Claude Stream Test API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 