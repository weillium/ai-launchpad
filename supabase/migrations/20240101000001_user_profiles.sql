-- Create user profiles table
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id)
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Create policies
create policy "Users can view their own profile" on public.user_profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert their own profile" on public.user_profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own profile" on public.user_profiles
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile for new users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to update updated_at
create or replace trigger handle_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();
