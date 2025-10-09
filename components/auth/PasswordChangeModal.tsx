'use client';

import { useState } from 'react';
import { X, Key, Eye, EyeOff } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '@/lib/database.types';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = useSupabaseClient<Database>();

  if (!isOpen) return null;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
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

      console.log('🔑 PasswordChangeModal: Starting password change');

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ PasswordChangeModal: Password change error:', error);
        setPasswordError(error.message);
        return;
      }

      console.log('✅ PasswordChangeModal: Password changed successfully');
      setPasswordSuccess('Password changed successfully!');
      
      // Clear form and close after 2 seconds
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('❌ PasswordChangeModal: Unexpected password error:', error);
      setPasswordError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface/80 p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold text-text">Change Password</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-text-muted transition hover:bg-muted hover:text-text"
            aria-label="Close password change"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mt-6">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-text placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
            <label className="text-sm font-medium text-text">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-text placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
            <label className="text-sm font-medium text-text">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-text placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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

          {/* Messages */}
          {passwordError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-400">
              {passwordSuccess}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 rounded-lg border border-border/60 bg-background/40 px-4 py-2 text-sm text-text-muted transition hover:border-accent/50 hover:bg-background/80 hover:text-text"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handlePasswordChange}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/80 disabled:opacity-50"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Key className="h-4 w-4" />
            )}
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
