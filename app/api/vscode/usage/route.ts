import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId?: string;
  deviceId: string;
}

export async function GET(request: NextRequest) {
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

    const supabase = await createClient();
    let userId: string | null = null;
    let isAuthenticated = false;

    // Check if user is authenticated
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

    // Get today's date in UTC
    const today = new Date().toISOString().split('T')[0];
    
    // Get usage for today
    const { data: usage, error } = await supabase
      .from('vscode_usage')
      .select('*')
      .eq(userId ? 'user_id' : 'device_id', userId || deviceId)
      .eq('date', today)
      .single();

    const limit = isAuthenticated ? 20 : 10;
    const used = usage?.count || 0;
    
    // Calculate reset time (midnight UTC)
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const hoursUntilReset = Math.floor((tomorrow.getTime() - Date.now()) / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor(((tomorrow.getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({
      used,
      limit,
      remaining: Math.max(0, limit - used),
      resetTime: `${hoursUntilReset}h ${minutesUntilReset}m`,
      isAuthenticated,
      date: today
    });

  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}