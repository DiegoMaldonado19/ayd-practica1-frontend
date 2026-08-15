import { apiClient } from "@/api/client";
import type { Page } from "@/api/types";
import type {
  Food,
  CreateFoodDTO,
  UpdateFoodDTO,
  FoodListParams,
  Meal,
  CreateMealDTO,
  UpdateMealDTO,
  MealListParams,
  NutritionGoal,
  UpsertNutritionGoalDTO,
  NutritionSummary,
} from "./types";

export async function getFoods(params: FoodListParams): Promise<Page<Food>> {
  const { data } = await apiClient.get<Page<Food>>("/foods", { params });
  return data;
}

export async function createFood(payload: CreateFoodDTO): Promise<Food> {
  const { data } = await apiClient.post<Food>("/foods", payload);
  return data;
}

export async function updateFood(foodId: number, payload: UpdateFoodDTO): Promise<Food> {
  const { data } = await apiClient.put<Food>(`/foods/${foodId}`, payload);
  return data;
}

export async function deactivateFood(foodId: number): Promise<void> {
  await apiClient.delete(`/foods/${foodId}`);
}

// GET /meals binds its member filter by the literal Java parameter name `memberId`
// (no `name = "member_id"` override on the backend, unlike every other list endpoint
// in this API) — sending `member_id` here silently filters nothing.
export async function getMeals(params: MealListParams): Promise<Page<Meal>> {
  const { memberId, ...rest } = params;
  const { data } = await apiClient.get<Page<Meal>>("/meals", {
    params: { ...rest, memberId },
  });
  return data;
}

export async function getMealById(mealId: number): Promise<Meal> {
  const { data } = await apiClient.get<Meal>(`/meals/${mealId}`);
  return data;
}

export async function createMeal(payload: CreateMealDTO): Promise<Meal> {
  const { data } = await apiClient.post<Meal>("/meals", payload);
  return data;
}

export async function updateMeal(mealId: number, payload: UpdateMealDTO): Promise<Meal> {
  const { data } = await apiClient.put<Meal>(`/meals/${mealId}`, payload);
  return data;
}

export async function deleteMeal(mealId: number): Promise<void> {
  await apiClient.delete(`/meals/${mealId}`);
}

export async function getNutritionGoal(memberId: number): Promise<NutritionGoal> {
  const { data } = await apiClient.get<NutritionGoal>(`/members/${memberId}/nutrition-goal`);
  return data;
}

export async function upsertNutritionGoal(
  memberId: number,
  payload: UpsertNutritionGoalDTO,
): Promise<NutritionGoal> {
  const { data } = await apiClient.put<NutritionGoal>(
    `/members/${memberId}/nutrition-goal`,
    payload,
  );
  return data;
}

// GET /members/{id}/nutrition-summary is polymorphic on the backend: with no
// from/to it returns one NutritionSummary object (`daily`); with from/to it
// returns an array, one entry per day (`trend`). Split into two typed calls
// instead of one function returning a union.
export async function getDailySummary(memberId: number, date?: string): Promise<NutritionSummary> {
  const { data } = await apiClient.get<NutritionSummary>(
    `/members/${memberId}/nutrition-summary`,
    { params: { date } },
  );
  return data;
}

export async function getSummaryTrend(
  memberId: number,
  from: string,
  to: string,
): Promise<NutritionSummary[]> {
  const { data } = await apiClient.get<NutritionSummary[]>(
    `/members/${memberId}/nutrition-summary`,
    { params: { from, to } },
  );
  return data;
}
