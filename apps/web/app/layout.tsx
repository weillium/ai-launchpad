import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import './globals.css';
import SupabaseProvider from '@/components/providers/SupabaseProvider';
import { UserProfileProvider } from '@/components/providers/UserProfileProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { AgentStateProvider } from '@/components/providers/AgentStateProvider';
import ProtectedAppShell from '@/components/layout/ProtectedAppShell';
import { createServerClient } from '@supabase/ssr';
import type { Session } from '@supabase/supabase-js';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Launchpad',
  description: 'Hybrid agent workspace with Supabase and Next.js',
  icons: [{ rel: 'icon', url: '/favicon.ico' }]
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
  
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Create a session object from the user data for the provider
  const session: Session | null = user ? { user, access_token: '', refresh_token: '', expires_in: 0, expires_at: 0, token_type: 'bearer' } : null;


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SupabaseProvider initialSession={session}>
          <UserProfileProvider>
            <SessionProvider>
              <AgentStateProvider>
                <ProtectedAppShell>
                  {children}
                </ProtectedAppShell>
              </AgentStateProvider>
            </SessionProvider>
          </UserProfileProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
