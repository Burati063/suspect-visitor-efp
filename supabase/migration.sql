-- ============================================================
-- Suspect Visitor Management System (SVS) — No-Auth Version
-- Ethiopia Federal Police - Crime Investigation Bureau
--
-- HOW TO RUN:
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Paste this entire file and click Run
--
-- IF UPGRADING from old schema, run this first:
--   DROP TABLE IF EXISTS public.visits CASCADE;
--   DROP TABLE IF EXISTS public.suspects CASCADE;
--   DROP TABLE IF EXISTS public.profiles CASCADE;
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- suspects
-- Status "available" = visitor CAN enter and scan QR code.
-- All other statuses block visitor access.
-- ------------------------------------------------------------
create table if not exists public.suspects (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  gender     text        not null
               check (gender in ('male','female')),
  status     text        not null default 'not_here'
               check (status in ('available','not_here','at_court','released','transferred')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists suspects_gender_idx on public.suspects(gender);
create index if not exists suspects_status_idx on public.suspects(status);
create index if not exists suspects_name_idx   on public.suspects(name);

-- ------------------------------------------------------------
-- visits
-- qr_code_data = the scanned QR value = visitor identity.
-- No user accounts needed.
-- ------------------------------------------------------------
create table if not exists public.visits (
  id            uuid        primary key default gen_random_uuid(),
  suspect_id    uuid        not null references public.suspects(id) on delete cascade,
  qr_code_data  text        not null,
  visited_at    timestamptz not null default now(),
  ticket_number text        not null unique,
  ticket_expiry timestamptz not null,
  ticket_status text        not null default 'valid'
               check (ticket_status in ('valid','expired'))
);

create index if not exists visits_suspect_idx    on public.visits(suspect_id);
create index if not exists visits_visited_at_idx on public.visits(visited_at desc);
create index if not exists visits_qr_idx         on public.visits(qr_code_data);

-- ------------------------------------------------------------
-- Row Level Security — fully open (no auth required)
-- ------------------------------------------------------------
alter table public.suspects enable row level security;
alter table public.visits    enable row level security;

drop policy if exists "suspects_all_open" on public.suspects;
create policy "suspects_all_open" on public.suspects
  for all using (true) with check (true);

drop policy if exists "visits_all_open" on public.visits;
create policy "visits_all_open" on public.visits
  for all using (true) with check (true);

-- ------------------------------------------------------------
-- If suspects table already exists with old constraint, run:
--
--   ALTER TABLE public.suspects
--     DROP CONSTRAINT IF EXISTS suspects_status_check;
--
--   ALTER TABLE public.suspects
--     ADD CONSTRAINT suspects_status_check
--     CHECK (status IN ('available','not_here','at_court','released','transferred'));
-- ------------------------------------------------------------
