import { apiClient } from "@/api/client";
import type { Page } from "@/api/types";
import type {
  CancelMembershipDTO,
  CreateFreezeDTO,
  CreateMembershipDTO,
  CreateMembershipPlanDTO,
  FreezeSummary,
  Membership,
  MembershipFreeze,
  MembershipListParams,
  MembershipPlan,
  MembershipPlanListParams,
  MembershipPlanStatusDTO,
  PlanChangeDTO,
  UpdateMembershipPlanDTO,
} from "./types";

export async function getMembershipPlans(
  params: MembershipPlanListParams
): Promise<Page<MembershipPlan>> {
  const { data } = await apiClient.get<Page<MembershipPlan>>(
    "/membership-plans",
    { params }
  );
  return data;
}

export async function getMembershipPlanById(
  planId: number
): Promise<MembershipPlan> {
  const { data } = await apiClient.get<MembershipPlan>(
    `/membership-plans/${planId}`
  );
  return data;
}

export async function createMembershipPlan(
  payload: CreateMembershipPlanDTO
): Promise<MembershipPlan> {
  const { data } = await apiClient.post<MembershipPlan>(
    "/membership-plans",
    payload
  );
  return data;
}

export async function updateMembershipPlan(
  planId: number,
  payload: UpdateMembershipPlanDTO
): Promise<MembershipPlan> {
  const { data } = await apiClient.put<MembershipPlan>(
    `/membership-plans/${planId}`,
    payload
  );
  return data;
}

export async function updateMembershipPlanStatus(
  planId: number,
  payload: MembershipPlanStatusDTO
): Promise<MembershipPlan> {
  const { data } = await apiClient.patch<MembershipPlan>(
    `/membership-plans/${planId}/status`,
    payload
  );
  return data;
}

export async function getMemberships(
  params: MembershipListParams
): Promise<Page<Membership>> {
  const { data } = await apiClient.get<Page<Membership>>("/memberships", {
    params,
  });
  return data;
}

export async function getMembershipById(
  membershipId: number
): Promise<Membership> {
  const { data } = await apiClient.get<Membership>(
    `/memberships/${membershipId}`
  );
  return data;
}

export async function createMembership(
  payload: CreateMembershipDTO
): Promise<Membership> {
  const { data } = await apiClient.post<Membership>("/memberships", payload);
  return data;
}

export async function getMemberMembershipHistory(
  memberId: number,
  params?: { page?: number; size?: number }
): Promise<Page<Membership>> {
  const { data } = await apiClient.get<Page<Membership>>(
    `/members/${memberId}/memberships`,
    { params }
  );
  return data;
}

export async function getMembershipFreezes(
  membershipId: number
): Promise<FreezeSummary> {
  const { data } = await apiClient.get<FreezeSummary>(
    `/memberships/${membershipId}/freezes`
  );
  return data;
}

export async function freezeMembership(
  membershipId: number,
  payload: CreateFreezeDTO
): Promise<MembershipFreeze> {
  const { data } = await apiClient.post<MembershipFreeze>(
    `/memberships/${membershipId}/freezes`,
    payload
  );
  return data;
}

export async function reactivateMembership(
  membershipId: number
): Promise<Membership> {
  const { data } = await apiClient.post<Membership>(
    `/memberships/${membershipId}/reactivations`
  );
  return data;
}

export async function renewMembership(
  membershipId: number
): Promise<Membership> {
  const { data } = await apiClient.post<Membership>(
    `/memberships/${membershipId}/renewals`
  );
  return data;
}

export async function changeMembershipPlan(
  membershipId: number,
  payload: PlanChangeDTO
): Promise<Membership> {
  const { data } = await apiClient.post<Membership>(
    `/memberships/${membershipId}/plan-changes`,
    payload
  );
  return data;
}

export async function cancelMembership(
  membershipId: number,
  payload: CancelMembershipDTO
): Promise<Membership> {
  const { data } = await apiClient.post<Membership>(
    `/memberships/${membershipId}/cancellations`,
    payload
  );
  return data;
}

