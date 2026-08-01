-- Optional sample data for local development / demos.
-- Run after 0001_init.sql. Safe to skip in production.

insert into public.cases (code, name, location, width_cm, height_cm, depth_cm, description) values
  ('G1-01', 'Entrance Vitrine',      'Gallery 1, near entrance', 120, 200, 60, 'Tall freestanding case, good sightlines from the lobby.'),
  ('G1-02', 'Ceramics Case A',       'Gallery 1',                180, 90,  60, 'Low horizontal case with adjustable internal shelving.'),
  ('G2-04', 'Textiles Case',         'Gallery 2',                150, 150, 50, 'UV-filtered glass, climate controlled.'),
  ('G2-05', 'Small Objects Case',    'Gallery 2',                80,  80,  50, 'Compact case for jewelry / small artifacts.'),
  ('G3-01', 'Rotunda Centerpiece',   'Gallery 3, rotunda',       200, 220, 200,'Large freestanding case, viewable from all sides.')
on conflict (code) do nothing;

with p as (
  insert into public.projects (name, description, start_date, end_date, status)
  values ('Ancient Trade Routes', 'Fall exhibit on trade across the Silk Road.', '2026-09-01', '2026-12-15', 'confirmed')
  returning id
)
insert into public.bookings (case_id, project_id, start_date, end_date, notes)
select c.id, p.id, '2026-09-01', '2026-12-15', 'Primary display for imported ceramics.'
from public.cases c, p
where c.code = 'G1-02';
