'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Save, Key, Eye, EyeOff } from 'lucide-react';
import { useUserProfile } from '@/components/providers/UserProfileProvider';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '@/lib/database.types';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function UserSettingsModal({ isOpen, onClose, userEmail }: UserSettingsModalProps) {
  const { displayName, updateProfile } = useUserProfile();
  const [localDisplayName, setLocalDisplayName] = useState(displayName);
  const [isLoading, setIsLoading] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  const supabase = useSupabaseClient<Database>();

  // Load existing display name when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalDisplayName(displayName);
      // Reset password form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordSuccess('');
    }
  }, [isOpen, displayName]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('💾 UserSettingsModal: Saving display name:', localDisplayName);
      
      // Update the display name in context
      await updateProfile({ display_name: localDisplayName });
      console.log('✅ UserSettingsModal: Settings saved:', { displayName: localDisplayName });
      onClose();
    } catch (error) {
      console.error('❌ UserSettingsModal: Unexpected error:', error);
      alert('An unexpected error occurred while saving your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setIsPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      // Validate passwords
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('All password fields are required');
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters');
        return;
      }

      console.log('🔑 UserSettingsModal: Changing password');

      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ UserSettingsModal: Password change error:', error);
        setPasswordError(error.message);
        return;
      }

      console.log('✅ UserSettingsModal: Password changed successfully');
      setPasswordSuccess('Password changed successfully!');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error) {
      console.error('❌ UserSettingsModal: Unexpected password error:', error);
      setPasswordError('An unexpected error occurred while changing your password.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text">User Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition hover:bg-background/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-text">
              <User className="h-4 w-4" />
              Display Name
            </label>
            <input
              type="text"
              value={localDisplayName}
              onChange={(e) => setLocalDisplayName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
              placeholder="Enter your display name"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-text">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full rounded-xl border border-border bg-background/30 px-4 py-3 text-text-muted"
            />
            <p className="text-xs text-text-muted">
              Email cannot be changed. Contact support if you need to update your email address.
            </p>
          </div>

          {/* Password Change Section */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="flex items-center gap-2 text-sm font-medium text-text">
              <Key className="h-4 w-4" />
              Change Password
            </h3>
            
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 pr-12 text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 pr-12 text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 pr-12 text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Messages */}
            {passwordError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
                {passwordSuccess}
              </div>
            )}

            {/* Change Password Button */}
            <button
              onClick={handlePasswordChange}
              disabled={isPasswordLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full rounded-xl bg-background/60 border border-border px-4 py-3 text-text transition hover:bg-background/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPasswordLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-text border-t-transparent" />
                  Changing Password...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Key className="h-4 w-4" />
                  Change Password
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-background/60 px-4 py-3 text-text transition hover:bg-background/80"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-accent-foreground transition hover:bg-accent/90 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}