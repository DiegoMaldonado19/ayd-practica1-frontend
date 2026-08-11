// src/modules/members/services.ts

import { apiClient } from "@/api/client";
import type { Page } from "@/api/types";
import type {
  Member,
  CreateMemberDTO,
  UpdateMemberDTO,
  MemberListParams,
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

// Confirmado con test script real de Postman ("Alta con documento
// repetido"): si el documento ya pertenece a alguien -> 409
// DOCUMENT_ALREADY_REGISTERED.
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

// PATCH /members/{id}/status — baja lógica o reactivación del expediente.
export async function updateMemberStatus(
  memberId: number,
  status: "ACTIVE" | "INACTIVE" | "WITHDRAWN"
): Promise<Member> {
  const { data } = await apiClient.patch<Member>(`/members/${memberId}/status`, {
    status,
  });
  return data;
}