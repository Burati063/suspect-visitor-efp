-- ============================================================
-- Suspect Visitor Management System (SVS)
-- Ethiopia Federal Police - Crime Investigation Bureau
-- Run this in the Supabase SQL Editor (Supabase Dashboard > SQL > New query)
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- profiles: extends auth.users with full_name, phone, role
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'visitor' check (role in ('admin', 'visitor')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    'visitor'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- suspects
-- ------------------------------------------------------------
create table if not exists public.suspects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gender text not null check (gender in ('male', 'female')),
  status text not null default 'not_here' check (status in ('not_here', 'at_court', 'released', 'transferred')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists suspects_gender_idx on public.suspects(gender);
create index if not exists suspects_status_idx on public.suspects(status);

-- ------------------------------------------------------------
-- visits
-- ------------------------------------------------------------
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  suspect_id uuid not null references public.suspects(id) on delete cascade,
  visitor_id uuid not null references public.profiles(id) on delete cascade,
  qr_code_data text not null,
  visited_at timestamptz not null default now(),
  ticket_number text not null unique,
  ticket_expiry timestamptz not null,
  ticket_status text not null default 'valid' check (ticket_status in ('valid', 'expired'))
);

create index if not exists visits_suspect_idx on public.visits(suspect_id);
create index if not exists visits_visitor_idx on public.visits(visitor_id);
create index if not exists visits_visited_at_idx on public.visits(visited_at desc);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.suspects enable row level security;
alter table public.visits enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles policies
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());

-- suspects policies: admins can do everything; visitors can read (to browse)
drop policy if exists "suspects_select_all" on public.suspects;
create policy "suspects_select_all" on public.suspects
  for select using (true);

drop policy if exists "suspects_insert_admin" on public.suspects;
create policy "suspects_insert_admin" on public.suspects
  for insert with check (public.is_admin());

drop policy if exists "suspects_update_admin" on public.suspects;
create policy "suspects_update_admin" on public.suspects
  for update using (public.is_admin());

drop policy if exists "suspects_delete_admin" on public.suspects;
create policy "suspects_delete_admin" on public.suspects
  for delete using (public.is_admin());

-- visits policies: visitors insert their own; admins read all; visitors read their own
drop policy if exists "visits_insert_self" on public.visits;
create policy "visits_insert_self" on public.visits
  for insert with check (visitor_id = auth.uid());

drop policy if exists "visits_select_self_or_admin" on public.visits;
create policy "visits_select_self_or_admin" on public.visits
  for select using (visitor_id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------
-- Seed an admin (run AFTER creating your account):
-- 1. Sign up a visitor account through the app.
-- 2. Then run in SQL Editor:
--    update public.profiles set role = 'admin' where phone = '<your-phone>';
--    (or where email-based: join auth.users)
-- ------------------------------------------------------------
