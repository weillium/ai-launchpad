-- Add preference columns to user_profiles table
alter table public.user_profiles 
add column if not exists email_notifications boolean default true,
add column if not exists auto_save_sessions boolean default true;
