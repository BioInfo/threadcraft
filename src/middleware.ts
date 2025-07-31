import { NextResponse, type NextRequest } from 'next/server';

/**
 * Lightweight middleware to add basic security headers and guard POST content-type.
 * Note: API rate limiting is implemented inside the route for accuracy with IP headers.
 */
export function middleware(req: NextRequest) {
  // Enforce JSON on API POST
  if (req.nextUrl.pathname.startsWith('/api/') && req.method === 'POST') {
    const ct = req.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }
  }

  const res = NextResponse.next();

  // Security headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};