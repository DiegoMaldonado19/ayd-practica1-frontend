import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getErrorCode, getErrorMessage } from "@/api/types";
import {
  getTrainerAssignments,
  assignTrainer,
  closeAssignment,
  getExercises,
  createExercise,
  updateExercise,
  deactivateExercise,
  getRoutines,
  getRoutineById,
  createRoutine,
  replaceRoutine,
  updateRoutineStatus,
  getMemberMeasurements,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getMemberNotes,
  createNote,
  getMemberTrainer,
  getTrainerAlerts,
  createAlert,
  updateAlertStatus,
} from "./services";
import type {
  AssignTrainerDTO,
  CloseAssignmentDTO,
  TrainerAssignmentListParams,
  CreateExerciseDTO,
  UpdateExerciseDTO,
  ExerciseListParams,
  CreateRoutineDTO,
  RoutineStatusDTO,
  RoutineListParams,
  CreateMeasurementDTO,
  UpdateMeasurementDTO,
  CreateNoteDTO,
  CreateAlertDTO,
  AlertStatusDTO,
  AlertListParams,
} from "./types";

export function useTrainerAssignments(params: TrainerAssignmentListParams) {
  return useQuery({
    queryKey: ["trainer-assignments", params],
    queryFn: () => getTrainerAssignments(params),
  });
}

export function useAssignTrainer() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: AssignTrainerDTO) => assignTrainer(payload),
    onSuccess: (_, variables) => {
      enqueueSnackbar("Entrenador asignado correctamente", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["trainer-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["members", variables.member_id, "trainer"] });
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      let message = getErrorMessage(error, "No se pudo asignar el entrenador");
      if (code === "TRAINER_CAPACITY_EXCEEDED") {
        message = "El entrenador alcanzó su carga máxima de socios";
      } else if (code === "TRAINER_ALREADY_ASSIGNED") {
        message = "El socio ya tiene un entrenador vigente";
      } else if (code === "PLAN_BENEFIT_NOT_INCLUDED") {
        message = "El plan del socio no incluye entrenador personal";
      }
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useCloseAssignment(assignmentId: number, memberId?: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CloseAssignmentDTO) => closeAssignment(assignmentId, payload),
    onSuccess: () => {
      enqueueSnackbar("Asignación cerrada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["trainer-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      if (memberId) {
        queryClient.invalidateQueries({ queryKey: ["members", memberId, "trainer"] });
      }
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo cerrar la asignación"), {
        variant: "error",
      });
    },
  });
}

export function useExercises(params: ExerciseListParams) {
  return useQuery({
    queryKey: ["exercises", params],
    queryFn: () => getExercises(params),
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateExerciseDTO) => createExercise(payload),
    onSuccess: () => {
      enqueueSnackbar("Ejercicio creado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo crear el ejercicio"), {
        variant: "error",
      });
    },
  });
}

export function useUpdateExercise(exerciseId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateExerciseDTO) => updateExercise(exerciseId, payload),
    onSuccess: () => {
      enqueueSnackbar("Ejercicio actualizado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo actualizar el ejercicio"), {
        variant: "error",
      });
    },
  });
}

export function useDeactivateExercise() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (exerciseId: number) => deactivateExercise(exerciseId),
    onSuccess: () => {
      enqueueSnackbar("Ejercicio desactivado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo desactivar el ejercicio"), {
        variant: "error",
      });
    },
  });
}

export function useRoutines(params: RoutineListParams) {
  return useQuery({
    queryKey: ["routines", params],
    queryFn: () => getRoutines(params),
  });
}

export function useRoutine(routineId: number | undefined) {
  return useQuery({
    queryKey: ["routines", routineId],
    queryFn: () => getRoutineById(routineId as number),
    enabled: !!routineId,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateRoutineDTO) => createRoutine(payload),
    onSuccess: () => {
      enqueueSnackbar("Rutina creada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      const message =
        code === "TRAINER_SCOPE_VIOLATION"
          ? "No tienes asignado a este socio"
          : getErrorMessage(error, "No se pudo crear la rutina");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useReplaceRoutine(routineId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateRoutineDTO) => replaceRoutine(routineId, payload),
    onSuccess: () => {
      enqueueSnackbar("Rutina actualizada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["routines", routineId] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo actualizar la rutina"), {
        variant: "error",
      });
    },
  });
}

export function useUpdateRoutineStatus(routineId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: RoutineStatusDTO) => updateRoutineStatus(routineId, payload),
    onSuccess: () => {
      enqueueSnackbar("Estado de la rutina actualizado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["routines", routineId] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo cambiar el estado de la rutina"), {
        variant: "error",
      });
    },
  });
}

export function useMemberMeasurements(
  memberId: number | undefined,
  params: { from?: string; to?: string } = {},
) {
  return useQuery({
    queryKey: ["members", memberId, "measurements", params],
    queryFn: () => getMemberMeasurements(memberId as number, params),
    enabled: !!memberId,
  });
}

export function useCreateMeasurement(memberId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateMeasurementDTO) => createMeasurement(memberId, payload),
    onSuccess: () => {
      enqueueSnackbar("Medición registrada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["members", memberId, "measurements"] });
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      const message =
        code === "MEASUREMENT_DUPLICATE_DATE"
          ? "Ya existe una medición para esa fecha"
          : getErrorMessage(error, "No se pudo registrar la medición");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useUpdateMeasurement(measurementId: number, memberId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateMeasurementDTO) => updateMeasurement(measurementId, payload),
    onSuccess: () => {
      enqueueSnackbar("Medición corregida", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["members", memberId, "measurements"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo corregir la medición"), {
        variant: "error",
      });
    },
  });
}

export function useDeleteMeasurement(memberId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (measurementId: number) => deleteMeasurement(measurementId),
    onSuccess: () => {
      enqueueSnackbar("Medición eliminada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["members", memberId, "measurements"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo eliminar la medición"), {
        variant: "error",
      });
    },
  });
}

export function useMemberNotes(memberId: number | undefined, params: { note_type?: string } = {}) {
  return useQuery({
    queryKey: ["members", memberId, "notes", params],
    queryFn: () => getMemberNotes(memberId as number, params),
    enabled: !!memberId,
  });
}

export function useCreateNote(memberId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateNoteDTO) => createNote(memberId, payload),
    onSuccess: () => {
      enqueueSnackbar("Observación agregada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["members", memberId, "notes"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo agregar la observación"), {
        variant: "error",
      });
    },
  });
}

export function useMemberTrainer(memberId: number | undefined) {
  return useQuery({
    queryKey: ["members", memberId, "trainer"],
    queryFn: () => getMemberTrainer(memberId as number),
    enabled: !!memberId,
    retry: false,
  });
}

export function useTrainerAlerts(params: AlertListParams) {
  return useQuery({
    queryKey: ["trainer-alerts", params],
    queryFn: () => getTrainerAlerts(params),
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateAlertDTO) => createAlert(payload),
    onSuccess: () => {
      enqueueSnackbar("Alerta enviada al administrador", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["trainer-alerts"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo enviar la alerta"), {
        variant: "error",
      });
    },
  });
}

export function useUpdateAlertStatus(alertId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: AlertStatusDTO) => updateAlertStatus(alertId, payload),
    onSuccess: () => {
      enqueueSnackbar("Alerta actualizada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["trainer-alerts"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo actualizar la alerta"), {
        variant: "error",
      });
    },
  });
}
