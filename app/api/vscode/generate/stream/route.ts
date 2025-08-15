import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { EnhancedClaudeService } from '@/lib/enhanced-claude-service';
import { PromptService } from '@/lib/prompt-service-server';

interface DecodedToken {
  userId?: string;
  deviceId: string;
}

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const deviceId = headersList.get('x-device-id');
    const authorization = headersList.get('authorization');
    
    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    const { type, input, context } = await request.json();
    
    if (!type || !input) {
      return NextResponse.json(
        { error: 'Document type and input are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let userId: string | null = null;
    let isAuthenticated = false;

    // Check authentication
    if (authorization?.startsWith('Bearer ')) {
      try {
        const token = authorization.substring(7);
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
        ) as DecodedToken;
        userId = decoded.userId || null;
        isAuthenticated = true;
      } catch {
        // Invalid token, treat as anonymous
      }
    }

    // Check usage limits
    const today = new Date().toISOString().split('T')[0];
    const limit = isAuthenticated ? 20 : 10;
    
    // Get or create usage record
    const usageKey = userId || deviceId;
    const { data: usage } = await supabase
      .from('vscode_usage')
      .select('*')
      .eq(userId ? 'user_id' : 'device_id', usageKey)
      .eq('date', today)
      .single();

    const currentCount = usage?.count || 0;
    
    if (currentCount >= limit) {
      return NextResponse.json(
        { 
          error: `Daily limit reached (${limit} documents). ${
            !isAuthenticated ? 'Sign in to get 20 documents per day.' : 'Resets at midnight UTC.'
          }` 
        },
        { status: 429 }
      );
    }

    // For now, we'll use the same generation as the non-streaming endpoint
    // In the future, this could be enhanced to use Server-Sent Events
    const claudeService = new EnhancedClaudeService();
    const promptService = new PromptService();
    
    // Map VS Code document types to our internal types
    const typeMapping: Record<string, string> = {
      'business': 'business',
      'functional': 'functional',
      'technical': 'technical',
      'ux': 'ux',
      'architecture': 'mermaid',
      'wireframe': 'wireframe',
      'coding': 'coding',
      'test': 'test'
    };

    const mappedType = typeMapping[type] || type;
    
    // Get prompt template
    const promptTemplate = await promptService.getPromptForExecution(
      mappedType as any,
      userId || 'anonymous',
      false
    );

    if (!promptTemplate) {
      return NextResponse.json(
        { error: 'Document type not supported' },
        { status: 400 }
      );
    }

    // Enhance input with context if provided
    let enhancedInput = input;
    if (context) {
      const contextInfo = [];
      if (context.projectName) contextInfo.push(`Project: ${context.projectName}`);
      if (context.language) contextInfo.push(`Language: ${context.language}`);
      if (context.framework) contextInfo.push(`Framework: ${context.framework}`);
      
      if (contextInfo.length > 0) {
        enhancedInput = `${contextInfo.join(', ')}\n\n${input}`;
      }
    }

    // Generate the document
    const result = await claudeService.generateDocument(
      mappedType,
      enhancedInput,
      promptTemplate.prompt_content
    );

    if (!result.success || !result.content) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate document' },
        { status: 500 }
      );
    }

    // Update usage count
    if (usage) {
      await supabase
        .from('vscode_usage')
        .update({
          count: currentCount + 1,
          documents: [...(usage.documents || []), {
            type,
            timestamp: new Date().toISOString(),
            title: `${type} Document`
          }]
        })
        .eq('id', usage.id);
    } else {
      await supabase
        .from('vscode_usage')
        .insert({
          device_id: !userId ? deviceId : null,
          user_id: userId,
          date: today,
          count: 1,
          documents: [{
            type,
            timestamp: new Date().toISOString(),
            title: `${type} Document`
          }]
        });
    }

    // Store in documents table if authenticated
    let documentId = null;
    if (userId) {
      const { data: doc } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          project_id: null, // VS Code documents aren't tied to projects
          document_type: mappedType,
          content: result.content,
          title: `${type} Document - VS Code`,
          source: 'vscode',
          metadata: { context }
        })
        .select('id')
        .single();
      
      documentId = doc?.id;
    }

    // Return the same format as the regular endpoint for now
    // Future enhancement: implement true streaming with Server-Sent Events
    return NextResponse.json({
      success: true,
      document: {
        id: documentId || `temp-${Date.now()}`,
        type,
        content: result.content,
        title: `${type} Document`,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('Generate stream error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}