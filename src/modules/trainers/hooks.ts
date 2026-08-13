// src/modules/trainers/hooks.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getErrorMessage } from "@/api/types";
import {
  getTrainers,
  getTrainerById,
  updateTrainerLoad,
  replaceSpecialties,
} from "./services";
import type {
  UpdateTrainerLoadDTO,
  ReplaceSpecialtiesDTO,
  TrainerListParams,
} from "./types";

export function useTrainers(params: TrainerListParams) {
  return useQuery({
    queryKey: ["trainers", params],
    queryFn: () => getTrainers(params),
  });
}

export function useTrainer(trainerId: number | undefined) {
  return useQuery({
    queryKey: ["trainers", trainerId],
    queryFn: () => getTrainerById(trainerId as number),
    enabled: !!trainerId,
  });
}

export function useUpdateTrainerLoad(trainerId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateTrainerLoadDTO) =>
      updateTrainerLoad(trainerId, payload),
    onSuccess: () => {
      enqueueSnackbar("Carga máxima actualizada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["trainers", trainerId] });
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
    onError: (error) => {
      enqueueSnackbar(getErrorMessage(error), { variant: "error" });
    },
  });
}

export function useReplaceSpecialties(trainerId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: ReplaceSpecialtiesDTO) =>
      replaceSpecialties(trainerId, payload),
    onSuccess: () => {
      enqueueSnackbar("Especialidades actualizadas", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["trainers", trainerId] });
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
    onError: (error) => {
      enqueueSnackbar(getErrorMessage(error), { variant: "error" });
    },
  });
}