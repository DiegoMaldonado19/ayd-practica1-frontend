import { apiClient } from "@/api/client";
import type { Page } from "@/api/types";
import type {
  CreatePaymentPayload,
  CreatePromotionPayload,
  Payment,
  PaymentListParams,
  Promotion,
  PromotionListParams,
  VoidPaymentPayload,
} from "./types";

export async function getPromotions(params: PromotionListParams = {}): Promise<Page<Promotion>> {
  const { data } = await apiClient.get<Page<Promotion>>("/promotions", { params });
  return data;
}

export async function getPromotionById(promotionId: number): Promise<Promotion> {
  const { data } = await apiClient.get<Promotion>(`/promotions/${promotionId}`);
  return data;
}

export async function createPromotion(payload: CreatePromotionPayload): Promise<Promotion> {
  const { data } = await apiClient.post<Promotion>("/promotions", payload);
  return data;
}

export async function updatePromotion(
  promotionId: number,
  payload: CreatePromotionPayload,
): Promise<Promotion> {
  const { data } = await apiClient.put<Promotion>(`/promotions/${promotionId}`, payload);
  return data;
}

export async function togglePromotionStatus(
  promotionId: number,
  active: boolean,
): Promise<Promotion> {
  const { data } = await apiClient.patch<Promotion>(`/promotions/${promotionId}/status`, { active });
  return data;
}

export async function getPayments(params: PaymentListParams = {}): Promise<Page<Payment>> {
  const { data } = await apiClient.get<Page<Payment>>("/payments", { params });
  return data;
}

export async function getPaymentById(paymentId: number): Promise<Payment> {
  const { data } = await apiClient.get<Payment>(`/payments/${paymentId}`);
  return data;
}

export async function createPayment(payload: CreatePaymentPayload): Promise<Payment> {
  const { data } = await apiClient.post<Payment>("/payments", payload);
  return data;
}

export async function confirmPayment(paymentId: number): Promise<Payment> {
  const { data } = await apiClient.post<Payment>(`/payments/${paymentId}/confirmations`);
  return data;
}

export async function voidPayment(paymentId: number, payload: VoidPaymentPayload): Promise<Payment> {
  const { data } = await apiClient.post<Payment>(`/payments/${paymentId}/voids`, payload);
  return data;
}

export async function getPaymentReceipt(paymentId: number): Promise<{ receipt_series: string; receipt_number: number; receipt_issued_at: string }> {
  const { data } = await apiClient.get<{ receipt_series: string; receipt_number: number; receipt_issued_at: string }>(`/payments/${paymentId}/receipt`);
  return data;
}
