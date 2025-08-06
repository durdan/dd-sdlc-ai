import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// List of suspicious patterns to block
const BLOCKED_PATTERNS = [
  // PHP files
  /\.php$/i,
  /\.php\d$/i,
  /\.phtml$/i,
  
  // WordPress specific
  /wp-content/i,
  /wp-admin/i,
  /wp-includes/i,
  /wp-login/i,
  /wordpress/i,
  
  // Common exploit patterns
  /\.(asp|aspx|jsp|cgi|pl|py|sh|bash)$/i,
  /\.(git|svn|htaccess|htpasswd|env|config)$/i,
  /\.(sql|db|sqlite)$/i,
  
  // Admin paths
  /^\/(admin|administrator|phpmyadmin|pma|cpanel|panel)/i,
  
  // Common vulnerability scanners
  /\/(shell|eval|exec|system|proc|passwd)/i,
  /\/(backup|bak|old|temp|tmp|cache|log)/i,
  
  // Malicious file names from your logs
  /embed\.php/i,
  /vars\.php/i,
  /class-.*\.php/i,
  /wp_filemanager/i,
];

// Security headers to add
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log suspicious requests for monitoring
  const logSuspiciousRequest = (reason: string) => {
    console.log(`[SECURITY] Blocked request: ${request.method} ${pathname} - Reason: ${reason} - IP: ${request.ip || 'unknown'} - User-Agent: ${request.headers.get('user-agent') || 'unknown'}`);
  };

  // Check if the request matches any blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(pathname)) {
      logSuspiciousRequest(`Matched blocked pattern: ${pattern}`);
      
      // Return 404 instead of 403 to not reveal security measures
      return new NextResponse('Not Found', { 
        status: 404,
        headers: SECURITY_HEADERS
      });
    }
  }
  
  // Block requests with suspicious query parameters
  const searchParams = request.nextUrl.searchParams;
  const suspiciousParams = ['cmd', 'exec', 'shell', 'eval', 'system'];
  
  for (const param of suspiciousParams) {
    if (searchParams.has(param)) {
      logSuspiciousRequest(`Suspicious query parameter: ${param}`);
      return new NextResponse('Not Found', { 
        status: 404,
        headers: SECURITY_HEADERS
      });
    }
  }
  
  // Block requests with suspicious headers
  const suspiciousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
  for (const header of suspiciousHeaders) {
    const value = request.headers.get(header);
    if (value && (value.includes('http://') || value.includes('https://') || value.includes('../'))) {
      logSuspiciousRequest(`Suspicious header: ${header}=${value}`);
      return new NextResponse('Not Found', { 
        status: 404,
        headers: SECURITY_HEADERS
      });
    }
  }

  // For API routes, ensure proper content-type
  if (pathname.startsWith('/api/')) {
    const contentType = request.headers.get('content-type');
    const method = request.method;
    
    // Block non-JSON POST/PUT/PATCH requests to API
    if (['POST', 'PUT', 'PATCH'].includes(method) && contentType && !contentType.includes('application/json')) {
      logSuspiciousRequest(`Invalid content-type for API: ${contentType}`);
      return new NextResponse('Bad Request', { 
        status: 400,
        headers: SECURITY_HEADERS
      });
    }
  }
  
  // Update Supabase session
  const response = await updateSession(request);
  
  // Add security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add CSP header for additional protection
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.anthropic.com https://api.github.com; " +
    "frame-ancestors 'none';"
  );
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};