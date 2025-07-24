import { NextRequest, NextResponse } from 'next/server';
import { wireframeService } from '@/lib/services/wireframe-service';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// Input validation schema
const enhanceWireframeSchema = z.object({
  wireframe: z.object({
    title: z.string(),
    description: z.string(),
    layout: z.any(),
    components: z.array(z.any()),
    annotations: z.array(z.any()).optional(),
  }),
  enhancementType: z.enum(['full', 'accessibility', 'mobile', 'interactions', 'content']),
  model: z.enum(['gpt-4', 'claude-3-opus', 'claude-3-sonnet']),
  specificRequirements: z.string().optional(),
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
    const validationResult = enhanceWireframeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const params = validationResult.data;

    // Enhance wireframe
    const result = await wireframeService.enhanceWireframe({
      ...params,
      userId: user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to enhance wireframe' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      wireframe: result.wireframe,
      metadata: result.metadata,
    });

  } catch (error) {
    console.error('Error in wireframe enhancement:', error);
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