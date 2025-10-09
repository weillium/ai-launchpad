import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

const PUBLIC_PATHS = ['/login', '/auth/callback', '/favicon.ico', '/manifest.json'];

export async function middleware(req: NextRequest) {
  console.log('🚦 Middleware: Processing request to:', req.nextUrl.pathname);
  
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  console.log('🚦 Middleware: Session status:', { 
    hasSession: !!session, 
    userId: session?.user?.id,
    email: session?.user?.email 
  });

  const isAuthRoute = PUBLIC_PATHS.some((path) => req.nextUrl.pathname.startsWith(path));
  console.log('🚦 Middleware: Is auth route:', isAuthRoute);

  if (!session && !isAuthRoute) {
    console.log('🚦 Middleware: No session, redirecting to login');
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && req.nextUrl.pathname.startsWith('/login')) {
    console.log('🚦 Middleware: Has session, redirecting from login to dashboard');
    return NextResponse.redirect(new URL('/', req.url));
  }

  console.log('🚦 Middleware: Allowing request to proceed');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
