'use client';

import { useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useUser } from '@/components/providers/UserProvider';
import type { Database } from '@/lib/database.types';

export default function ProfileInitializer() {
  const supabase = useSupabaseClient<Database>();
  const { userEmail } = useUser();

  useEffect(() => {
    const initializeProfile = async () => {
      console.log('🔄 ProfileInitializer: Starting profile initialization');
      try {
        // Check if profile exists
        console.log('🔍 ProfileInitializer: Checking if profile exists');
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('id, display_name')
          .maybeSingle();

        console.log('📋 ProfileInitializer: Profile check result:', {
          hasProfile: !!profile,
          error: error?.message
        });

        // If no profile exists, create one
        if (!profile && !error) {
          console.log('🆕 ProfileInitializer: No profile found, creating new one');
          const { data: user } = await supabase.auth.getUser();
          if (user.user?.id) {
            console.log('👤 ProfileInitializer: Creating profile for user:', user.user.id);
            const { data, error: insertError } = await supabase.from('user_profiles').upsert({
              user_id: user.user.id,
              display_name: userEmail.split('@')[0] || 'User'
            });
            
            if (insertError) {
              console.error('❌ ProfileInitializer: Error creating profile:', insertError);
            } else {
              console.log('✅ ProfileInitializer: Profile created successfully:', data);
            }
          }
        } else if (profile) {
          console.log('✅ ProfileInitializer: Profile already exists:', profile);
        }
      } catch (error) {
        console.error('❌ ProfileInitializer: Unexpected error:', error);
      }
    };

    initializeProfile();
  }, [supabase, userEmail]);

  return null; // This component doesn't render anything
}
