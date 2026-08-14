import { apiClient } from "@/api/client";
import type { Page } from "@/api/types";
import type { Trainer } from "@/modules/trainers/types";
import type {
  TrainerAssignment,
  AssignTrainerDTO,
  CloseAssignmentDTO,
  TrainerAssignmentListParams,
  Exercise,
  CreateExerciseDTO,
  UpdateExerciseDTO,
  ExerciseListParams,
  Routine,
  CreateRoutineDTO,
  RoutineStatusDTO,
  RoutineListParams,
  ProgressMeasurement,
  CreateMeasurementDTO,
  UpdateMeasurementDTO,
  TrainerNote,
  CreateNoteDTO,
  TrainerAlert,
  CreateAlertDTO,
  AlertStatusDTO,
  AlertListParams,
} from "./types";

export async function getTrainerAssignments(
  params: TrainerAssignmentListParams,
): Promise<Page<TrainerAssignment>> {
  const { data } = await apiClient.get<Page<TrainerAssignment>>("/trainer-assignments", { params });
  return data;
}

export async function assignTrainer(payload: AssignTrainerDTO): Promise<TrainerAssignment> {
  const { data } = await apiClient.post<TrainerAssignment>("/trainer-assignments", payload);
  return data;
}

export async function closeAssignment(
  assignmentId: number,
  payload: CloseAssignmentDTO,
): Promise<void> {
  await apiClient.delete(`/trainer-assignments/${assignmentId}`, { data: payload });
}

export async function getExercises(params: ExerciseListParams): Promise<Page<Exercise>> {
  const { data } = await apiClient.get<Page<Exercise>>("/exercises", { params });
  return data;
}

export async function createExercise(payload: CreateExerciseDTO): Promise<Exercise> {
  const { data } = await apiClient.post<Exercise>("/exercises", payload);
  return data;
}

export async function updateExercise(
  exerciseId: number,
  payload: UpdateExerciseDTO,
): Promise<Exercise> {
  const { data } = await apiClient.put<Exercise>(`/exercises/${exerciseId}`, payload);
  return data;
}

export async function deactivateExercise(exerciseId: number): Promise<void> {
  await apiClient.delete(`/exercises/${exerciseId}`);
}

export async function getRoutines(params: RoutineListParams): Promise<Page<Routine>> {
  const { data } = await apiClient.get<Page<Routine>>("/routines", { params });
  return data;
}

export async function getRoutineById(routineId: number): Promise<Routine> {
  const { data } = await apiClient.get<Routine>(`/routines/${routineId}`);
  return data;
}

export async function createRoutine(payload: CreateRoutineDTO): Promise<Routine> {
  const { data } = await apiClient.post<Routine>("/routines", payload);
  return data;
}

export async function replaceRoutine(
  routineId: number,
  payload: CreateRoutineDTO,
): Promise<Routine> {
  const { data } = await apiClient.put<Routine>(`/routines/${routineId}`, payload);
  return data;
}

export async function updateRoutineStatus(
  routineId: number,
  payload: RoutineStatusDTO,
): Promise<Routine> {
  const { data } = await apiClient.patch<Routine>(`/routines/${routineId}/status`, payload);
  return data;
}

export async function getMemberMeasurements(
  memberId: number,
  params: { from?: string; to?: string },
): Promise<ProgressMeasurement[]> {
  const { data } = await apiClient.get<ProgressMeasurement[]>(
    `/members/${memberId}/measurements`,
    { params },
  );
  return data;
}

export async function createMeasurement(
  memberId: number,
  payload: CreateMeasurementDTO,
): Promise<ProgressMeasurement> {
  const { data } = await apiClient.post<ProgressMeasurement>(
    `/members/${memberId}/measurements`,
    payload,
  );
  return data;
}

export async function updateMeasurement(
  measurementId: number,
  payload: UpdateMeasurementDTO,
): Promise<ProgressMeasurement> {
  const { data } = await apiClient.put<ProgressMeasurement>(
    `/measurements/${measurementId}`,
    payload,
  );
  return data;
}

export async function deleteMeasurement(measurementId: number): Promise<void> {
  await apiClient.delete(`/measurements/${measurementId}`);
}

export async function getMemberNotes(
  memberId: number,
  params: { note_type?: string } = {},
): Promise<TrainerNote[]> {
  const { data } = await apiClient.get<TrainerNote[]>(`/members/${memberId}/notes`, { params });
  return data;
}

export async function createNote(memberId: number, payload: CreateNoteDTO): Promise<TrainerNote> {
  const { data } = await apiClient.post<TrainerNote>(`/members/${memberId}/notes`, payload);
  return data;
}

export async function getMemberTrainer(memberId: number): Promise<Trainer> {
  const { data } = await apiClient.get<Trainer>(`/members/${memberId}/trainer`);
  return data;
}

export async function getTrainerAlerts(params: AlertListParams): Promise<Page<TrainerAlert>> {
  const { data } = await apiClient.get<Page<TrainerAlert>>("/trainer-alerts", { params });
  return data;
}

export async function createAlert(payload: CreateAlertDTO): Promise<TrainerAlert> {
  const { data } = await apiClient.post<TrainerAlert>("/trainer-alerts", payload);
  return data;
}

export async function updateAlertStatus(
  alertId: number,
  payload: AlertStatusDTO,
): Promise<TrainerAlert> {
  const { data } = await apiClient.patch<TrainerAlert>(`/trainer-alerts/${alertId}/status`, payload);
  return data;
}
