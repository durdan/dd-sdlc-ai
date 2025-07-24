import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v0UsageService } from '@/lib/services/v0-usage-service';

export async function GET(req: NextRequest) {
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

    // Check v0 usage
    const usageCheck = await v0UsageService.checkV0Usage(user.id);
    const stats = await v0UsageService.getUserV0Stats(user.id, 30);
    
    return NextResponse.json({
      ...usageCheck,
      stats: {
        totalUsage: stats.totalUsage,
        dailyAverage: stats.dailyAverage,
      }
    });
  } catch (error) {
    console.error('Error checking v0 usage:', error);
    return NextResponse.json(
      { error: 'Failed to check v0 usage' },
      { status: 500 }
    );
  }
}