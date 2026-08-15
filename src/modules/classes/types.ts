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

export interface ClassSession {
  class_session_id: number;
  group_class_id: number;
  date: string;
  start_time: string;
  end_time?: string;
  status?: "SCHEDULED" | "CANCELLED" | "COMPLETED" | "FULL" | string;
  discipline?: ClassDiscipline;
  trainer_id?: number;
  max_capacity?: number;
  seats_taken?: number;
  seats_available?: number;
  name?: string;
  code?: string;
  group_class_name?: string;
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
  member_id: number;
  status?: string;
  channel?: "FRONT_DESK" | "SELF_SERVICE";
  cancelled_at?: string | null;
}

export interface WaitlistEntry {
  waitlist_entry_id: number;
  member_id: number;
  status?: string;
  notified_at?: string | null;
  confirmation_deadline?: string | null;
  requested_at?: string;
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
