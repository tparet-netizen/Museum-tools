-- Adds objects (and object groups) plus the structured case attributes needed
-- to match an object/group against display cases that could physically and
-- environmentally accommodate it.

-- ---------------------------------------------------------------------------
-- Structured case attributes for matching. Previously this kind of thing
-- ("UV-filtered glass, climate controlled") only lived as prose in
-- cases.description - fine for humans browsing, useless for querying.
-- ---------------------------------------------------------------------------
alter table public.cases
  add column if not exists max_weight_kg numeric,          -- null = no known limit
  add column if not exists is_climate_controlled boolean not null default false,
  add column if not exists is_uv_filtered boolean not null default false;

-- ---------------------------------------------------------------------------
-- object_groups: a set of objects that need to be considered together
-- (e.g. displayed as a set), for case-matching purposes.
-- ---------------------------------------------------------------------------
create table if not exists public.object_groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- objects: the pieces that need a case. Dimensions are required since
-- matching is meaningless without them; everything else is optional.
-- ---------------------------------------------------------------------------
create table if not exists public.objects (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null,
  description              text,
  width_cm                 numeric not null,
  height_cm                numeric not null,
  depth_cm                 numeric not null,
  weight_kg                numeric,
  -- If true, the object's W/H/D must map exactly onto a case's W/H/D (it
  -- can't be reoriented - e.g. a painting that must hang a specific way).
  -- If false, matching also tries rotating it around its vertical axis
  -- (swapping width/depth) but keeps height as height - height isn't
  -- flipped, since that's rarely physically realistic for display.
  orientation_fixed        boolean not null default false,
  requires_climate_control boolean not null default false,
  requires_uv_filtered     boolean not null default false,
  group_id                 uuid references public.object_groups(id) on delete set null,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint objects_dims_positive check (width_cm > 0 and height_cm > 0 and depth_cm > 0)
);

create index if not exists objects_group_id_idx on public.objects(group_id);

drop trigger if exists object_groups_set_updated_at on public.object_groups;
create trigger object_groups_set_updated_at
  before update on public.object_groups
  for each row execute function public.set_updated_at();

drop trigger if exists objects_set_updated_at on public.objects;
create trigger objects_set_updated_at
  before update on public.objects
  for each row execute function public.set_updated_at();

alter table public.object_groups enable row level security;
alter table public.objects enable row level security;

create policy "Public read access" on public.object_groups for select using (true);
create policy "Public read access" on public.objects for select using (true);
