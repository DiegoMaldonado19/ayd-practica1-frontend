export type PaymentConcept = "OTHER" | "MEMBERSHIP" | "GUEST_PASS";
export type PaymentMethod = "CASH" | "DEBIT_CARD" | "CREDIT_CARD" | "BANK_TRANSFER" | "OTHER";
export type PaymentStatus = "REGISTERED" | "CONFIRMED" | "VOIDED";
export type PromotionDiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Promotion {
  promotion_id: number;
  code: string;
  name: string;
  description?: string;
  discount_type: PromotionDiscountType;
  discount_value: number;
  valid_from: string;
  valid_to: string;
  active: boolean;
  max_uses?: number | null;
  max_uses_per_member?: number | null;
  authorized_by_user_id?: number | null;
  created_at?: string;
}

export interface Payment {
  payment_id: number;
  member_id: number | null;
  guest_pass_id?: number | null;
  membership_id?: number | null;
  concept: PaymentConcept;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  discount_amount?: number | null;
  promotion_id?: number | null;
  receipt_series?: string | null;
  receipt_number?: number | null;
  receipt_issued_at?: string | null;
  void_reason?: string | null;
  created_at?: string;
}

export interface PromotionListParams {
  page?: number;
  size?: number;
  active?: boolean;
}

export interface PaymentListParams {
  page?: number;
  size?: number;
  member_id?: number;
  status?: PaymentStatus;
  payment_method?: PaymentMethod;
  from?: string;
  to?: string;
}

export interface CreatePromotionPayload {
  code: string;
  name: string;
  description?: string;
  discount_type: PromotionDiscountType;
  discount_value: number;
  valid_from: string;
  valid_to: string;
  max_uses?: number | null;
  max_uses_per_member?: number | null;
}

export interface CreatePaymentPayload {
  member_id?: number | null;
  guest_pass_id?: number | null;
  membership_id?: number | null;
  concept: PaymentConcept;
  payment_method: PaymentMethod;
  promotion_id?: number | null;
  amount?: number;
}

export interface VoidPaymentPayload {
  reason: string;
}
