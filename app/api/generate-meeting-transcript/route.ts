import { NextRequest, NextResponse } from 'next/server'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createServerPromptService } from '@/lib/prompt-service-server'
import { createClient } from '@/lib/supabase/server'
import { cleanupDocumentFormatting } from '@/lib/format-cleanup'
import { rateLimitService } from '@/lib/rate-limit-service'
import { anonymousProjectService } from '@/lib/anonymous-project-service'
import { createAnthropic } from '@ai-sdk/anthropic'

interface GenerateMeetingTranscriptRequest {
  transcript: string
  meetingTitle?: string
  meetingDate?: string
  participants?: string[]
  customPrompt?: string
  userId?: string
  projectId?: string
  useAnthropic?: boolean
}

async function getAuthenticatedUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Auth error:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

async function generateMeetingDocumentStreaming(
  transcript: string,
  meetingTitle: string | undefined,
  meetingDate: string | undefined,
  participants: string[] | undefined,
  customPrompt: string | undefined,
  userId: string | undefined,
  projectId: string | undefined,
  useAnthropic: boolean = false
) {
  const promptService = createServerPromptService()
  const startTime = Date.now()
  
  // Choose AI provider based on preference and availability
  let aiClient: any
  let modelName: string
  
  if (useAnthropic && process.env.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    aiClient = anthropic("claude-3-5-sonnet-20241022")
    modelName = "claude-3-5-sonnet"
  } else if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
    aiClient = openai("gpt-4o")
    modelName = "gpt-4o"
  } else {
    throw new Error("No AI provider API key configured")
  }
  
  // Build meeting context
  const meetingContext = []
  if (meetingTitle) {
    meetingContext.push(`Meeting Title: ${meetingTitle}`)
  }
  if (meetingDate) {
    meetingContext.push(`Meeting Date: ${meetingDate}`)
  }
  if (participants && participants.length > 0) {
    meetingContext.push(`Participants: ${participants.join(', ')}`)
  }
  
  const contextHeader = meetingContext.length > 0 
    ? `## Meeting Information\n${meetingContext.join('\n')}\n\n`
    : ''
  
  try {
    // Priority 1: Use custom prompt if provided
    if (customPrompt && customPrompt.trim() !== "") {
      console.log('Using custom prompt for meeting transcript processing')
      
      const processedPrompt = customPrompt
        .replace(/{{transcript}}/g, transcript)
        .replace(/\{transcript\}/g, transcript)
        .replace(/{{input}}/g, transcript)
        .replace(/\{input\}/g, transcript)
        .replace(/{{meeting_title}}/g, meetingTitle || '')
        .replace(/\{meeting_title\}/g, meetingTitle || '')
        .replace(/{{meeting_date}}/g, meetingDate || '')
        .replace(/\{meeting_date\}/g, meetingDate || '')
        .replace(/{{participants}}/g, participants?.join(', ') || '')
        .replace(/\{participants\}/g, participants?.join(', ') || '')
      
      return await streamText({
        model: aiClient,
        prompt: processedPrompt,
        maxTokens: 8000, // Increased for larger outputs
      })
    }

    // Priority 2: Load prompt from database
    const promptTemplate = await promptService.getPromptForExecution('meeting', userId || 'anonymous')
    
    if (promptTemplate?.prompt_content) {
      console.log('✅ Using database prompt for meeting transcript:', promptTemplate.name)
      
      let processedContent = promptTemplate.prompt_content
      
      // Create a comprehensive variable replacement map
      const variableMap = {
        '{{transcript}}': transcript,
        '{transcript}': transcript,
        '{{input}}': transcript,
        '{input}': transcript,
        '{{meeting_title}}': meetingTitle || '',
        '{meeting_title}': meetingTitle || '',
        '{{meeting_date}}': meetingDate || '',
        '{meeting_date}': meetingDate || '',
        '{{participants}}': participants?.join(', ') || '',
        '{participants}': participants?.join(', ') || '',
        '{{context_header}}': contextHeader,
        '{context_header}': contextHeader,
      }
      
      // Apply all variable replacements
      Object.entries(variableMap).forEach(([variable, value]) => {
        const regex = new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        processedContent = processedContent.replace(regex, value)
      })
      
      // Remove any remaining unreplaced variables
      processedContent = processedContent
        .replace(/\{\{[^}]+\}\}/g, '')
        .replace(/\{[^}]+\}/g, '')
      
      // Add context header if not already included
      if (contextHeader && !processedContent.includes(contextHeader)) {
        processedContent = contextHeader + processedContent
      }
      
      console.log(`🚀 Generating meeting document with ${modelName}, content length: ${processedContent.length} chars`)
      
      return await streamText({
        model: aiClient,
        prompt: processedContent,
        maxTokens: 8000,
      })
    }

    // Priority 3: Fallback to hardcoded prompt
    console.warn('No database prompt found, using hardcoded fallback for meeting transcript')
    
    const fallbackPrompt = `You are an expert meeting analyst and requirement documentation specialist. Process the following meeting transcript to generate structured documentation.

${contextHeader}

**Meeting Transcript:**
${transcript}

Generate a comprehensive document with the following sections:

## 1. Meeting Summary

Provide a high-level overview that includes:
- **Meeting Purpose**: The main objective and context
- **Key Participants**: Roles and stakeholders involved (if mentioned)
- **Date/Time**: If mentioned in the transcript
- **Main Topics Discussed**: List the primary discussion points
- **Key Decisions Made**: Important decisions and consensus reached
- **Action Items**: Specific tasks assigned with owners (if mentioned)
- **Next Steps**: Planned follow-up activities

## 2. Requirement Stories

For each requirement or feature discussed in the meeting, create a detailed user story in the following Agile format:

### Story [Number]: [Title]

**As a** [type of user/role]
**I want** [specific functionality/feature]
**So that** [business value/benefit]

**Acceptance Criteria:**
- [ ] [Specific testable criterion 1]
- [ ] [Specific testable criterion 2]
- [ ] [Specific testable criterion 3]
- [ ] [Additional criteria as needed]

**Technical Considerations:**
- [Any technical constraints or considerations mentioned]
- [Integration points discussed]
- [Performance requirements if mentioned]

**Dependencies:**
- [Other stories or systems this depends on]
- [External dependencies mentioned]

**Priority:** [High/Medium/Low based on discussion emphasis]

**Estimated Effort:** [If discussed, otherwise mark as "TBD"]

**Additional Notes:**
- [Any relevant context from the discussion]
- [Risks or concerns raised]
- [Alternative approaches considered]

---

Ensure that:
1. Each story is self-contained and implementable
2. Acceptance criteria are specific and testable
3. Stories follow INVEST principles (Independent, Negotiable, Valuable, Estimable, Small, Testable)
4. Technical details mentioned in the meeting are captured
5. Business context and value are clearly articulated
6. The format is consistent and ready for Jira integration

Focus on extracting actionable requirements and maintaining traceability to the discussion points.`
    
    return await streamText({
      model: aiClient,
      prompt: fallbackPrompt,
      maxTokens: 8000,
    })
    
  } catch (error) {
    console.error('Error in meeting transcript generation:', error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      transcript, 
      meetingTitle,
      meetingDate,
      participants,
      customPrompt, 
      userId, 
      projectId,
      useAnthropic = false
    }: GenerateMeetingTranscriptRequest = await req.json()
    
    console.log('🔍 POST handler - Meeting transcript processing')
    console.log('🔍 Transcript length:', transcript?.length)
    console.log('🔍 Meeting title:', meetingTitle)
    console.log('🔍 Using Anthropic:', useAnthropic)
    
    // Validate API keys
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "No AI provider API key configured" }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate input
    if (!transcript || transcript.trim() === '') {
      return new Response(
        JSON.stringify({ error: "Meeting transcript is required" }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Check transcript size (increased limit for meeting transcripts)
    const MAX_TRANSCRIPT_LENGTH = 100000 // ~25,000 tokens
    if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
      return new Response(
        JSON.stringify({ 
          error: `Transcript is too long. Maximum allowed length is ${MAX_TRANSCRIPT_LENGTH} characters. Current length: ${transcript.length}` 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get authenticated user if not provided
    const user = await getAuthenticatedUser()
    const effectiveUserId = userId || user?.id || 'anonymous'
    
    // Check rate limit for anonymous users (relaxed for meeting transcripts)
    if (!user || effectiveUserId === 'anonymous') {
      const sessionId = req.headers.get('x-session-id') || anonymousProjectService.generateSessionId()
      const limitCheck = await rateLimitService.checkAnonymousLimit(sessionId, 'meeting')
      
      if (!limitCheck.allowed) {
        return new Response(
          JSON.stringify({ 
            error: limitCheck.reason || "Rate limit exceeded for meeting transcript processing",
            remaining: limitCheck.remaining,
            resetAt: limitCheck.resetAt
          }),
          { 
            status: 429, 
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    console.log('🚀 Starting meeting transcript processing...')
    console.log('User ID:', effectiveUserId)
    console.log('Project ID:', projectId)

    const streamResult = await generateMeetingDocumentStreaming(
      transcript,
      meetingTitle,
      meetingDate,
      participants,
      customPrompt,
      effectiveUserId,
      projectId,
      useAnthropic
    )

    // Convert the AI stream to a web-compatible ReadableStream
    const encoder = new TextEncoder()
    let fullContent = ''
    const startTime = Date.now()

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.textStream) {
            const text = chunk
            fullContent += text
            
            // Send SSE format that frontend expects
            const sseData = {
              type: 'chunk',
              content: text,
              fullContent: fullContent
            }
            
            const sseLine = `data: ${JSON.stringify(sseData)}\n\n`
            controller.enqueue(encoder.encode(sseLine))
          }
          
          // Apply formatting cleanup for better display
          const cleanedContent = cleanupDocumentFormatting(fullContent, 'meeting');
          
          // Send completion signal with cleaned content
          const completionData = {
            type: 'complete',
            fullContent: cleanedContent,
            success: true,
            metadata: {
              responseTime: Date.now() - startTime,
              contentLength: cleanedContent.length,
              documentType: 'meeting',
              meetingTitle,
              meetingDate,
              participantCount: participants?.length || 0
            }
          }
          
          const completionLine = `data: ${JSON.stringify(completionData)}\n\n`
          controller.enqueue(encoder.encode(completionLine))
          controller.close()
          
        } catch (error) {
          console.error('Error in stream processing:', error)
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          const errorLine = `data: ${JSON.stringify(errorData)}\n\n`
          controller.enqueue(encoder.encode(errorLine))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error in meeting transcript processing:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process meeting transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}