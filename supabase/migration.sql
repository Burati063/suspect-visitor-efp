-- ============================================================
-- Suspect Visitor Management System (SVS) — No-Auth Version
-- Ethiopia Federal Police - Crime Investigation Bureau
-- Run this in Supabase SQL Editor (Dashboard > SQL > New query)
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- suspects
-- ------------------------------------------------------------
create table if not exists public.suspects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gender text not null check (gender in ('male', 'female')),
  status text not null default 'not_here'
    check (status in ('not_here', 'at_court', 'released', 'transferred')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists suspects_gender_idx on public.suspects(gender);
create index if not exists suspects_status_idx on public.suspects(status);
create index if not exists suspects_name_idx   on public.suspects(name);

-- ------------------------------------------------------------
-- visits
-- No user accounts needed.
-- The scanned QR code value IS the visitor identifier.
-- ------------------------------------------------------------
create table if not exists public.visits (
  id            uuid        primary key default gen_random_uuid(),
  suspect_id    uuid        not null references public.suspects(id) on delete cascade,
  -- The raw QR code scan result (digits/letters) used as visitor identity
  qr_code_data  text        not null,
  visited_at    timestamptz not null default now(),
  ticket_number text        not null unique,
  ticket_expiry timestamptz not null,
  ticket_status text        not null default 'valid'
    check (ticket_status in ('valid', 'expired'))
);

create index if not exists visits_suspect_idx    on public.visits(suspect_id);
create index if not exists visits_visited_at_idx on public.visits(visited_at desc);
create index if not exists visits_qr_idx         on public.visits(qr_code_data);

-- ------------------------------------------------------------
-- Row Level Security — fully open (no auth)
-- All operations are public: anyone with the URL can read/write.
-- For production you can restrict by IP or add an API secret.
-- ------------------------------------------------------------
alter table public.suspects enable row level security;
alter table public.visits    enable row level security;

-- Allow all operations without authentication
drop policy if exists "suspects_all_open" on public.suspects;
create policy "suspects_all_open" on public.suspects
  for all using (true) with check (true);

drop policy if exists "visits_all_open" on public.visits;
create policy "visits_all_open" on public.visits
  for all using (true) with check (true);

-- ------------------------------------------------------------
-- If you are upgrading from the old auth-based schema:
-- Run these to drop old tables first (WARNING: deletes all data)
--
--   drop table if exists public.visits cascade;
--   drop table if exists public.suspects cascade;
--   drop table if exists public.profiles cascade;
--
-- Then run the CREATE TABLE statements above.
-- ------------------------------------------------------------
