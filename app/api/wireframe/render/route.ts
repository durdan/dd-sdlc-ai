import { NextRequest, NextResponse } from 'next/server';
import { svgRenderer, htmlRenderer } from '@/lib/services/wireframe-renderer';
import { z } from 'zod';
import type { WireframeData, RenderOptions } from '@/lib/types/wireframe.types';

// Input validation schema
const renderWireframeSchema = z.object({
  wireframe: z.object({
    title: z.string(),
    description: z.string(),
    layout: z.object({
      type: z.enum(['web', 'mobile', 'tablet']),
      dimensions: z.object({
        width: z.number(),
        height: z.number(),
      }),
    }),
    components: z.array(z.any()), // Complex nested structure, simplified validation
    annotations: z.array(z.any()).optional(),
  }),
  format: z.enum(['svg', 'html']),
  options: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    showAnnotations: z.boolean().optional(),
    showGrid: z.boolean().optional(),
    interactive: z.boolean().optional(),
    scale: z.number().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const validationResult = renderWireframeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const { wireframe, format, options = {} } = validationResult.data;

    // Render based on format
    let rendered: string;
    const startTime = Date.now();

    try {
      if (format === 'svg') {
        rendered = svgRenderer.render(wireframe as WireframeData, options as RenderOptions);
      } else {
        rendered = htmlRenderer.render(wireframe as WireframeData, options as RenderOptions);
      }
    } catch (renderError) {
      console.error('Rendering error:', renderError);
      return NextResponse.json(
        { 
          error: 'Failed to render wireframe',
          details: renderError instanceof Error ? renderError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    const renderTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      [format]: rendered,
      metadata: {
        format,
        size: rendered.length,
        renderTime,
      },
    });

  } catch (error) {
    console.error('Error in wireframe rendering:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export rendered wireframe as file
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'svg';
    const wireframeData = searchParams.get('data');

    if (!wireframeData) {
      return NextResponse.json(
        { error: 'Missing wireframe data' },
        { status: 400 }
      );
    }

    let wireframe: WireframeData;
    try {
      wireframe = JSON.parse(decodeURIComponent(wireframeData));
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid wireframe data' },
        { status: 400 }
      );
    }

    // Render the wireframe
    let content: string;
    let contentType: string;
    let filename: string;

    if (format === 'svg') {
      content = svgRenderer.render(wireframe);
      contentType = 'image/svg+xml';
      filename = `${wireframe.title.toLowerCase().replace(/\s+/g, '-')}.svg`;
    } else if (format === 'html') {
      content = htmlRenderer.render(wireframe);
      contentType = 'text/html';
      filename = `${wireframe.title.toLowerCase().replace(/\s+/g, '-')}.html`;
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use svg or html.' },
        { status: 400 }
      );
    }

    // Return as downloadable file
    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error in wireframe export:', error);
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