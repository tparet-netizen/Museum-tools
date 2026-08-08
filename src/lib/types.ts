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
  width_cm: number | null;
  height_cm: number | null;
  depth_cm: number | null;
  description: string | null;
  is_active: boolean;
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
  width_cm: number;
  height_cm: number;
  depth_cm: number;
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
