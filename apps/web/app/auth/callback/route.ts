import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export async function GET(req: NextRequest) {
  console.log('🔄 Auth Callback: Starting auth callback');
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  const redirectTo = new URL(next, requestUrl.origin);
  
  console.log('🔄 Auth Callback: Request details:', {
    url: req.url,
    code: !!code,
    next,
    redirectTo: redirectTo.toString()
  });
  
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  if (code) {
    console.log('🔄 Auth Callback: Exchanging code for session');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('🔄 Auth Callback: Session exchange result:', { 
      success: !!data.session, 
      error: error?.message 
    });
  } else {
    console.log('❌ Auth Callback: No code provided');
  }

  console.log('🔄 Auth Callback: Redirecting to:', redirectTo.toString());
  return NextResponse.redirect(redirectTo);
}
