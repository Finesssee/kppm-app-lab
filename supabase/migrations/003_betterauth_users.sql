-- Create a trigger function to update 'updated_at' timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

-- 1. Users table
-- This table stores user information.
create table public.users (
    id uuid primary key,
    email text unique,
    name text,
    image text,
    github_username text,
    github_token text,
    replicate_token text,
    tier text default 'free'::text not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);
comment on column public.users.id is 'References auth.users.id';
comment on column public.users.github_token is 'Encrypted GitHub access token.';
comment on column public.users.replicate_token is 'Encrypted Replicate API token.';

-- Add trigger for updated_at on users table
create trigger update_users_updated_at
before update on public.users
for each row
execute function public.update_updated_at_column();

-- RLS for users table
alter table public.users enable row level security;
create policy "Users can view their own information." on public.users
  for select using (id = auth.uid());
create policy "Users can update their own information." on public.users
  for update using (id = auth.uid());


-- 2. User Profiles table
-- This table stores additional, optional profile information for users.
create table public.user_profiles (
    user_id uuid primary key references public.users(id) on delete cascade,
    bio text,
    website text,
    twitter_handle text,
    skills text[],
    stats jsonb
);

-- RLS for user_profiles table
alter table public.user_profiles enable row level security;
create policy "Users can manage their own profile." on public.user_profiles
  for all using (user_id = auth.uid());
create policy "Profiles are viewable by everyone." on public.user_profiles
  for select using (true);


-- 3. API Keys table
-- This table stores API keys for users.
create table public.api_keys (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    name text,
    key_prefix text not null unique,
    key_hash text not null unique,
    created_at timestamptz default now() not null,
    expires_at timestamptz,
    last_used_at timestamptz
);
create index idx_api_keys_user_id on public.api_keys(user_id);

-- RLS for api_keys table
alter table public.api_keys enable row level security;
create policy "Users can manage their own API keys." on public.api_keys
  for all using (user_id = auth.uid());


-- 4. BetterAuth tables (Accounts and Sessions)
-- These tables are for authentication, often used with libraries like Auth.js (NextAuth).

create table public.accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    type text not null,
    provider text not null,
    provider_account_id text not null,
    refresh_token text,
    access_token text,
    expires_at bigint,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);
create unique index idx_accounts_provider_provider_account_id on public.accounts(provider, provider_account_id);
create index idx_accounts_user_id on public.accounts(user_id);

-- Add trigger for updated_at on accounts table
create trigger update_accounts_updated_at
before update on public.accounts
for each row
execute function public.update_updated_at_column();

-- RLS for accounts table
alter table public.accounts enable row level security;
create policy "Users can manage their own accounts." on public.accounts
  for all using (user_id = auth.uid());


create table public.sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    session_token text not null unique,
    expires timestamptz not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);
create index idx_sessions_user_id on public.sessions(user_id);

-- Add trigger for updated_at on sessions table
create trigger update_sessions_updated_at
before update on public.sessions
for each row
execute function public.update_updated_at_column();

-- RLS for sessions table
alter table public.sessions enable row level security;
create policy "Users can manage their own sessions." on public.sessions
  for all using (user_id = auth.uid());


-- Function to sync new users from auth.users to public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, image)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 5. Update existing RLS policies
-- The following are examples of how you might update RLS policies on existing tables.
-- You will need to replace 'your_table_name' with your actual table names (e.g., 'apps', 'deployments').
-- You may also need to DROP existing policies before creating new ones if they conflict.
-- This example assumes your tables have a 'user_id' column that references an owner.

/*
-- Example for a table named 'apps'
-- First, you might need to drop the old policy. You need to know its name.
-- DROP POLICY "Old App Policy" ON public.apps;

-- Then, create a new policy that uses auth.uid() and the user_id column.
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY; -- Ensure RLS is enabled
CREATE POLICY "Users can manage their own apps" ON public.apps
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Repeat for other tables like 'deployments', 'predictions', 'runs', etc.
*/