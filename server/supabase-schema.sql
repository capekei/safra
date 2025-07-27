-- SafraReport Supabase Database Schema
-- This script sets up the necessary tables and triggers for Supabase authentication

-- Enable Row Level Security
alter database postgres set "app.jwt_secret" to 'your-jwt-secret-here';

-- Create users table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  profile_image_url text,
  role text check (role in ('user', 'admin')) default 'user',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_sign_in timestamp with time zone
);

-- Enable RLS on users table
alter table public.users enable row level security;

-- Create RLS policies for users table
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Admins can view all users" on public.users
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, first_name, last_name, profile_image_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      'https://ui-avatars.com/api/?name=' || 
      encode(coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)), 'escape') ||
      '&background=00ff00&color=fff'
    ),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to handle user updates
create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.users
  set
    email = new.email,
    updated_at = now()
  where id = new.id;
  return new;
end;
$$;

-- Create trigger for user updates
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();

-- Create function to update last sign in
create or replace function public.update_last_sign_in()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.last_sign_in_at is distinct from old.last_sign_in_at then
    update public.users
    set last_sign_in = new.last_sign_in_at
    where id = new.id;
  end if;
  return new;
end;
$$;

-- Create trigger for sign in tracking
drop trigger if exists on_auth_user_sign_in on auth.users;
create trigger on_auth_user_sign_in
  after update on auth.users
  for each row execute procedure public.update_last_sign_in();

-- Create indexes for better performance
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_active on public.users(is_active);
create index if not exists idx_users_created_at on public.users(created_at);

-- Insert default admin user (optional - can be done via migration script)
-- insert into auth.users (
--   id,
--   instance_id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   raw_user_meta_data,
--   is_super_admin,
--   role
-- ) values (
--   gen_random_uuid(),
--   '00000000-0000-0000-0000-000000000000',
--   'admin@safrareport.com',
--   crypt('SafraAdmin2025!', gen_salt('bf')),
--   now(),
--   now(),
--   now(),
--   '{"first_name": "Administrador", "last_name": "SafraReport", "role": "admin"}',
--   false,
--   'authenticated'
-- );

-- Create storage bucket for user avatars (optional)
-- insert into storage.buckets (id, name, public)
-- values ('avatars', 'avatars', true);

-- Create storage policy for avatars
-- create policy "Avatar images are publicly accessible" on storage.objects
--   for select using (bucket_id = 'avatars');

-- create policy "Users can upload their own avatar" on storage.objects
--   for insert with check (
--     bucket_id = 'avatars' and 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- create policy "Users can update their own avatar" on storage.objects
--   for update using (
--     bucket_id = 'avatars' and 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Security: Create function to check if user is admin
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and is_active = true
  );
end;
$$;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on public.users to anon, authenticated;
grant insert, update on public.users to authenticated;

-- Comments for documentation
comment on table public.users is 'User profiles extending Supabase auth.users';
comment on column public.users.role is 'User role: user or admin';
comment on column public.users.is_active is 'Whether the user account is active';
comment on function public.handle_new_user() is 'Creates user profile when auth user is created';
comment on function public.is_admin() is 'Checks if current user is admin';

-- Enable realtime for users table (optional)
-- alter publication supabase_realtime add table public.users;