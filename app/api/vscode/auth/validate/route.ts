import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { valid: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authorization.substring(7);
    
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
      );
      
      return NextResponse.json({
        valid: true,
        decoded
      });
    } catch (error) {
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}