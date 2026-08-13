import { apiClient } from '@/api/client';
import type { Page } from '@/api/types';
import type {
  Visit,
  GuestPass,
  CreateVisitDTO,
  CreateGuestPassDTO,
  VisitListParams,
  GuestPassListParams,
} from './types';

export const getVisits = async (params: VisitListParams): Promise<Page<Visit>> => {
  const response = await apiClient.get<Page<Visit>>('/visits', { params });
  return response.data;
};

export const createVisit = async (data: CreateVisitDTO): Promise<Visit> => {
  const response = await apiClient.post<Visit>('/visits', data);
  return response.data;
};

export const checkoutVisit = async (visitId: number): Promise<Visit> => {
  const response = await apiClient.post<Visit>(`/visits/${visitId}/check-out`);
  return response.data;
};

export const getGuestPasses = async (params: GuestPassListParams): Promise<Page<GuestPass>> => {
  const response = await apiClient.get<Page<GuestPass>>('/guest-passes', { params });
  return response.data;
};

export const createGuestPass = async (data: CreateGuestPassDTO): Promise<GuestPass> => {
  const response = await apiClient.post<GuestPass>('/guest-passes', data);
  return response.data;
};