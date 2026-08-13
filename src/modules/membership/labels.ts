import type {
  BillingPeriod,
  CancellationReason,
  FreezeReason,
  MembershipStatus,
} from "./types";

export const billingPeriodLabel: Record<BillingPeriod, string> = {
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  ANNUAL: "Anual",
};

export const membershipStatusLabel: Record<MembershipStatus, string> = {
  ACTIVE: "Activa",
  FROZEN: "Congelada",
  EXPIRED: "Vencida",
  CANCELLED: "Cancelada",
};

export const membershipStatusColor: Record<
  MembershipStatus,
  "success" | "info" | "warning" | "error"
> = {
  ACTIVE: "success",
  FROZEN: "info",
  EXPIRED: "warning",
  CANCELLED: "error",
};

export const freezeReasonLabel: Record<FreezeReason, string> = {
  TRAVEL: "Viaje",
  INJURY: "Lesión",
  OTHER: "Otro",
};

export const cancellationReasonLabel: Record<CancellationReason, string> = {
  COST: "Costo",
  OTHER: "Otro",
};