import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getErrorMessage } from "@/api/types";
import {
  cancelClassSession,
  cancelEnrollment,
  cancelWaitlistEntry,
  confirmWaitlistEntry,
  createGroupClass,
  createWaitlistEntry,
  enrollMemberInClassSession,
  generateGroupClassSessions,
  getClassSessionById,
  getClassSessionEnrollments,
  getClassSessionWaitlist,
  getClassSessions,
  getGroupClassById,
  getGroupClasses,
  getMemberEnrollments,
  getMemberWaitlistEntries,
  markAttendance,
  updateClassSessionStatus,
  updateGroupClass,
} from "./services";
import type {
  CancelSessionDTO,
  ClassSessionListParams,
  CreateEnrollmentDTO,
  CreateGroupClassDTO,
  CreateWaitlistEntryDTO,
  GenerateSessionsDTO,
  GroupClassListParams,
  MarkAttendanceDTO,
  SessionStatusDTO,
  UpdateGroupClassDTO,
} from "./types";

export function useGroupClasses(params: GroupClassListParams = {}) {
  return useQuery({
    queryKey: ["group-classes", params],
    queryFn: () => getGroupClasses(params),
  });
}

export function useGroupClass(groupClassId: number | undefined) {
  return useQuery({
    queryKey: ["group-classes", groupClassId],
    queryFn: () => getGroupClassById(groupClassId as number),
    enabled: !!groupClassId,
  });
}

export function useClassSessions(params: ClassSessionListParams = {}) {
  return useQuery({
    queryKey: ["class-sessions", params],
    queryFn: () => getClassSessions(params),
  });
}

export function useClassSession(classSessionId: number | undefined) {
  return useQuery({
    queryKey: ["class-sessions", classSessionId],
    queryFn: () => getClassSessionById(classSessionId as number),
    enabled: !!classSessionId,
  });
}

export function useCreateGroupClass() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateGroupClassDTO) => createGroupClass(payload),
    onSuccess: () => {
      enqueueSnackbar("Clase creada correctamente", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["group-classes"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo crear la clase"), { variant: "error" });
    },
  });
}

export function useUpdateGroupClass(groupClassId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateGroupClassDTO) => updateGroupClass(groupClassId, payload),
    onSuccess: () => {
      enqueueSnackbar("Clase actualizada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["group-classes"] });
      queryClient.invalidateQueries({ queryKey: ["group-classes", groupClassId] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo actualizar la clase"), { variant: "error" });
    },
  });
}

export function useGenerateGroupClassSessions(groupClassId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: GenerateSessionsDTO) => generateGroupClassSessions(groupClassId, payload),
    onSuccess: () => {
      enqueueSnackbar("Sesiones generadas correctamente", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["class-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["group-classes", groupClassId] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudieron generar las sesiones"), { variant: "error" });
    },
  });
}

// Ambas rutas son exclusivas del personal: un socio recibe 403, así que quien las
// monta debe apagarlas con `enabled` en lugar de dejar el error correr en silencio.
export function useClassSessionEnrollments(classSessionId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ["class-sessions", classSessionId, "enrollments"],
    queryFn: () => getClassSessionEnrollments(classSessionId as number),
    enabled: !!classSessionId && enabled,
  });
}

export function useClassSessionWaitlist(classSessionId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: ["class-sessions", classSessionId, "waitlist"],
    queryFn: () => getClassSessionWaitlist(classSessionId as number),
    enabled: !!classSessionId && enabled,
  });
}

export function useEnrollMemberInClassSession(classSessionId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateEnrollmentDTO) => enrollMemberInClassSession(classSessionId, payload),
    onSuccess: () => {
      enqueueSnackbar("Inscripción registrada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["class-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["member-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["member-waitlist"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo registrar la inscripción"), { variant: "error" });
    },
  });
}

export function useJoinWaitlist(classSessionId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateWaitlistEntryDTO) => createWaitlistEntry(classSessionId, payload),
    onSuccess: () => {
      enqueueSnackbar("Te agregaste a la lista de espera", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["class-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["member-waitlist"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo agregar a la lista de espera"), { variant: "error" });
    },
  });
}

/**
 * Lo que ve un socio de una sesión: el roster y la cola de la sesión son exclusivos
 * del personal, así que sus dos consultas van por las rutas self-scoped de /members.
 */
export function useMemberEnrollments(
  memberId: number | undefined,
  params: { from?: string; to?: string; status?: string } = {},
) {
  return useQuery({
    queryKey: ["member-enrollments", memberId, params],
    queryFn: () => getMemberEnrollments(memberId as number, params),
    enabled: !!memberId,
  });
}

export function useMemberWaitlistEntries(memberId: number | undefined) {
  return useQuery({
    queryKey: ["member-waitlist", memberId],
    queryFn: () => getMemberWaitlistEntries(memberId as number),
    enabled: !!memberId,
  });
}

/** Una cancelación libera el cupo y promueve al siguiente en la cola, con prioridad Élite. */
export function useCancelEnrollment() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (enrollmentId: number) => cancelEnrollment(enrollmentId),
    onSuccess: () => {
      enqueueSnackbar("Inscripción cancelada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["class-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["member-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["member-waitlist"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo cancelar la inscripción"), { variant: "error" });
    },
  });
}

export function useCancelWaitlistEntry() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (waitlistEntryId: number) => cancelWaitlistEntry(waitlistEntryId),
    onSuccess: () => {
      enqueueSnackbar("Se abandonó la lista de espera", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["class-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["member-waitlist"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo abandonar la lista de espera"), { variant: "error" });
    },
  });
}

export function useConfirmWaitlistEntry() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (waitlistEntryId: number) => confirmWaitlistEntry(waitlistEntryId),
    onSuccess: () => {
      enqueueSnackbar("Cupo confirmado: ya estás inscrito", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["class-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["member-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["member-waitlist"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo confirmar el cupo"), { variant: "error" });
    },
  });
}

/** Sin esto el reporte de asistencia por clase reporta cero en todas sus filas. */
export function useMarkAttendance(classSessionId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: MarkAttendanceDTO) => markAttendance(classSessionId, payload),
    onSuccess: () => {
      enqueueSnackbar("Asistencia registrada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["class-sessions", classSessionId, "enrollments"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo registrar la asistencia"), { variant: "error" });
    },
  });
}

export function useUpdateClassSessionStatus(classSessionId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: SessionStatusDTO) => updateClassSessionStatus(classSessionId, payload),
    onSuccess: () => {
      enqueueSnackbar("Estado de la sesión actualizado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["class-sessions"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo actualizar el estado"), { variant: "error" });
    },
  });
}

export function useCancelClassSession(classSessionId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CancelSessionDTO) => cancelClassSession(classSessionId, payload),
    onSuccess: () => {
      enqueueSnackbar("Sesión cancelada y socios notificados", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["class-sessions"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo cancelar la sesión"), { variant: "error" });
    },
  });
}
