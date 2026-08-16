import type { Payment } from "@/modules/billing/types";

export const paymentStatusColor: Record<string, "success" | "warning" | "error" | "default"> = {
  REGISTERED: "warning",
  CONFIRMED: "success",
  VOIDED: "error",
};

export const paymentStatusLabel: Record<string, string> = {
  REGISTERED: "Registrado",
  CONFIRMED: "Confirmado",
  VOIDED: "Anulado",
};

export const paymentConceptLabel: Record<string, string> = {
  OTHER: "Otro",
  MEMBERSHIP: "Membresía",
  GUEST_PASS: "Pase de día",
};

export const paymentMethodLabel: Record<string, string> = {
  CASH: "Efectivo",
  DEBIT_CARD: "Tarjeta débito",
};

export function formatCurrency(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function computePaymentAmounts(payment: Payment): {
  gross: number;
  net: number;
  discount: number;
} {
  const gross = Number(payment.gross_amount ?? payment.amount ?? 0);
  const net =
    typeof payment.net_amount === "number"
      ? Number(payment.net_amount)
      : Math.max(gross - Number(payment.discount_amount ?? 0), 0);
  const discount = Math.max(gross - net, 0);
  return { gross, net, discount };
}

export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

/** Calcula el descuento y el total (neto) aplicando la promoción sobre el monto original. */
export const computeDiscount = (
  gross: number,
  promotion: { discount_type?: string; discount_value?: number | string } | null,
): { discount: number; net: number } => {
  if (!promotion) return { discount: 0, net: gross };
  if (promotion.discount_type === "PERCENTAGE") {
    const discount = (gross * Number(promotion.discount_value)) / 100;
    return { discount, net: Math.max(gross - discount, 0) };
  }
  const discount = Math.min(Number(promotion.discount_value), gross);
  return { discount, net: Math.max(gross - discount, 0) };
};

export const fieldInfo = (title: string, example: string) => ({ title, example });