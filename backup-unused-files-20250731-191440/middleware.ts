import { NextResponse } from 'next/server';

// IMPORTANT: All custom middleware logic is temporarily disabled to allow for a Neon-only deployment.
// This file can be restored or adapted when Supabase integration is resumed.

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
