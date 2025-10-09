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
  console.log('🏗️ ProtectedLayout: Starting layout rendering');
  
  try {
    const supabase = createServerComponentClient<Database>({ cookies: () => cookies() });
    const {
      data: { session }
    } = await supabase.auth.getSession();

    let agents: Agent[] = [];
    let sessions: SessionRecord[] = [];

    if (session) {
      const [{ data: agentsData }, { data: sessionsData }] = await Promise.all([
        supabase.from('agents').select('*').order('name'),
        supabase
          .from('sessions')
          .select('*, agents(*)')
          .eq('user_id', session.user.id)
          .order('last_active_at', { ascending: false })
      ]);
      
      agents = (agentsData ?? []) as Agent[];
      sessions = (sessionsData ?? []) as SessionRecord[];
    }

    console.log('🏗️ ProtectedLayout: Rendering WorkspaceProvider with:', {
      agentsCount: agents.length,
      sessionsCount: sessions.length,
      hasSession: !!session
    });

    return (
      <WorkspaceProvider
        initialAgents={agents}
        initialSessions={sessions}
      >
        <AppShell>{children}</AppShell>
      </WorkspaceProvider>
    );
    
  } catch (error) {
    console.error('🏗️ ProtectedLayout: Error in layout:', error);
    // Fallback: render without WorkspaceProvider
    return (
      <div>
        <p>Layout error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <AppShell>{children}</AppShell>
      </div>
    );
  }
}
