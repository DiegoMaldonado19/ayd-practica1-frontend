export type AssignmentEndReason =
  | "REASSIGNMENT"
  | "TRAINER_LEFT"
  | "PLAN_DOWNGRADE"
  | "MEMBER_REQUEST";

export interface TrainerAssignment {
  trainer_assignment_id: number;
  member_id: number;
  trainer_id: number;
  start_date: string;
  end_date: string | null;
  end_reason: AssignmentEndReason | null;
}

export interface AssignTrainerDTO {
  member_id: number;
  trainer_id: number;
}

export interface CloseAssignmentDTO {
  end_reason: AssignmentEndReason;
}

export interface TrainerAssignmentListParams {
  page?: number;
  size?: number;
  member_id?: number;
  trainer_id?: number;
  active?: boolean;
}

export type MuscleGroup =
  | "CHEST"
  | "BACK"
  | "LEGS"
  | "SHOULDERS"
  | "ARMS"
  | "CORE"
  | "CARDIO"
  | "FULL_BODY";

export interface Exercise {
  exercise_id: number;
  code: string;
  name: string;
  muscle_group: MuscleGroup;
  description: string | null;
  video_url: string | null;
  active: boolean;
}

export interface CreateExerciseDTO {
  code: string;
  name: string;
  muscle_group: MuscleGroup;
  description?: string;
  video_url?: string;
}

export type UpdateExerciseDTO = CreateExerciseDTO;

export interface ExerciseListParams {
  page?: number;
  size?: number;
  muscle_group?: MuscleGroup;
  search?: string;
  active?: boolean;
}

export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type RoutineStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface RoutineExerciseItem {
  exercise_id: number;
  weekday: Weekday;
  display_order: number;
  sets: number;
  repetitions: number;
  rest_seconds?: number;
  notes?: string;
}

export interface RoutineExerciseResponse {
  routine_exercise_id: number;
  exercise_id: number;
  exercise_code: string;
  exercise_name: string;
  display_order: number;
  sets: number;
  repetitions: number;
  rest_seconds: number | null;
  notes: string | null;
}

export interface RoutineDay {
  weekday: Weekday;
  exercises: RoutineExerciseResponse[];
}

export interface Routine {
  routine_id: number;
  member_id: number;
  trainer_id: number;
  name: string;
  goal_summary: string | null;
  status: RoutineStatus;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  days: RoutineDay[];
}

export interface CreateRoutineDTO {
  member_id: number;
  name: string;
  goal_summary?: string;
  end_date?: string;
  exercises: RoutineExerciseItem[];
}

export interface RoutineStatusDTO {
  status: RoutineStatus;
}

export interface RoutineListParams {
  page?: number;
  size?: number;
  member_id?: number;
  trainer_id?: number;
  status?: RoutineStatus;
}

export interface ProgressMeasurement {
  progress_measurement_id: number;
  member_id: number;
  trainer_id: number;
  measured_on: string;
  weight_kg: number;
  waist_cm: number | null;
  arm_cm: number | null;
  leg_cm: number | null;
  body_fat_percent: number | null;
  notes: string | null;
  created_at: string;
}

export interface CreateMeasurementDTO {
  measured_on: string;
  weight_kg: number;
  waist_cm?: number;
  arm_cm?: number;
  leg_cm?: number;
  body_fat_percent?: number;
  notes?: string;
}

export type UpdateMeasurementDTO = CreateMeasurementDTO;

export type TrainerNoteType = "NUTRITION" | "TRAINING" | "GENERAL";

export interface TrainerNote {
  trainer_note_id: number;
  member_id: number;
  trainer_id: number;
  note_type: TrainerNoteType;
  content: string;
  reference_date: string | null;
  created_at: string;
}

export interface CreateNoteDTO {
  note_type: TrainerNoteType;
  content: string;
  reference_date?: string;
}

export type TrainerAlertType = "REASSIGNMENT" | "SPECIAL_ATTENTION";
export type TrainerAlertStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export interface TrainerAlert {
  trainer_alert_id: number;
  member_id: number;
  trainer_id: number;
  alert_type: TrainerAlertType;
  description: string;
  status: TrainerAlertStatus;
  created_at: string;
  resolved_at: string | null;
  resolved_by_user_id: number | null;
  resolution_notes: string | null;
}

export interface CreateAlertDTO {
  member_id: number;
  alert_type: TrainerAlertType;
  description: string;
}

export interface AlertStatusDTO {
  status: TrainerAlertStatus;
  resolution_notes?: string;
}

export interface AlertListParams {
  page?: number;
  size?: number;
  status?: TrainerAlertStatus;
}
