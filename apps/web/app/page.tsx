'use client';

import { useSession } from '@/components/providers/SessionProvider';
import { useUserProfile } from '@/components/providers/UserProfileProvider';
import AgentGrid from '@/components/dashboard/AgentGrid';
import SessionManager from '@/components/dashboard/SessionManager';
import { useAgents } from '@/hooks/useAgents';

export default function DashboardPage() {
  console.log('🎯 DashboardPage: Client component rendering');
  
  const { activeSession } = useSession();
  const { displayName } = useUserProfile();
  const { agents, isLoading } = useAgents();
  
  console.log('🎯 DashboardPage: Provider data', {
    hasActiveSession: !!activeSession,
    agentsCount: agents?.length,
    isLoading
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {activeSession ? (
        // Show session manager when there's an active session
        <SessionManager />
      ) : (
        // Show homepage with available agents when no active session
        <>
          <header className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-accent/80">Welcome back</p>
            <h1 className="text-2xl font-semibold text-text">
              {displayName || 'User'}
            </h1>
            <p className="text-sm text-text-muted">
              Select an agent from the sidebar to start a new session, or browse available agents below.
            </p>
          </header>
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text">Available Agents</h2>
              <p className="text-xs uppercase tracking-wide text-text-muted">Config-driven &amp; custom</p>
            </div>
            <AgentGrid agents={agents} />
          </section>
        </>
      )}
    </div>
  );
}
