import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getErrorCode, getErrorMessage } from "@/api/types";
import {
  cancelMembership,
  changeMembershipPlan,
  createMembership,
  createMembershipPlan,
  freezeMembership,
  getMembershipById,
  getMembershipFreezes,
  getMembershipPlanById,
  getMembershipPlans,
  getMemberships,
  getMemberMembershipHistory,
  reactivateMembership,
  renewMembership,
  updateMembershipPlan,
  updateMembershipPlanStatus,
} from "./services";
import type {
  CancelMembershipDTO,
  CreateFreezeDTO,
  CreateMembershipDTO,
  CreateMembershipPlanDTO,
  MembershipListParams,
  MembershipPlanListParams,
  MembershipPlanStatusDTO,
  PlanChangeDTO,
  UpdateMembershipPlanDTO,
} from "./types";

export function useMembershipPlans(params: MembershipPlanListParams) {
  return useQuery({
    queryKey: ["membership-plans", params],
    queryFn: () => getMembershipPlans(params),
  });
}

export function useMembershipPlan(planId: number | undefined) {
  return useQuery({
    queryKey: ["membership-plans", planId],
    queryFn: () => getMembershipPlanById(planId as number),
    enabled: !!planId,
  });
}

export function useMemberships(params: MembershipListParams) {
  return useQuery({
    queryKey: ["memberships", params],
    queryFn: () => getMemberships(params),
  });
}

export function useMembership(membershipId: number | undefined) {
  return useQuery({
    queryKey: ["memberships", membershipId],
    queryFn: () => getMembershipById(membershipId as number),
    enabled: !!membershipId,
  });
}

export function useMemberMembershipHistory(memberId: number | undefined) {
  return useQuery({
    queryKey: ["members", memberId, "memberships"],
    queryFn: () => getMemberMembershipHistory(memberId as number),
    enabled: !!memberId,
  });
}

export function useMembershipFreezes(membershipId: number | undefined) {
  return useQuery({
    queryKey: ["memberships", membershipId, "freezes"],
    queryFn: () => getMembershipFreezes(membershipId as number),
    enabled: !!membershipId,
  });
}

export function useCreateMembershipPlan() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateMembershipPlanDTO) =>
      createMembershipPlan(payload),
    onSuccess: () => {
      enqueueSnackbar("Plan creado correctamente", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["membership-plans"] });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "No se pudo crear el plan");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useUpdateMembershipPlan(planId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateMembershipPlanDTO) =>
      updateMembershipPlan(planId, payload),
    onSuccess: () => {
      enqueueSnackbar("Plan actualizado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["membership-plans"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo actualizar el plan"), {
        variant: "error",
      });
    },
  });
}

export function useUpdateMembershipPlanStatus(planId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: MembershipPlanStatusDTO) =>
      updateMembershipPlanStatus(planId, payload),
    onSuccess: () => {
      enqueueSnackbar("Estado del plan actualizado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["membership-plans"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo cambiar el estado"), {
        variant: "error",
      });
    },
  });
}

export function useCreateMembership() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateMembershipDTO) => createMembership(payload),
    onSuccess: () => {
      enqueueSnackbar("Membresía contratada correctamente", {
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      let message = getErrorMessage(error, "No se pudo contratar la membresía");
      
      if (code === "MEMBERSHIP_ALREADY_ACTIVE") {
        message = "El socio ya tiene un contrato vigente o congelado";
      } else if (code === "MEMBER_NOT_FOUND") {
        message = "El socio seleccionado no existe";
      } else if (code === "MEMBERSHIP_PLAN_NOT_FOUND") {
        message = "El plan seleccionado ya no existe";
      }
      
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useFreezeMembership(membershipId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateFreezeDTO) =>
      freezeMembership(membershipId, payload),
    onSuccess: () => {
      enqueueSnackbar("Membresía congelada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["memberships", membershipId] });
      queryClient.invalidateQueries({
        queryKey: ["memberships", membershipId, "freezes"],
      });
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      let message = getErrorMessage(error, "No se pudo congelar la membresía");
      if (code === "FREEZE_LIMIT_REACHED") {
        message = "Se alcanzó el límite de días o congelamientos del ciclo";
      } else if (code === "MEMBERSHIP_FROZEN") {
        message = "La membresía ya está congelada";
      } else if (code === "MEMBERSHIP_EXPIRED" || code === "MEMBERSHIP_CANCELLED") {
        message = "No se puede congelar un contrato vencido o cancelado";
      }
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useReactivateMembership(membershipId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: () => reactivateMembership(membershipId),
    onSuccess: () => {
      enqueueSnackbar("Membresía reactivada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["memberships", membershipId] });
      queryClient.invalidateQueries({
        queryKey: ["memberships", membershipId, "freezes"],
      });
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      const message =
        code === "FREEZE_NOT_IN_PROGRESS"
          ? "La membresía no está congelada"
          : getErrorMessage(error, "No se pudo reactivar la membresía");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useRenewMembership(membershipId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: () => renewMembership(membershipId),
    onSuccess: (renewed) => {
      enqueueSnackbar("Membresía renovada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({
        queryKey: ["memberships", renewed.membership_id],
      });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      const message = code === "INVALID_STATE_TRANSITION"
        ? "No se puede renovar un contrato congelado o cancelado"
        : getErrorMessage(error, "No se pudo renovar la membresía");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useChangeMembershipPlan(membershipId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: PlanChangeDTO) =>
      changeMembershipPlan(membershipId, payload),
    onSuccess: (changed) => {
      enqueueSnackbar("Plan cambiado correctamente", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({
        queryKey: ["memberships", changed.membership_id],
      });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      let message = getErrorMessage(error, "No se pudo cambiar el plan");
      if (code === "INVALID_STATE_TRANSITION") {
        message = "No se puede cambiar el plan de un contrato congelado";
      } else if (code === "VALIDATION_ERROR") {
        message = "El plan destino no existe o es el mismo que el actual";
      }
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useCancelMembership(membershipId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CancelMembershipDTO) =>
      cancelMembership(membershipId, payload),
    onSuccess: () => {
      enqueueSnackbar("Membresía cancelada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["memberships", membershipId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      const message =
        code === "MEMBERSHIP_CANCELLED"
          ? "La membresía ya estaba cancelada"
          : getErrorMessage(error, "No se pudo cancelar la membresía");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}