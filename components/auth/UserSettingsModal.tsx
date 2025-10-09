'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Palette, Save, Key } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useUser } from '@/components/providers/UserProvider';
import PasswordChangeModal from './PasswordChangeModal';
import type { Database } from '@/lib/database.types';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function UserSettingsModal({ isOpen, onClose, userEmail }: UserSettingsModalProps) {
  const { displayName, setDisplayName } = useUser();
  const [localDisplayName, setLocalDisplayName] = useState(displayName);
  const [email, setEmail] = useState(userEmail);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSaveSessions, setAutoSaveSessions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const supabase = useSupabaseClient<Database>();

  // Load existing preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadPreferences = async () => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user?.id) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('email_notifications, auto_save_sessions')
              .eq('user_id', userData.user.id)
              .maybeSingle();

            if (profile) {
              setEmailNotifications(profile.email_notifications ?? true);
              setAutoSaveSessions(profile.auto_save_sessions ?? true);
            }
          }
        } catch (error) {
          console.error('Error loading preferences:', error);
        }
      };

      loadPreferences();
    }
  }, [isOpen, supabase]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('💾 UserSettingsModal: Starting save process');
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user?.id) {
        console.error('❌ UserSettingsModal: Error getting user:', userError);
        return;
      }

      console.log('💾 UserSettingsModal: User ID:', userData.user.id);
      console.log('💾 UserSettingsModal: Saving display name:', localDisplayName);

      // Check if profile exists first
      const { data: existingProfile, error: selectError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      console.log('💾 UserSettingsModal: Existing profile check:', { 
        hasProfile: !!existingProfile, 
        selectError: selectError?.message 
      });

      let data, error;

      const profileData = {
        display_name: localDisplayName,
        email_notifications: emailNotifications,
        auto_save_sessions: autoSaveSessions
      };

      if (existingProfile) {
        // Update existing profile
        console.log('💾 UserSettingsModal: Updating existing profile');
        ({ data, error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', userData.user.id)
          .select());
      } else {
        // Insert new profile
        console.log('💾 UserSettingsModal: Creating new profile');
        ({ data, error } = await supabase
          .from('user_profiles')
          .insert({ 
            user_id: userData.user.id,
            ...profileData
          })
          .select());
      }

      if (error) {
        console.error('❌ UserSettingsModal: Error saving profile:', error);
        return;
      }

      console.log('✅ UserSettingsModal: Profile saved successfully:', data);

      // Update the display name in context
      setDisplayName(localDisplayName);
      console.log('✅ UserSettingsModal: Settings saved:', { displayName: localDisplayName, email });
      onClose();
    } catch (error) {
      console.error('❌ UserSettingsModal: Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-2">
              <User className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-text">User Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition hover:bg-muted hover:text-text"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Display Name Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-text">
              <User className="h-4 w-4" />
              Display Name
            </label>
            <input
              type="text"
              value={localDisplayName}
              onChange={(e) => setLocalDisplayName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Enter your display name"
            />
            <p className="text-xs text-text-muted">
              This name will be shown on your dashboard instead of your email.
            </p>
          </div>

          {/* Email Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-text">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              readOnly
              disabled
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-text-muted cursor-not-allowed"
              placeholder="Email address"
            />
            <p className="text-xs text-text-muted">
              Your email address is managed by your authentication provider and cannot be changed here.
            </p>
          </div>

          {/* Theme Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-text">
              <Palette className="h-4 w-4" />
              Theme
            </label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition hover:bg-muted/30">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  defaultChecked
                  className="h-4 w-4 text-accent"
                />
                <div>
                  <div className="text-sm font-medium text-text">Dark Mode</div>
                  <div className="text-xs text-text-muted">Current theme</div>
                </div>
              </label>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text">Preferences</h3>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-text">Email notifications</span>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-text">Session auto-save</span>
                <input
                  type="checkbox"
                  checked={autoSaveSessions}
                  onChange={(e) => setAutoSaveSessions(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
              </label>
            </div>
          </div>

          {/* Security Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-text">
              <Key className="h-4 w-4" />
              Security
            </label>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full rounded-lg border border-border/60 bg-background/40 px-4 py-3 text-sm text-text transition hover:border-accent/50 hover:bg-background/80 hover:text-text"
            >
              <div className="flex items-center justify-between">
                <span>Change Password</span>
                <Key className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm text-text-muted transition hover:bg-muted hover:text-text"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm text-white transition hover:bg-accent/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
