import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import LoginForm from '@/components/auth/LoginForm';

export default async function LoginPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/');
  }

  return <LoginForm />;
}
