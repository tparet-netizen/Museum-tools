-- Restructures `cases` to reflect what a museum's display inventory
-- actually is: not every bookable unit is an enclosed glass case. Some are
-- open pedestals/platforms (no enclosure at all), some are a pedestal with
-- a vitrine on top, and some are standalone vitrines not currently paired
-- with any base. All three are tracked in one table (has_pedestal /
-- has_vitrine flags), since real inventory records them as one physical
-- unit with a single designation number.
--
-- Also switches length units from cm to inches throughout (cases AND
-- objects, so matching compares like-for-like) - the museum's own records
-- are in inches, and forcing metric on them was a mistake in the original
-- scaffold.

alter table public.cases rename column width_cm to width_in;
alter table public.cases rename column height_cm to height_in;
alter table public.cases rename column depth_cm to depth_in;

comment on column public.cases.width_in is
  'Effective width used for object-matching: vitrine interior width if the case has a vitrine with known interior dims, else the pedestal/deck footprint width for an open (unenclosed) display. Left null when not confidently known.';
comment on column public.cases.height_in is
  'Effective height used for object-matching: vitrine interior height if enclosed. Null for an open pedestal/platform - there is no ceiling, so matching treats null height as unconstrained.';
comment on column public.cases.depth_in is
  'Effective depth used for object-matching - see width_in comment.';

alter table public.cases
  add column if not exists finish text,
  add column if not exists condition text,
  add column if not exists has_pedestal boolean not null default false,
  add column if not exists pedestal_height_in numeric,
  add column if not exists pedestal_width_in numeric,
  add column if not exists pedestal_depth_in numeric,
  add column if not exists display_deck_size text,
  add column if not exists has_vitrine boolean not null default false,
  add column if not exists vitrine_ext_height_in numeric,
  add column if not exists vitrine_ext_length_in numeric,
  add column if not exists vitrine_ext_depth_in numeric,
  add column if not exists vitrine_int_height_in numeric,
  add column if not exists vitrine_int_width_in numeric,
  add column if not exists vitrine_int_depth_in numeric;

comment on column public.cases.display_deck_size is
  'Free text, e.g. "20 x 20" or a round diameter - kept verbatim from source records since format varies too much to fully normalize.';

-- objects: switch units to match (matching directly compares object
-- dimensions against case dimensions, so both sides must agree).
alter table public.objects rename column width_cm to width_in;
alter table public.objects rename column height_cm to height_in;
alter table public.objects rename column depth_cm to depth_in;
