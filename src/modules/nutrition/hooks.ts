import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getErrorCode, getErrorMessage } from "@/api/types";
import {
  getFoods,
  createFood,
  updateFood,
  deactivateFood,
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  getNutritionGoal,
  upsertNutritionGoal,
  getDailySummary,
  getSummaryTrend,
} from "./services";
import type {
  CreateFoodDTO,
  UpdateFoodDTO,
  FoodListParams,
  CreateMealDTO,
  UpdateMealDTO,
  MealListParams,
  UpsertNutritionGoalDTO,
} from "./types";

export function useFoods(params: FoodListParams) {
  return useQuery({
    queryKey: ["foods", params],
    queryFn: () => getFoods(params),
  });
}

export function useCreateFood() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateFoodDTO) => createFood(payload),
    onSuccess: () => {
      enqueueSnackbar("Alimento creado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo crear el alimento"), { variant: "error" });
    },
  });
}

export function useUpdateFood(foodId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateFoodDTO) => updateFood(foodId, payload),
    onSuccess: () => {
      enqueueSnackbar("Alimento actualizado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      const message =
        code === "FOOD_IN_USE"
          ? "Los valores nutricionales de un alimento ya consumido no se pueden modificar"
          : getErrorMessage(error, "No se pudo actualizar el alimento");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useDeactivateFood() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (foodId: number) => deactivateFood(foodId),
    onSuccess: () => {
      enqueueSnackbar("Alimento desactivado", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      const message =
        code === "FOOD_IN_USE"
          ? "Este alimento ya fue usado en comidas registradas"
          : getErrorMessage(error, "No se pudo desactivar el alimento");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useMeals(params: MealListParams) {
  return useQuery({
    queryKey: ["meals", params],
    queryFn: () => getMeals(params),
  });
}

export function useMeal(mealId: number | undefined) {
  return useQuery({
    queryKey: ["meals", mealId],
    queryFn: () => getMealById(mealId as number),
    enabled: !!mealId,
  });
}

function invalidateMealRelated(queryClient: ReturnType<typeof useQueryClient>, memberId?: number) {
  queryClient.invalidateQueries({ queryKey: ["meals"] });
  if (memberId) {
    queryClient.invalidateQueries({ queryKey: ["members", memberId, "nutrition-summary"] });
  }
}

export function useCreateMeal(memberId?: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: CreateMealDTO) => createMeal(payload),
    onSuccess: () => {
      enqueueSnackbar("Comida registrada", { variant: "success" });
      invalidateMealRelated(queryClient, memberId);
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      let message = getErrorMessage(error, "No se pudo registrar la comida");
      if (code === "MEMBERSHIP_NOT_ACTIVE") {
        message = "Tu membresía no está activa";
      } else if (code === "VALIDATION_ERROR") {
        message = getErrorMessage(error, "El mismo alimento no puede repetirse en una comida");
      }
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useUpdateMeal(mealId: number, memberId?: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpdateMealDTO) => updateMeal(mealId, payload),
    onSuccess: () => {
      enqueueSnackbar("Comida actualizada", { variant: "success" });
      invalidateMealRelated(queryClient, memberId);
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      const message =
        code === "MEAL_EDIT_WINDOW_CLOSED"
          ? "Solo puedes editar una comida registrada el mismo día"
          : getErrorMessage(error, "No se pudo actualizar la comida");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useDeleteMeal(memberId?: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (mealId: number) => deleteMeal(mealId),
    onSuccess: () => {
      enqueueSnackbar("Comida eliminada", { variant: "success" });
      invalidateMealRelated(queryClient, memberId);
    },
    onError: (error: unknown) => {
      const code = getErrorCode(error);
      const message =
        code === "MEAL_EDIT_WINDOW_CLOSED"
          ? "Solo puedes eliminar una comida registrada el mismo día"
          : getErrorMessage(error, "No se pudo eliminar la comida");
      enqueueSnackbar(message, { variant: "error" });
    },
  });
}

export function useNutritionGoal(memberId: number | undefined) {
  return useQuery({
    queryKey: ["members", memberId, "nutrition-goal"],
    queryFn: () => getNutritionGoal(memberId as number),
    enabled: !!memberId,
    retry: false,
  });
}

export function useUpsertNutritionGoal(memberId: number) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (payload: UpsertNutritionGoalDTO) => upsertNutritionGoal(memberId, payload),
    onSuccess: () => {
      enqueueSnackbar("Meta calórica guardada", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["members", memberId, "nutrition-goal"] });
      queryClient.invalidateQueries({ queryKey: ["members", memberId, "nutrition-summary"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "No se pudo guardar la meta calórica"), {
        variant: "error",
      });
    },
  });
}

export function useDailySummary(memberId: number | undefined, date?: string) {
  return useQuery({
    queryKey: ["members", memberId, "nutrition-summary", "daily", date],
    queryFn: () => getDailySummary(memberId as number, date),
    enabled: !!memberId,
  });
}

export function useSummaryTrend(memberId: number | undefined, from: string, to: string) {
  return useQuery({
    queryKey: ["members", memberId, "nutrition-summary", "trend", from, to],
    queryFn: () => getSummaryTrend(memberId as number, from, to),
    enabled: !!memberId,
  });
}
