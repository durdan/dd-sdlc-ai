import { NextRequest, NextResponse } from 'next/server'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { createServerPromptService } from '@/lib/prompt-service-server'
import { DatabaseService } from '@/lib/database-service'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const input = searchParams.get('input') || ''
  const documentTypesParam = searchParams.get('documentTypes') || 'business,functional,technical,ux'
  const aiProvider = searchParams.get('aiProvider') || 'auto'
  const model = searchParams.get('model') || undefined
  const customPrompt = searchParams.get('customPrompt') || undefined
  const quality = searchParams.get('quality') || 'medium'
  const projectId = searchParams.get('projectId') || undefined
  
  // Parse document types
  const documentTypes = documentTypesParam.split(',').filter(Boolean)
  
  // For anonymous users, generate a session ID
  const sessionId = req.headers.get('x-session-id') || crypto.randomUUID()
  
  try {
    // Initialize services
    const promptService = createServerPromptService()
    const dbService = new DatabaseService()
    
    // Determine AI provider
    let aiClient: any
    let modelToUse: string
    
    if (aiProvider === 'openai' || (aiProvider === 'auto' && process.env.OPENAI_API_KEY)) {
      aiClient = createOpenAI({ 
        apiKey: process.env.OPENAI_API_KEY || '' 
      })
      modelToUse = model || 'gpt-4-turbo-preview'
    } else if (aiProvider === 'anthropic' || (aiProvider === 'auto' && process.env.ANTHROPIC_API_KEY)) {
      aiClient = createAnthropic({ 
        apiKey: process.env.ANTHROPIC_API_KEY || '' 
      })
      modelToUse = model || 'claude-3-opus-20240229'
    } else {
      return NextResponse.json(
        { error: 'No AI provider configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.' },
        { status: 500 }
      )
    }
    
    // Create a readable stream for SSE
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Save project if needed
        let savedProjectId = projectId
        if (!savedProjectId) {
          const projectData = await dbService.createProject({
            title: input.substring(0, 100),
            input_text: input,
            user_id: null,
            session_id: sessionId,
            status: 'in_progress'
          })
          savedProjectId = projectData?.id
        }
        
        // Generate documents sequentially
        for (const docType of documentTypes) {
          try {
            // Send start event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'start',
              documentType: docType,
              message: `Generating ${docType} document...`
            })}\n\n`))
            
            // Get prompt template
            const promptTemplate = await promptService.getPromptForExecution(
              docType as any,
              null
            )
            
            // Build the prompt
            const systemPrompt = customPrompt || promptTemplate?.prompt || `Generate a comprehensive ${docType} document`
            const userPrompt = `Generate a ${docType} document for: ${input}`
            
            // Stream the response
            const result = await streamText({
              model: aiClient(modelToUse),
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: quality === 'high' ? 0.3 : quality === 'low' ? 0.9 : 0.7,
              maxTokens: 4000,
            })
            
            let fullContent = ''
            for await (const chunk of result.textStream) {
              fullContent += chunk
              // Send progress chunks - catch errors if controller is closed
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'progress',
                  documentType: docType,
                  content: chunk
                })}\n\n`))
              } catch (error) {
                console.log(`Client disconnected while streaming ${docType}`)
                break
              }
            }
            
            // Save document to database
            if (savedProjectId) {
              try {
                await dbService.createDocument({
                  project_id: savedProjectId,
                  type: docType as any,
                  content: fullContent,
                  title: `${docType} Document`,
                  user_id: null
                })
              } catch (dbError) {
                console.error('Error saving document:', dbError)
              }
            }
            
            // Send completion event - catch errors if controller is closed
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'complete',
                documentType: docType,
                message: `${docType} document completed`
              })}\n\n`))
            } catch (error) {
              console.log(`Client disconnected before completion of ${docType}`)
            }
            
          } catch (error) {
            console.error(`Error generating ${docType}:`, error)
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                documentType: docType,
                error: error instanceof Error ? error.message : 'Unknown error'
              })}\n\n`))
            } catch {
              console.log(`Could not send error to client for ${docType}`)
            }
          }
        }
        
        // Send final completion
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            projectId: savedProjectId,
            message: 'All documents generated successfully'
          })}\n\n`))
        } catch {
          console.log('Could not send final done message to client')
        }
        
        controller.close()
      }
    })
    
    // Return SSE response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Session-Id': sessionId
      }
    })
    
  } catch (error) {
    console.error('Stream generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    },
  })
}