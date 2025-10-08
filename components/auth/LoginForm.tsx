'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '@/lib/database.types';

export default function LoginForm() {
  const supabase = useSupabaseClient<Database>();

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
                    defaultButtonText: '#f5f7fa',
                    inputBackground: '#0f1115',
                    inputBorder: '#2a2f3a'
                  }
                }
              }
            }}
            providers={['github', 'google']}
            redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`}
          />
        </div>
      </div>
    </div>
  );
}
