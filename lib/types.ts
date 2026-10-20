// Shared types mirroring the Supabase schema (see supabase/migration.sql)

export type Gender = "male" | "female";

// "available" = suspect is present and can be visited
// All other statuses block the QR scan on the visitor side
export type SuspectStatus =
  | "available"
  | "not_here"
  | "at_court"
  | "released"
  | "transferred";

export type TicketStatus = "valid" | "expired";

export interface Suspect {
  id: string;
  name: string;
  gender: Gender;
  status: SuspectStatus;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  suspect_id: string;
  qr_code_data: string;
  visited_at: string;
  ticket_number: string;
  ticket_expiry: string;
  ticket_status: TicketStatus;
}

// Statuses that allow a visit — only "available"
export function canVisit(status: SuspectStatus): boolean {
  return status === "available";
}

export const STATUS_OPTIONS: SuspectStatus[] = [
  "available",
  "not_here",
  "at_court",
  "released",
  "transferred",
];

export const GENDER_OPTIONS: Gender[] = ["male", "female"];
