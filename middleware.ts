import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

const PUBLIC_PATHS = ['/login', '/auth/callback', '/favicon.ico', '/manifest.json'];

export async function middleware(req: NextRequest) {
  console.log('🚦 Middleware: Processing request to:', req.nextUrl.pathname);
  
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  console.log('🚦 Middleware: User status:', { 
    hasUser: !!user, 
    userId: user?.id,
    email: user?.email 
  });

  const isAuthRoute = PUBLIC_PATHS.some((path) => req.nextUrl.pathname.startsWith(path));
  console.log('🚦 Middleware: Is auth route:', isAuthRoute);

  if (!user && !isAuthRoute) {
    console.log('🚦 Middleware: No user, redirecting to login');
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && req.nextUrl.pathname.startsWith('/login')) {
    console.log('🚦 Middleware: Has user, redirecting from login to dashboard');
    return NextResponse.redirect(new URL('/', req.url));
  }

  console.log('🚦 Middleware: Allowing request to proceed');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
