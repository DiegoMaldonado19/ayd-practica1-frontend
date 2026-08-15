export type BillingPeriod = "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL";

export type MembershipStatus = "ACTIVE" | "FROZEN" | "EXPIRED" | "CANCELLED";

export type FreezeReason = "TRAVEL" | "INJURY" | "OTHER";

export type CancellationReason = "COST" | "OTHER";

export interface MembershipPlan {
  membership_plan_id: number;
  code: string;
  name: string;
  description: string | null;
  billing_period: BillingPeriod;
  price: number;
  tier: number;
  includes_group_classes: boolean;
  weekly_class_limit: number | null;
  includes_personal_trainer: boolean;
  active: boolean;
}

export interface CreateMembershipPlanDTO {
  code: string;
  name: string;
  description?: string;
  billing_period: BillingPeriod;
  price: number;
  tier: number;
  includes_group_classes: boolean;
  weekly_class_limit?: number | null;
  includes_personal_trainer: boolean;
}

export interface UpdateMembershipPlanDTO {
  name: string;
  description?: string;
  billing_period: BillingPeriod;
  price: number;
  includes_group_classes: boolean;
  weekly_class_limit?: number | null;
  includes_personal_trainer: boolean;
}

export interface MembershipPlanStatusDTO {
  active: boolean;
}

export interface MembershipPlanListParams {
  page?: number;
  size?: number;
  sort?: string;
  active?: boolean;
}

export interface Membership {
  membership_id: number;
  member_id: number;
  plan: MembershipPlan;
  status: MembershipStatus;
  paid_price: number;
  start_date: string;
  end_date: string;
  days_remaining: number;
  notes: string | null;
  cancelled_on: string | null;
  cancellation_reason: string | null;
}

export interface CreateMembershipDTO {
  member_id: number;
  membership_plan_id: number;
  notes?: string;
  start_date?: string;
}

export interface MembershipListParams {
  page?: number;
  size?: number;
  status?: MembershipStatus;
  plan_id?: number;
  expiring_in_days?: number;
  sort?: string;
}

export interface MembershipFreeze {
  membership_freeze_id: number;
  reason: FreezeReason;
  reason_detail: string | null;
  start_date: string;
  expected_end_date: string | null;
  reactivated_on: string | null;
  in_progress: boolean;
}

export interface FreezeSummary {
  freezes: MembershipFreeze[];
  freezes_used_in_cycle: number;
  max_count_per_cycle: number;
  max_days_per_cycle: number;
  cycle_days: number;
}

export interface CreateFreezeDTO {
  reason: FreezeReason;
  reason_detail?: string;
  expected_end_date?: string | null;
}

export interface PlanChangeDTO {
  membership_plan_id: number;
  notes?: string;
}

export interface CancelMembershipDTO {
  cancellation_reason: CancellationReason;
  notes?: string;
}