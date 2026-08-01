-- Museum Tools: display case booking schema
-- Run this in the Supabase SQL editor, or via `supabase db push` if using the CLI.

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists btree_gist; -- lets a gist exclusion constraint use `=` on uuid/text columns

-- ---------------------------------------------------------------------------
-- cases: the physical display cases available to book
-- ---------------------------------------------------------------------------
create table if not exists public.cases (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,        -- short human label, e.g. "G2-04"
  name        text not null,
  location    text,                        -- gallery / room / floor
  width_cm    numeric,
  height_cm   numeric,
  depth_cm    numeric,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- projects: an exhibit/show that runs over a date range and needs cases
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  start_date  date not null,
  end_date    date not null,
  status      text not null default 'planning'
              check (status in ('planning', 'confirmed', 'installed', 'completed', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint projects_dates_valid check (end_date >= start_date)
);

-- ---------------------------------------------------------------------------
-- bookings: assigns one case to one project for a date range.
-- This is the join table that everything else is built around.
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references public.cases(id) on delete cascade,
  project_id  uuid not null references public.projects(id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  status      text not null default 'confirmed'
              check (status in ('confirmed', 'cancelled')),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint bookings_dates_valid check (end_date >= start_date),

  -- The double-booking guard: for a given case, no two non-cancelled bookings
  -- may have overlapping [start_date, end_date] ranges. This is enforced by
  -- Postgres itself (via a GiST exclusion constraint), so it holds even under
  -- concurrent inserts / API bugs / manual SQL edits - not just app-level checks.
  -- Cancelled bookings are excluded from the check so cancelling a booking
  -- immediately frees the case back up, without losing history (no hard delete).
  constraint bookings_no_overlap
    exclude using gist (
      case_id with =,
      daterange(start_date, end_date, '[]') with &&
    ) where (status <> 'cancelled')
);

create index if not exists bookings_case_id_idx on public.bookings(case_id);
create index if not exists bookings_project_id_idx on public.bookings(project_id);
create index if not exists bookings_date_range_idx
  on public.bookings using gist (daterange(start_date, end_date, '[]'));

-- ---------------------------------------------------------------------------
-- Keep a booking's dates inside its project's dates. A CHECK constraint can't
-- reference another table, so this is a trigger instead.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_booking_within_project()
returns trigger
language plpgsql
as $$
declare
  proj_start date;
  proj_end   date;
begin
  select start_date, end_date into proj_start, proj_end
  from public.projects
  where id = new.project_id;

  if new.start_date < proj_start or new.end_date > proj_end then
    raise exception
      'Booking dates (% to %) must fall within project dates (% to %)',
      new.start_date, new.end_date, proj_start, proj_end
      using errcode = '23514'; -- check_violation
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_within_project_dates on public.bookings;
create trigger bookings_within_project_dates
  before insert or update of start_date, end_date, project_id on public.bookings
  for each row execute function public.enforce_booking_within_project();

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- v1 has no end-user auth yet, so the policy is deliberately simple:
--   - anyone (anon key) can READ cases/projects/bookings
--   - only the service role (used server-side in Next.js API routes, never
--     shipped to the browser) can INSERT/UPDATE/DELETE
-- When real user accounts are added, replace the write path with policies
-- scoped to authenticated staff instead of relying solely on the service role.
-- ---------------------------------------------------------------------------
alter table public.cases enable row level security;
alter table public.projects enable row level security;
alter table public.bookings enable row level security;

create policy "Public read access" on public.cases for select using (true);
create policy "Public read access" on public.projects for select using (true);
create policy "Public read access" on public.bookings for select using (true);
