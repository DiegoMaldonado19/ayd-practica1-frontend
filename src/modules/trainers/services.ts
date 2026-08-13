// src/modules/trainers/services.ts

import { apiClient } from "@/api/client";
import type { Page } from "@/api/types";
import type {
  Trainer,
  UpdateTrainerLoadDTO,
  ReplaceSpecialtiesDTO,
  TrainerListParams,
  TransferMembersDTO,
} from "./types";

export async function getTrainers(
  params: TrainerListParams
): Promise<Page<Trainer>> {
  const { data } = await apiClient.get<Page<Trainer>>("/trainers", {
    params,
  });
  return data;
}

export async function getTrainerById(trainerId: number): Promise<Trainer> {
  const { data } = await apiClient.get<Trainer>(`/trainers/${trainerId}`);
  return data;
}

export async function updateTrainerLoad(
  trainerId: number,
  payload: UpdateTrainerLoadDTO
): Promise<Trainer> {
  const { data } = await apiClient.put<Trainer>(
    `/trainers/${trainerId}`,
    payload
  );
  return data;
}

export async function replaceSpecialties(
  trainerId: number,
  payload: ReplaceSpecialtiesDTO
): Promise<Trainer> {
  const { data } = await apiClient.put<Trainer>(
    `/trainers/${trainerId}/specialties`,
    payload
  );
  return data;
}

export async function transferTrainerMembers(
  trainerId: number,
  payload: TransferMembersDTO
): Promise<unknown[]> {
  const { data } = await apiClient.post<unknown[]>(
    `/trainers/${trainerId}/member-transfers`,
    payload
  );
  return data;
}