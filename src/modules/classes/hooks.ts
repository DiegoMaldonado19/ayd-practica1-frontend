import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getErrorMessage } from "@/api/types";
import {
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
  updateGroupClass,
} from "./services";
import type {
  ClassSessionListParams,
  CreateEnrollmentDTO,
  CreateGroupClassDTO,
  CreateWaitlistEntryDTO,
  GenerateSessionsDTO,
  GroupClassListParams,
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

export function useClassSessionEnrollments(classSessionId: number | undefined) {
  return useQuery({
    queryKey: ["class-sessions", classSessionId, "enrollments"],
    queryFn: () => getClassSessionEnrollments(classSessionId as number),
    enabled: !!classSessionId,
  });
}

export function useClassSessionWaitlist(classSessionId: number | undefined) {
  return useQuery({
    queryKey: ["class-sessions", classSessionId, "waitlist"],
    queryFn: () => getClassSessionWaitlist(classSessionId as number),
    enabled: !!classSessionId,
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
      queryClient.invalidateQueries({ queryKey: ["class-sessions", classSessionId] });
      queryClient.invalidateQueries({ queryKey: ["class-sessions", classSessionId, "enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["class-sessions", classSessionId, "waitlist"] });
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
      queryClient.invalidateQueries({ queryKey: ["class-sessions", classSessionId, "waitlist"] });
      queryClient.invalidateQueries({ queryKey: ["class-sessions"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo agregar a la lista de espera"), { variant: "error" });
    },
  });
}
