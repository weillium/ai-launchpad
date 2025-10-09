'use client';

import { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '@/lib/database.types';

export default function LoginForm() {
  const supabase = useSupabaseClient<Database>();

  useEffect(() => {
    console.log('🔐 LoginForm: Component mounted');
    console.log('🔐 LoginForm: Supabase client:', !!supabase);
    console.log('🔐 LoginForm: Site URL:', process.env.NEXT_PUBLIC_SITE_URL);
    console.log('🔐 LoginForm: Redirect URL:', `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`);
    
    // Test Supabase connection
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('🔐 LoginForm: Current session:', { hasSession: !!data.session, error: error?.message });
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 LoginForm: Auth state change:', { event, hasSession: !!session });
      if (event === 'SIGNED_IN' && session) {
        console.log('🔐 LoginForm: User signed in, redirecting...');
        window.location.href = '/';
      }
    });

    return () => {
      console.log('🔐 LoginForm: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface/60 p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-text">Sign in to AI Launchpad</h1>
        <p className="mt-2 text-sm text-text-muted">
          Use email magic links or OAuth providers configured in Supabase.
        </p>
        <div className="mt-6 rounded-xl bg-background/60 p-4">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#2563eb',
                    defaultButtonBackground: '#171b23',
                    defaultButtonBorder: '#2a2f3a',
                    defaultButtonText: '#f5f7fa',
                    inputBackground: '#171b23',
                    inputBorder: '#2a2f3a',
                    inputText: '#f5f7fa',
                    labelText: '#f5f7fa',
                    messageText: '#f5f7fa',
                    anchorTextColor: '#3b82f6',
                    anchorTextHoverColor: '#2563eb'
                  }
                }
              }
            }}
            theme="dark"
            providers={['github', 'google']}
            view="sign_in"
            showLinks={true}
            redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`}
          />
        </div>
      </div>
    </div>
  );
}
