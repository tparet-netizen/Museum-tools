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
