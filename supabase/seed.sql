-- Sample data for local development / demos.
-- Run after the migrations in supabase/migrations/. Safe to skip in production.
-- Locations are placeholders — swap for real venues/sites when available.
--
-- Cases are NOT seeded here: real inventory is imported by
-- supabase/migrations/0006_import_boca_raton_cases.sql. Bookings against
-- specific cases aren't seeded either, since fabricating a booking against
-- a real physical case (even for demo purposes) risks being mistaken for
-- an actual commitment. Use the app to book real cases once they're
-- imported.

insert into public.locations (name, description) values
  ('Main Museum Building', 'Primary museum building, galleries 1-3.'),
  ('East Wing Annex', 'Newer wing attached to the main building.'),
  ('Downtown Satellite Gallery', 'Smaller partner gallery space downtown.'),
  ('Traveling Exhibition (Off-site)', 'Placeholder for exhibits hosted at an outside venue.'),
  ('Sculpture Garden Pavilion', 'Outdoor/pavilion space for large-format work.')
on conflict (name) do nothing;

insert into public.projects (name, description, start_date, end_date, status, location_id)
select 'Ancient Trade Routes', 'Winter/spring exhibit on trade across the Silk Road.', '2026-01-15', '2026-04-30', 'completed', id
from public.locations where name = 'Main Museum Building';

insert into public.projects (name, description, start_date, end_date, status, location_id)
select 'Modern Sculpture Now', 'Summer/fall show of contemporary regional sculptors.', '2026-06-01', '2026-10-15', 'installed', id
from public.locations where name = 'Sculpture Garden Pavilion';

insert into public.projects (name, description, start_date, end_date, status, location_id)
select 'Autumn Textiles', 'Fall exhibit on regional weaving traditions.', '2026-09-01', '2026-12-15', 'confirmed', id
from public.locations where name = 'East Wing Annex';

-- Left without a location on purpose: still in early planning, real venue not decided yet.
insert into public.projects (name, description, start_date, end_date, status)
values ('Winter Ceramics', 'Early-stage planning for a winter ceramics showcase.', '2027-01-10', '2027-03-20', 'planning');
