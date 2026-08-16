import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getErrorCode, getErrorMessage } from "@/api/types";
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
  MemberStatus,
} from "@/modules/members/types";

const membersKey = (params?: MemberListParams) => ["members", params] as const;

// GET /members es 403 para un socio: quien lo monte en una pantalla compartida con
// ese rol tiene que poder apagarlo en lugar de dejar correr el error.
export function useMembers(params: MemberListParams, enabled = true) {
  return useQuery({
    queryKey: membersKey(params),
    queryFn: () => getMembers(params),
    enabled,
  });
}

export function useMember(memberId: number | undefined) {
  return useQuery({
    queryKey: ["members", memberId],
    queryFn: () => getMemberById(memberId as number),
    enabled: !!memberId,
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
    onError: (error: unknown) => {
      const errorCode = getErrorCode(error);
      let message = getErrorMessage(error, "No se pudo crear el socio");

      // ✅ Manejo específico de errores conocidos
      if (errorCode === "DOCUMENT_ALREADY_REGISTERED") {
        message = "Ya existe un socio con ese número de documento";
      } else if (errorCode === "VALIDATION_ERROR") {
        message = "Por favor revisa los datos ingresados";
      }

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
    onError: (error: unknown) => {
      const errorCode = getErrorCode(error);
      let message = getErrorMessage(error, "No se pudo actualizar");

      if (errorCode === "DOCUMENT_ALREADY_REGISTERED") {
        message = "Ya existe otro socio con ese número de documento";
      }

      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useUpdateMemberStatus(memberId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (status: MemberStatus) => updateMemberStatus(memberId, status),
    onSuccess: () => {
      enqueueSnackbar("Estado del socio actualizado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["members", memberId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "No se pudo cambiar el estado");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}