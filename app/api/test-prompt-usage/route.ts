import { NextRequest, NextResponse } from 'next/server'
import { createServerPromptService } from '@/lib/prompt-service-server'

export async function POST(req: NextRequest) {
  try {
    const { documentType, userId } = await req.json()
    
    console.log(`🔍 Testing prompt usage for ${documentType}...`)
    
    const promptService = createServerPromptService()
    
    // Test prompt retrieval without generation
    const promptTemplate = await promptService.getPromptForExecution(documentType, userId || 'anonymous')
    
    const result = {
      documentType,
      userId: userId || 'anonymous',
      promptFound: !!promptTemplate,
      promptSource: promptTemplate ? 'database' : 'not_found',
      promptName: promptTemplate?.name || null,
      promptId: promptTemplate?.id || null,
      contentLength: promptTemplate?.prompt_content?.length || 0,
      timestamp: new Date().toISOString()
    }
    
    console.log(`✅ Prompt test result:`, result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error testing prompt usage:', error)
    return NextResponse.json({ 
      error: 'Failed to test prompt usage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 