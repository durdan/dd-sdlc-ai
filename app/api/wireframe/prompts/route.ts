import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { wireframePromptService } from '@/lib/services/wireframe-prompt-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');

    let prompts;

    if (type === 'templates') {
      prompts = await wireframePromptService.getTemplatePrompts();
    } else if (type === 'enhancement') {
      prompts = await wireframePromptService.getEnhancementPrompts();
    } else if (type === 'user') {
      prompts = await wireframePromptService.getUserPrompts();
    } else if (category) {
      prompts = await wireframePromptService.getPromptsByCategory(category);
    } else {
      prompts = await wireframePromptService.getActivePrompts();
    }

    return NextResponse.json({
      success: true,
      prompts,
    });
  } catch (error) {
    console.error('Error fetching wireframe prompts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prompts',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, prompt_template, category, layout_type, variables } = body;

    if (!name || !prompt_template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and prompt template are required',
        },
        { status: 400 }
      );
    }

    const prompt = await wireframePromptService.createPrompt({
      name,
      description,
      prompt_template,
      category,
      layout_type,
      variables,
      is_active: true,
      is_default: false,
    });

    if (!prompt) {
      throw new Error('Failed to create prompt');
    }

    return NextResponse.json({
      success: true,
      prompt,
    });
  } catch (error) {
    console.error('Error creating wireframe prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create prompt',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt ID is required',
        },
        { status: 400 }
      );
    }

    const prompt = await wireframePromptService.updatePrompt(id, updates);

    if (!prompt) {
      throw new Error('Failed to update prompt');
    }

    return NextResponse.json({
      success: true,
      prompt,
    });
  } catch (error) {
    console.error('Error updating wireframe prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update prompt',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt ID is required',
        },
        { status: 400 }
      );
    }

    const success = await wireframePromptService.deletePrompt(id);

    if (!success) {
      throw new Error('Failed to delete prompt');
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting wireframe prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete prompt',
      },
      { status: 500 }
    );
  }
}