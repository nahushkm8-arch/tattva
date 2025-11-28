-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Extends auth.users)
-- This table is automatically populated via a trigger when a new user signs up.
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on profiles table
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- 3. AUTOMATIC PROFILE CREATION TRIGGER
-- This function creates a profile entry whenever a new user is created in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
