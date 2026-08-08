-- Lets an object be assigned to the project it's needed for, so the case
-- matcher can default the search window to that project's dates instead of
-- requiring them to be typed in by hand every time.

alter table public.objects
  add column if not exists project_id uuid references public.projects(id) on delete set null;

create index if not exists objects_project_id_idx on public.objects(project_id);
