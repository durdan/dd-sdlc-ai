import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'v0 API is working',
    env: {
      hasSystemKey: !!process.env.V0_SYSTEM_API_KEY,
      systemKeyEnabled: process.env.V0_SYSTEM_KEY_ENABLED !== 'false',
      dailyLimit: process.env.V0_DAILY_LIMIT || '2'
    }
  });
}