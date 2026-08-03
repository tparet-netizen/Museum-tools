-- Adds a defined list of locations that projects can be assigned to.
-- Locations are managed as data (a table), not a hardcoded enum, so new
-- ones can be added later without a schema migration.

create table if not exists public.locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.projects
  add column if not exists location_id uuid references public.locations(id);

drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at
  before update on public.locations
  for each row execute function public.set_updated_at();

alter table public.locations enable row level security;
create policy "Public read access" on public.locations for select using (true);
