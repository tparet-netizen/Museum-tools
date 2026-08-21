export type ProjectStatus =
  | "planning"
  | "confirmed"
  | "installed"
  | "completed"
  | "cancelled";

export type BookingStatus = "confirmed" | "cancelled";

export interface Case {
  id: string;
  code: string;
  name: string;
  location: string | null;
  description: string | null;
  is_active: boolean;
  finish: string | null;
  condition: string | null;
  // Effective box used for object-matching: vitrine interior if enclosed
  // and known, else the open pedestal/deck footprint (height null - no
  // ceiling). See migration 0005 for the full rationale.
  width_in: number | null;
  height_in: number | null;
  depth_in: number | null;
  has_pedestal: boolean;
  pedestal_height_in: number | null;
  pedestal_width_in: number | null;
  pedestal_depth_in: number | null;
  display_deck_size: string | null;
  has_vitrine: boolean;
  vitrine_ext_height_in: number | null;
  vitrine_ext_length_in: number | null;
  vitrine_ext_depth_in: number | null;
  vitrine_int_height_in: number | null;
  vitrine_int_width_in: number | null;
  vitrine_int_depth_in: number | null;
  max_weight_kg: number | null;
  is_climate_controlled: boolean;
  is_uv_filtered: boolean;
  created_at: string;
  updated_at: string;
}

export interface ObjectGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MuseumObject {
  id: string;
  name: string;
  description: string | null;
  width_in: number;
  height_in: number;
  depth_in: number;
  weight_kg: number | null;
  orientation_fixed: boolean;
  requires_climate_control: boolean;
  requires_uv_filtered: boolean;
  group_id: string | null;
  group: ObjectGroup | null;
  project_id: string | null;
  project: Project | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  location_id: string | null;
  location: Location | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  case_id: string;
  project_id: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type BookingWithProject = Booking & { project: Project };
export type BookingWithCase = Booking & { case: Case };
