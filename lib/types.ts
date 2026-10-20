// Shared types mirroring the Supabase schema (see supabase/migration.sql)

export type Role = "admin" | "visitor";

export type Gender = "male" | "female";

export type SuspectStatus = "not_here" | "at_court" | "released" | "transferred";

export type TicketStatus = "valid" | "expired";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: Role;
  created_at: string;
}

export interface Suspect {
  id: string;
  name: string;
  gender: Gender;
  status: SuspectStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  suspect_id: string;
  visitor_id: string;
  qr_code_data: string;
  visited_at: string;
  ticket_number: string;
  ticket_expiry: string;
  ticket_status: TicketStatus;
  // Joined fields (optional, present in history queries)
  suspect_name?: string;
  visitor_name?: string;
}

export const STATUS_OPTIONS: SuspectStatus[] = [
  "not_here",
  "at_court",
  "released",
  "transferred",
];

export const GENDER_OPTIONS: Gender[] = ["male", "female"];
