import { NextRequest, NextResponse } from 'next/server';
import { wireframeService } from '@/lib/services/wireframe-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;

    // Get templates
    const templates = await wireframeService.getTemplates(category);

    return NextResponse.json({
      success: true,
      templates,
      count: templates.length,
    });

  } catch (error) {
    console.error('Error fetching wireframe templates:', error);
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