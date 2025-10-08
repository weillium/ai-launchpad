import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/layout/AppShell';
import { WorkspaceProvider } from '@/components/providers/WorkspaceProvider';
import type { Database } from '@/lib/database.types';
import type { Agent } from '@/hooks/useAgents';
import type { SessionRecord } from '@/hooks/useSessions';

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return <>{children}</>;
  }

  const [{ data: agents }, { data: sessions }] = await Promise.all([
    supabase.from('agents').select('*').order('name'),
    supabase
      .from('sessions')
      .select('*, agents(*)')
      .eq('user_id', session.user.id)
      .order('last_active_at', { ascending: false })
  ]);

  return (
    <WorkspaceProvider
      initialAgents={(agents ?? []) as Agent[]}
      initialSessions={(sessions ?? []) as SessionRecord[]}
    >
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
