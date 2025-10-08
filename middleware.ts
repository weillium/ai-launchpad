import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

const PUBLIC_PATHS = ['/auth', '/auth/callback', '/favicon.ico', '/manifest.json'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const isAuthRoute = PUBLIC_PATHS.some((path) => req.nextUrl.pathname.startsWith(path));

  if (!session && !isAuthRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
