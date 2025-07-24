import { NextRequest, NextResponse } from 'next/server';
import { wireframeService } from '@/lib/services/wireframe-service';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { createClient } from '@/lib/supabase/server';

// Input validation schema
const generateWireframeSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  model: z.enum(['gpt-4', 'claude-3-opus', 'claude-3-sonnet', 'v0-dev']),
  projectId: z.string().uuid().optional(),
  templateId: z.string().optional(),
  layoutType: z.enum(['web', 'mobile', 'tablet']).optional(),
  includeAnnotations: z.boolean().optional(),
  includeUserFlow: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    
    // Validate input
    const validationResult = generateWireframeSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Wireframe validation error:', validationResult.error.flatten());
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const params = validationResult.data;
    
    console.log('🔍 Wireframe API: Request params:', {
      model: params.model,
      prompt: params.prompt.substring(0, 50) + '...',
      layoutType: params.layoutType,
    });

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const isAdmin = userData?.role === 'admin';

    // Only check API keys if not using v0-dev and not admin
    if (params.model !== 'v0-dev' && !isAdmin) {
      // Check if user has AI API keys configured
      const { data: userConfig } = await supabase
        .from('user_configurations')
        .select('openai_api_key')
        .eq('user_id', user.id)
        .single();

      const { data: aiConfigs } = await supabase
        .from('sdlc_user_ai_configurations')
        .select('provider_id, encrypted_api_key')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const hasOpenAI = userConfig?.openai_api_key || 
        aiConfigs?.some(c => c.provider_id === '1fdbbf27-6411-476a-bc4d-517c54f68f1d');
      const hasClaude = aiConfigs?.some(c => c.provider_id === 'a346dae4-1425-45ad-9eab-9e4a1cb53122');

      // Validate model availability
      if (params.model === 'gpt-4' && !hasOpenAI) {
        return NextResponse.json(
          { error: 'OpenAI configuration missing. Please configure your OpenAI settings.' },
          { status: 400 }
        );
      }

      if ((params.model === 'claude-3-opus' || params.model === 'claude-3-sonnet') && !hasClaude) {
        return NextResponse.json(
          { error: 'Claude configuration missing. Please configure your Claude settings.' },
          { status: 400 }
        );
      }
    }

    // Check v0.dev availability if selected
    if (params.model === 'v0-dev') {
      const { v0UsageService } = await import('@/lib/services/v0-usage-service');
      const usageCheck = await v0UsageService.checkV0Usage(user.id);
      
      if (!usageCheck.hasOwnKey && !usageCheck.canUseSystemKey) {
        return NextResponse.json(
          { 
            error: usageCheck.message || 'v0.dev is not available. Please add your API key or try again tomorrow.',
            requiresApiKey: !usageCheck.hasOwnKey,
            dailyLimitReached: usageCheck.remainingUsage === 0,
          },
          { status: 400 }
        );
      }
    }

    // Check project ownership if projectId provided
    if (params.projectId) {
      const { data: project } = await supabase
        .from('sdlc_projects')
        .select('id')
        .eq('id', params.projectId)
        .eq('user_id', user.id)
        .single();

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Generate wireframe
    const result = await wireframeService.generateWireframe({
      ...params,
      userId: user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate wireframe' },
        { status: 500 }
      );
    }

    // If projectId provided, save wireframe to database
    if (params.projectId && result.wireframe) {
      try {
        const { error: saveError } = await supabase
          .from('documents')
          .insert({
            project_id: params.projectId,
            document_type: 'wireframe',
            content: JSON.stringify(result.wireframe),
            version: 1,
          });

        if (saveError) {
          console.error('Error saving wireframe to database:', saveError);
        }
      } catch (error) {
        console.error('Error saving wireframe:', error);
      }
    }

    return NextResponse.json({
      success: true,
      wireframe: result.wireframe,
      metadata: result.metadata,
    });

  } catch (error) {
    console.error('Error in wireframe generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200 });
}