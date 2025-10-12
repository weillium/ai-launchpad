'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import type { Database } from '@/lib/database.types';

interface UserProfileContextType {
  // User identity
  user: any | null;
  profile: Database['public']['Tables']['user_profiles']['Row'] | null;
  loading: boolean;
  
  // User preferences (derived from profile)
  displayName: string;
  emailNotifications: boolean;
  autoSaveSessions: boolean;
  
  // Actions
  updateProfile: (updates: Partial<Database['public']['Tables']['user_profiles']['Update']>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  console.log('🎯 UserProfileProvider: Provider rendering');
  
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Database['public']['Tables']['user_profiles']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient<Database>();

  // Load user and profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          console.log('🔍 UserProfileProvider: No user found');
          setUser(null);
          setProfile(null);
          return;
        }

        setUser(userData.user);
        console.log('👤 UserProfileProvider: User loaded:', userData.user.email);

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userData.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('❌ UserProfileProvider: Error loading profile:', profileError);
          return;
        }

        setProfile(profileData);
        console.log('📋 UserProfileProvider: Profile loaded:', profileData);
        
      } catch (error) {
        console.error('❌ UserProfileProvider: Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [supabase]);

  // Derived values
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const emailNotifications = profile?.email_notifications ?? true;
  const autoSaveSessions = profile?.auto_save_sessions ?? true;

  // Update profile function
  const updateProfile = async (updates: Partial<Database['public']['Tables']['user_profiles']['Update']>) => {
    if (!user?.id) {
      console.error('❌ UserProfileProvider: No user ID for update');
      return;
    }

    try {
      console.log('💾 UserProfileProvider: Updating profile:', updates);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ UserProfileProvider: Update failed:', error);
        throw error;
      }

      setProfile(data);
      console.log('✅ UserProfileProvider: Profile updated successfully');
      
    } catch (error) {
      console.error('❌ UserProfileProvider: Update error:', error);
      throw error;
    }
  };

  // Refresh profile function
  const refreshProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ UserProfileProvider: Refresh failed:', error);
        return;
      }

      setProfile(data);
      console.log('🔄 UserProfileProvider: Profile refreshed');
      
    } catch (error) {
      console.error('❌ UserProfileProvider: Refresh error:', error);
    }
  };

  const value: UserProfileContextType = {
    user,
    profile,
    loading,
    displayName,
    emailNotifications,
    autoSaveSessions,
    updateProfile,
    refreshProfile
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
