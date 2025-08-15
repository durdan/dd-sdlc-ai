import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json();
    
    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Register or update device
    const { data, error } = await supabase
      .from('vscode_devices')
      .upsert({
        device_id: deviceId,
        last_seen: new Date().toISOString(),
        user_agent: headers().get('user-agent') || 'Unknown',
        extension_version: headers().get('x-extension-version') || '1.0.0'
      }, {
        onConflict: 'device_id'
      })
      .select()
      .single();

    if (error && error.code !== '23505') { // Ignore duplicate key error
      console.error('Device registration error:', error);
      return NextResponse.json(
        { error: 'Failed to register device' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deviceId,
      registered: true
    });

  } catch (error) {
    console.error('Device registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}