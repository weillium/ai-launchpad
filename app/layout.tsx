import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import './globals.css';
import SupabaseProvider from '@/components/providers/SupabaseProvider';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

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
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SupabaseProvider initialSession={session}>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
