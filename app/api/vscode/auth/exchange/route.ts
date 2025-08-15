import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { code, deviceId } = await request.json();
    
    if (!code || !deviceId) {
      return NextResponse.json(
        { error: 'Code and device ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Verify the auth code (this would be stored temporarily during OAuth flow)
    const { data: authCode, error: codeError } = await supabase
      .from('vscode_auth_codes')
      .select('*')
      .eq('code', code)
      .eq('device_id', deviceId)
      .single();

    if (codeError || !authCode) {
      return NextResponse.json(
        { error: 'Invalid or expired authentication code' },
        { status: 401 }
      );
    }

    // Check if code is expired (5 minutes)
    const codeAge = Date.now() - new Date(authCode.created_at).getTime();
    if (codeAge > 5 * 60 * 1000) {
      // Delete expired code
      await supabase
        .from('vscode_auth_codes')
        .delete()
        .eq('code', code);
      
      return NextResponse.json(
        { error: 'Authentication code has expired' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', authCode.user_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate JWT token for VS Code extension
    const token = jwt.sign(
      {
        userId: userData.id,
        email: userData.email,
        deviceId: deviceId,
        type: 'vscode'
      },
      process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
      { expiresIn: '30d' }
    );

    // Update device with user association
    await supabase
      .from('vscode_devices')
      .update({
        user_id: userData.id,
        authenticated_at: new Date().toISOString()
      })
      .eq('device_id', deviceId);

    // Delete the used auth code
    await supabase
      .from('vscode_auth_codes')
      .delete()
      .eq('code', code);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name
      }
    });

  } catch (error) {
    console.error('Auth exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}