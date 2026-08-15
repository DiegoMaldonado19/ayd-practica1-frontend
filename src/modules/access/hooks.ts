import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { getVisits, createVisit, checkoutVisit, getGuestPasses, createGuestPass } from './services';
import type { VisitListParams, GuestPassListParams, CreateVisitDTO, CreateGuestPassDTO } from './types';
import { getErrorMessage } from '@/api/types';
import { getMemberById } from '@/modules/members/services';

export const useVisits = (params: VisitListParams) => {
  return useQuery({
    queryKey: ['visits', params],
    queryFn: () => getVisits(params),
  });
};

export const useCreateVisit = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: CreateVisitDTO) => createVisit(data),
    onSuccess: () => {
      enqueueSnackbar('Check-in registrado exitosamente', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
    onError: (error) => {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    },
  });
};

export const useCheckoutVisit = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (visitId: number) => checkoutVisit(visitId),
    onSuccess: () => {
      enqueueSnackbar('Check-out registrado exitosamente', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
    onError: (error) => {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    },
  });
};

export const useGuestPasses = (params: GuestPassListParams) => {
  return useQuery({
    queryKey: ['guest-passes', params],
    queryFn: () => getGuestPasses(params),
  });
};

export const useCreateGuestPass = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: CreateGuestPassDTO) => createGuestPass(data),
    onSuccess: () => {
      enqueueSnackbar('Pase de invitado registrado exitosamente', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['guest-passes'] });
    },
    onError: (error) => {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    },
  });
};

export function useMembersMap(memberIds: (number | null | undefined)[]) {
  const uniqueIds = Array.from(new Set(memberIds.filter((id): id is number => !!id)));

  const results = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ['members', id],
      queryFn: () => getMemberById(id),
      staleTime: 60_000,
    })),
  });

  const map = new Map<number, string>();
  uniqueIds.forEach((id, i) => {
    const member = results[i]?.data;
    if (member) {
      map.set(id, `${member.person.full_name} (${member.person.document_number})`);
    }
  });

  const isLoading = results.some((r) => r.isLoading);
  return { map, isLoading };
}