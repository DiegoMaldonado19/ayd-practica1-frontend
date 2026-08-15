export type FoodCategory =
  | "PROTEIN"
  | "CARBOHYDRATE"
  | "FAT"
  | "VEGETABLE"
  | "FRUIT"
  | "DAIRY"
  | "BEVERAGE"
  | "PREPARED"
  | "OTHER";

export type ServingUnit = "GRAM" | "MILLILITER" | "UNIT";

export interface Food {
  food_id: number;
  code: string;
  name: string;
  category: FoodCategory;
  serving_size: number;
  serving_unit: ServingUnit;
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  active: boolean;
  created_at: string;
}

export interface CreateFoodDTO {
  code: string;
  name: string;
  category: FoodCategory;
  serving_size: number;
  serving_unit: ServingUnit;
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
}

export type UpdateFoodDTO = CreateFoodDTO;

export interface FoodListParams {
  page?: number;
  size?: number;
  category?: FoodCategory;
  search?: string;
  active?: boolean;
}

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface MealItemRequest {
  food_id: number;
  quantity: number;
}

export interface MealItemResponse {
  meal_item_id: number;
  meal_id: number;
  food_id: number;
  food_name: string;
  quantity: number;
  serving_size: number;
  serving_unit: ServingUnit;
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
}

export interface Meal {
  meal_id: number;
  member_id: number;
  log_date: string;
  meal_type: MealType;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  items: MealItemResponse[];
  total_calories: number;
  total_protein_g: number;
  total_carbohydrates_g: number;
  total_fat_g: number;
}

export interface CreateMealDTO {
  member_id?: number;
  log_date?: string;
  meal_type: MealType;
  notes?: string;
  items: MealItemRequest[];
}

export interface UpdateMealDTO {
  meal_type: MealType;
  notes?: string;
  items: MealItemRequest[];
}

export interface MealListParams {
  page?: number;
  size?: number;
  memberId?: number;
  date?: string;
  from?: string;
  to?: string;
}

export type GoalType = "WEIGHT_LOSS" | "MUSCLE_GAIN" | "MAINTENANCE";
export type GoalDefinedBy = "MEMBER" | "TRAINER";

export interface NutritionGoal {
  nutrition_goal_id: number;
  member_id: number;
  goal_type: GoalType;
  daily_calories: number;
  tolerance_percent: number;
  target_weight_kg: number | null;
  defined_by: GoalDefinedBy;
  start_date: string;
}

export interface UpsertNutritionGoalDTO {
  goal_type: GoalType;
  daily_calories: number;
  tolerance_percent?: number;
  target_weight_kg?: number;
}

export type CalorieStatus = "UNDER" | "ACCEPTABLE" | "OVER";

export interface DailyTotals {
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
}

export interface MealTimeSummary {
  meal_type: MealType;
  meal_count: number;
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
}

export interface NutritionSummary {
  member_id: number;
  date: string;
  totals: DailyTotals;
  by_meal_time: MealTimeSummary[];
  goal: NutritionGoal | null;
  calorie_status: CalorieStatus | null;
  calorie_difference: number | null;
  percent_of_goal: number | null;
}
