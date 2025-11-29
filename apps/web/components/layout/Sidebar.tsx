'use client';

import { useState } from 'react';
import { 
  Menu, 
  PanelLeftClose, 
  Settings, 
  User,
  MessageSquare
} from 'lucide-react';
import { useUserProfile } from '@/components/providers/UserProfileProvider';
import { useSession } from '@/components/providers/SessionProvider';
import UserSettingsModal from '@/components/auth/UserSettingsModal';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '@/lib/database.types';

export default function Sidebar() {
  console.log('🎯 SIDEBAR RENDERING');
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { user, displayName } = useUserProfile();
  const { 
    activeSessionId, 
    userSessions, 
    switchSession,
    clearActiveSession
  } = useSession();
  const supabase = useSupabaseClient<Database>();

  const handleHomeClick = () => {
    console.log('🏠 Sidebar: Home button clicked - clearing active session');
    if (clearActiveSession) {
      clearActiveSession();
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Sidebar: Logging out user');
      await supabase.auth.signOut();
      console.log('✅ Sidebar: Logout successful');
    } catch (error) {
      console.error('❌ Sidebar: Logout failed:', error);
    }
  };

  const handleSwitchSession = async (sessionId: string) => {
    try {
      await switchSession(sessionId);
      console.log('🔄 Sidebar: Switched to session:', sessionId);
    } catch (error) {
      console.error('❌ Sidebar: Failed to switch session:', error);
    }
  };

  const formatSessionTitle = (session: { title?: string | null; created_at: string } | null | undefined) => {
    if (!session) return 'Unknown Session';
    if (session.title && session.title !== `Session ${new Date(session.created_at).toLocaleDateString()}`) {
      return session.title;
    }
    return `Session ${new Date(session.created_at).toLocaleDateString()}`;
  };

  return (
    <>
      <aside
        className={`flex flex-col border-r border-border bg-surface transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-72'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={handleHomeClick}
            className="text-xl font-bold text-text hover:text-accent transition-colors"
            title="Home - View all available mini-apps"
          >
            {!isCollapsed ? 'AI Launchpad' : 'AI'}
          </button>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-md p-2 text-text-muted hover:bg-background/60 hover:text-text"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>

        {/* Sessions List */}
        <nav className="flex-1 space-y-2 p-4">
          {userSessions.length > 0 && (
            <div className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-2 py-1 text-xs uppercase tracking-wide text-text-muted">
                  Sessions
                </h3>
              )}
              {userSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSwitchSession(session.id)}
                  className={`flex w-full items-center gap-3 rounded-md p-2 text-left text-sm font-medium transition-colors ${
                    activeSessionId === session.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-text-muted hover:bg-background/60 hover:text-text'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  {!isCollapsed && (
                    <span className="flex-1 truncate">
                      {formatSessionTitle(session)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* User Profile and Settings */}
        <div className="mt-auto border-t border-border p-4">
          {user && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-accent" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{displayName}</p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowSettings(true)}
                className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm font-medium text-text-muted hover:bg-background/60 hover:text-text"
              >
                <Settings className="h-5 w-5" />
                {!isCollapsed && (
                  <span className="flex-1 truncate">Settings</span>
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm font-medium text-text-muted hover:bg-background/60 hover:text-text"
                title="Sign out"
              >
                <Settings className="h-5 w-5" />
                {!isCollapsed && <span>Sign out</span>}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Settings Modal */}
      {showSettings && (
        <UserSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          userEmail={user?.email || 'guest@example.com'}
        />
      )}
    </>
  );
}