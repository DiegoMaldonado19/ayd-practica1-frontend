import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getErrorMessage } from "@/api/types";
import {
  confirmPayment,
  createPayment,
  createPromotion,
  getPaymentById,
  getPayments,
  getPromotionById,
  getPromotions,
  togglePromotionStatus,
  updatePromotion,
  voidPayment,
} from "./services";
import type {
  CreatePaymentPayload,
  CreatePromotionPayload,
  PaymentListParams,
  PromotionListParams,
  VoidPaymentPayload,
} from "./types";

export function usePromotions(params: PromotionListParams = {}) {
  return useQuery({
    queryKey: ["promotions", params],
    queryFn: () => getPromotions(params),
  });
}

export function usePromotion(promotionId: number | undefined) {
  return useQuery({
    queryKey: ["promotions", promotionId],
    queryFn: () => getPromotionById(promotionId as number),
    enabled: !!promotionId,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreatePromotionPayload) => createPromotion(payload),
    onSuccess: () => {
      enqueueSnackbar("Promoción creada correctamente", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo crear la promoción"), { variant: "error" });
    },
  });
}

export function useUpdatePromotion(promotionId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreatePromotionPayload) => updatePromotion(promotionId, payload),
    onSuccess: () => {
      enqueueSnackbar("Promoción actualizada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["promotions", promotionId] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo actualizar la promoción"), { variant: "error" });
    },
  });
}

export function useTogglePromotionStatus() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ promotionId, active }: { promotionId: number; active: boolean }) => togglePromotionStatus(promotionId, active),
    onSuccess: (_, variables) => {
      enqueueSnackbar(`Promoción ${variables.active ? "activada" : "desactivada"}`, { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo cambiar el estado de la promoción"), { variant: "error" });
    },
  });
}

export function usePayments(params: PaymentListParams = {}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => getPayments(params),
  });
}

export function usePayment(paymentId: number | undefined) {
  return useQuery({
    queryKey: ["payments", paymentId],
    queryFn: () => getPaymentById(paymentId as number),
    enabled: !!paymentId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => createPayment(payload),
    onSuccess: () => {
      enqueueSnackbar("Pago registrado correctamente", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo registrar el pago"), { variant: "error" });
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (paymentId: number) => confirmPayment(paymentId),
    onSuccess: () => {
      enqueueSnackbar("Pago confirmado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo confirmar el pago"), { variant: "error" });
    },
  });
}

export function useVoidPayment() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ paymentId, payload }: { paymentId: number; payload: VoidPaymentPayload }) => voidPayment(paymentId, payload),
    onSuccess: () => {
      enqueueSnackbar("Pago anulado correctamente", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo anular el pago"), { variant: "error" });
    },
  });
}
