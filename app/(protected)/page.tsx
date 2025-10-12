import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AgentGrid from '@/components/dashboard/AgentGrid';
import LogoutButton from '@/components/auth/LogoutButton';
import SettingsButton from '@/components/auth/SettingsButton';
import DisplayName from '@/components/auth/DisplayName';
import { UserProvider } from '@/components/providers/UserProvider';
import type { Agent } from '@/hooks/useAgents';

export default async function DashboardPage() {
  console.log('🚀 DashboardPage: Starting to load dashboard');
  const supabase = createServerComponentClient({ cookies });
  
  console.log('📊 DashboardPage: Fetching user data and agents');
  const [{ data: agents }, userProfile, { data: profile, error: profileError }] = await Promise.all([
    supabase.from('agents').select('*').order('name'),
    supabase.auth.getUser(),
    supabase.from('user_profiles').select('display_name').maybeSingle()
  ]);

  console.log('👤 DashboardPage: User profile data:', {
    email: userProfile.data?.user?.email,
    userId: userProfile.data?.user?.id,
    hasProfile: !!profile,
    profileError: profileError?.message
  });

  const userEmail = userProfile.data?.user?.email ?? 'Explorer';
  const displayName = (profile as { display_name?: string } | null)?.display_name || userEmail.split('@')[0] || 'User';
  
  console.log('✅ DashboardPage: Final display name:', displayName);

  return (
    <UserProvider initialEmail={userEmail} initialDisplayName={displayName}>
      <div className="space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-wide text-accent/80">Welcome back</p>
            <div className="flex items-center gap-2">
              <SettingsButton userEmail={userEmail} />
              <LogoutButton />
            </div>
          </div>
          <DisplayName />
          <p className="text-sm text-text-muted">
            Click on any agent to view its details and configuration.
          </p>
        </header>
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text">Available Agents</h2>
            <p className="text-xs uppercase tracking-wide text-text-muted">Config-driven &amp; custom</p>
          </div>
          <AgentGrid agents={(agents ?? []) as Agent[]} />
        </section>
      </div>
    </UserProvider>
  );
}
