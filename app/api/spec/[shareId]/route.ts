import { NextRequest, NextResponse } from 'next/server';
import { getSpecByShareId, incrementViewCount } from '@/lib/spec-storage-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const spec = await getSpecByShareId(shareId);

    if (!spec) {
      return NextResponse.json(
        { error: 'Specification not found' },
        { status: 404 }
      );
    }

    // Increment view count in background
    incrementViewCount(shareId);

    return NextResponse.json({
      success: true,
      spec: {
        id: spec.id,
        shareId: spec.share_id,
        markdown: spec.spec_markdown,
        metadata: spec.metadata,
        viewCount: spec.view_count,
        createdAt: spec.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching spec:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specification' },
      { status: 500 }
    );
  }
}
