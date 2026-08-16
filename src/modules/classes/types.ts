export type ClassDiscipline =
  | "YOGA"
  | "CROSSFIT"
  | "PILATES"
  | "HIIT"
  | "CARDIO"
  | "STRENGTH"
  | "FUNCTIONAL"
  | "BOXING"
  | "SPINNING"
  | "MEDITATION";

export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface GroupClass {
  group_class_id: number;
  code: string;
  name: string;
  discipline: ClassDiscipline;
  difficulty_level?: DifficultyLevel;
  trainer_id?: number;
  weekday?: Weekday;
  start_time?: string;
  duration_minutes?: number;
  max_capacity?: number;
  active?: boolean;
  created_at?: string;
}

export type SessionStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type EnrollmentStatus = "ENROLLED" | "CANCELLED" | "ATTENDED" | "ABSENT";

export type WaitlistStatus = "WAITING" | "NOTIFIED" | "PROMOTED" | "EXPIRED" | "CANCELLED";

/** Copia literal de ClassSessionResponse: el backend no envía `date` ni `end_time`. */
export interface ClassSession {
  class_session_id: number;
  group_class_id: number;
  group_class_name?: string;
  discipline?: ClassDiscipline;
  trainer_id?: number;
  session_date: string;
  start_time: string;
  duration_minutes?: number;
  max_capacity?: number;
  seats_taken?: number;
  seats_available?: number;
  status?: SessionStatus | string;
  cancellation_reason?: string | null;
  opened_at?: string | null;
  closed_at?: string | null;
}

export interface CreateGroupClassDTO {
  code: string;
  name: string;
  discipline: ClassDiscipline;
  trainer_id: number;
  weekday: Weekday;
  start_time: string;
  duration_minutes: number;
  max_capacity: number;
  difficulty_level?: DifficultyLevel;
}

export type UpdateGroupClassDTO = Partial<CreateGroupClassDTO>;

export interface GenerateSessionsDTO {
  from: string;
  to: string;
}

export interface CreateEnrollmentDTO {
  member_id: number;
  channel?: "FRONT_DESK" | "SELF_SERVICE";
}

export interface CreateWaitlistEntryDTO {
  member_id: number;
}

export interface ClassEnrollment {
  class_enrollment_id: number;
  class_session_id: number;
  member_id: number;
  status?: EnrollmentStatus;
  channel?: "FRONT_DESK" | "SELF_SERVICE";
  enrolled_at?: string;
  cancelled_at?: string | null;
  attendance_marked_at?: string | null;
}

export interface WaitlistEntry {
  waitlist_entry_id: number;
  class_session_id: number;
  member_id: number;
  status?: WaitlistStatus;
  requested_at?: string;
  notified_at?: string | null;
  confirmation_deadline?: string | null;
  resolved_at?: string | null;
}

/** Marca a toda la lista en una sola operación; solo ATTENDED y ABSENT son válidos. */
export interface MarkAttendanceDTO {
  attendances: { enrollment_id: number; status: Extract<EnrollmentStatus, "ATTENDED" | "ABSENT"> }[];
}

export interface SessionStatusDTO {
  status: SessionStatus;
}

export interface CancelSessionDTO {
  cancellation_reason: string;
}

export interface GroupClassListParams {
  page?: number;
  size?: number;
  discipline?: string;
  trainer_id?: number;
  difficulty_level?: DifficultyLevel;
  active?: boolean;
}

export interface ClassSessionListParams {
  page?: number;
  size?: number;
  from?: string;
  to?: string;
  discipline?: string;
  trainer_id?: number;
  group_class_id?: number;
  has_seats?: boolean;
}
