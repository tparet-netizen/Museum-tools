-- Sample data for local development / demos.
-- Run after the migrations in supabase/migrations/. Safe to skip in production.
-- Locations are placeholders — swap for real venues/sites when available.

insert into public.locations (name, description) values
  ('Main Museum Building', 'Primary museum building, galleries 1-3.'),
  ('East Wing Annex', 'Newer wing attached to the main building.'),
  ('Downtown Satellite Gallery', 'Smaller partner gallery space downtown.'),
  ('Traveling Exhibition (Off-site)', 'Placeholder for exhibits hosted at an outside venue.'),
  ('Sculpture Garden Pavilion', 'Outdoor/pavilion space for large-format work.')
on conflict (name) do nothing;

insert into public.cases (code, name, location, width_cm, height_cm, depth_cm, description) values
  ('G1-01', 'Entrance Vitrine',    'Gallery 1, near entrance', 120, 200, 60,  'Tall freestanding case, good sightlines from the lobby.'),
  ('G1-02', 'Ceramics Case A',     'Gallery 1',                180, 90,  60,  'Low horizontal case with adjustable internal shelving.'),
  ('G1-03', 'Ceramics Case B',     'Gallery 1',                150, 90,  60,  'Matches Ceramics Case A, usually booked as a pair.'),
  ('G2-04', 'Textiles Case',       'Gallery 2',                150, 150, 50,  'UV-filtered glass, climate controlled.'),
  ('G2-05', 'Small Objects Case',  'Gallery 2',                80,  80,  50,  'Compact case for jewelry / small artifacts.'),
  ('G2-06', 'Manuscript Case',     'Gallery 2',                100, 70,  50,  'Angled top for flat manuscripts and documents.'),
  ('G3-01', 'Rotunda Centerpiece', 'Gallery 3, rotunda',       200, 220, 200, 'Large freestanding case, viewable from all sides.'),
  ('G3-02', 'Sculpture Plinth',    'Gallery 3',                100, 180, 100, 'Open sightline plinth case, no rear panel.')
on conflict (code) do nothing;

with proj_a as (
  insert into public.projects (name, description, start_date, end_date, status, location_id)
  select 'Ancient Trade Routes', 'Winter/spring exhibit on trade across the Silk Road.', '2026-01-15', '2026-04-30', 'completed', id
  from public.locations where name = 'Main Museum Building'
  returning id
),
proj_b as (
  insert into public.projects (name, description, start_date, end_date, status, location_id)
  select 'Modern Sculpture Now', 'Summer/fall show of contemporary regional sculptors.', '2026-06-01', '2026-10-15', 'installed', id
  from public.locations where name = 'Sculpture Garden Pavilion'
  returning id
),
proj_c as (
  insert into public.projects (name, description, start_date, end_date, status, location_id)
  select 'Autumn Textiles', 'Fall exhibit on regional weaving traditions.', '2026-09-01', '2026-12-15', 'confirmed', id
  from public.locations where name = 'East Wing Annex'
  returning id
),
proj_d as (
  -- Left without a location on purpose: still in early planning, real venue not decided yet.
  insert into public.projects (name, description, start_date, end_date, status)
  values ('Winter Ceramics', 'Early-stage planning for a winter ceramics showcase.', '2027-01-10', '2027-03-20', 'planning')
  returning id
)
insert into public.bookings (case_id, project_id, start_date, end_date, status, notes)
select c.id, p.id, b.start_date::date, b.end_date::date, b.status, b.notes
from (values
  ('G1-02', 'a', '2026-01-15', '2026-04-30', 'confirmed', 'Primary case for imported ceramics.'),
  ('G2-05', 'a', '2026-02-01', '2026-04-15', 'confirmed', null),

  ('G1-01', 'b', '2026-06-01', '2026-10-15', 'confirmed', 'Entrance piece for the whole run.'),
  ('G3-01', 'b', '2026-06-01', '2026-09-30', 'confirmed', 'Centerpiece sculpture, extra security rota.'),
  ('G3-02', 'b', '2026-06-15', '2026-10-15', 'confirmed', null),
  ('G2-05', 'b', '2026-06-01', '2026-08-15', 'cancelled', 'Piece pulled by lender; case freed up.'),

  ('G1-02', 'c', '2026-09-01', '2026-12-15', 'confirmed', null),
  ('G2-04', 'c', '2026-09-01', '2026-12-15', 'confirmed', 'Requires the UV-filtered case.'),
  ('G2-06', 'c', '2026-09-15', '2026-12-01', 'confirmed', 'Manuscripts rotate at the halfway point.'),

  ('G1-03', 'd', '2027-01-10', '2027-03-20', 'confirmed', 'Tentative pairing with Ceramics Case A.')
) as b(case_code, proj_key, start_date, end_date, status, notes)
join public.cases c on c.code = b.case_code
join (
  select 'a' as proj_key, id from proj_a
  union all select 'b', id from proj_b
  union all select 'c', id from proj_c
  union all select 'd', id from proj_d
) p on p.proj_key = b.proj_key;
