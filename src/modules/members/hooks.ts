// src/modules/members/hooks.ts
//
// Envuelve services.ts con react-query. Las pantallas (pages/) consumen
// estos hooks, nunca llaman a services.ts directo — así el cache, el
// loading state y el refetch después de mutar quedan resueltos en un
// solo lugar.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getErrorMessage } from "@/api/types";
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  updateMemberStatus,
} from "@/modules/members/services";
import type {
  CreateMemberDTO,
  UpdateMemberDTO,
  MemberListParams,
} from "@/modules/members/types";

const membersKey = (params?: MemberListParams) => ["members", params] as const;

export function useMembers(params: MemberListParams) {
  return useQuery({
    queryKey: membersKey(params),
    queryFn: () => getMembers(params),
  });
}

export function useMember(memberId: number | undefined) {
  return useQuery({
    queryKey: ["members", memberId],
    queryFn: () => getMemberById(memberId as number),
    enabled: !!memberId, // no dispara la llamada si aún no hay id
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateMemberDTO) => createMember(payload),
    onSuccess: () => {
      enqueueSnackbar("Socio creado correctamente", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      const message = getErrorMessage(error, "No se pudo crear el socio");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useUpdateMember(memberId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateMemberDTO) => updateMember(memberId, payload),
    onSuccess: () => {
      enqueueSnackbar("Datos actualizados", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["members", memberId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      const message = getErrorMessage(error, "No se pudo actualizar");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useUpdateMemberStatus(memberId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (status: "ACTIVE" | "INACTIVE" | "WITHDRAWN") =>
      updateMemberStatus(memberId, status),
    onSuccess: () => {
      enqueueSnackbar("Estado del socio actualizado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["members", memberId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      const message = getErrorMessage(error, "No se pudo cambiar el estado");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}