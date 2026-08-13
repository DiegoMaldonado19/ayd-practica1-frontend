import { apiClient } from "@/api/client";
import type { Page } from "@/api/types";
import type {
  Member,
  CreateMemberDTO,
  UpdateMemberDTO,
  MemberListParams,
  MemberStatus,
} from "@/modules/members/types";

export async function getMembers(
  params: MemberListParams
): Promise<Page<Member>> {
  const { data } = await apiClient.get<Page<Member>>("/members", {
    params,
  });
  return data;
}

export async function getMemberById(memberId: number): Promise<Member> {
  const { data } = await apiClient.get<Member>(`/members/${memberId}`);
  return data;
}

export async function createMember(payload: CreateMemberDTO): Promise<Member> {
  const { data } = await apiClient.post<Member>("/members", payload);
  return data;
}

export async function updateMember(
  memberId: number,
  payload: UpdateMemberDTO
): Promise<Member> {
  const { data } = await apiClient.put<Member>(`/members/${memberId}`, payload);
  return data;
}

export async function updateMemberStatus(
  memberId: number,
  status: MemberStatus
): Promise<Member> {
  const { data } = await apiClient.patch<Member>(`/members/${memberId}/status`, {
    status,
  });
  return data;
}