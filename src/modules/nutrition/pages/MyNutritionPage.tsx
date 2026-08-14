import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/auth/useAuth";
import { useOwnMemberId } from "@/hooks/useOwnMemberId";
import { useDailySummary, useDeleteMeal, useMeals, useNutritionGoal, useSummaryTrend } from "../hooks";
import { MealFormDialog } from "../components/MealFormDialog";
import { NutritionGoalDialog } from "../components/NutritionGoalDialog";
import type { CalorieStatus, Meal, MealType } from "../types";

const MEAL_TYPE_LABEL: Record<MealType, string> = {
  BREAKFAST: "Desayuno",
  LUNCH: "Almuerzo",
  DINNER: "Cena",
  SNACK: "Merienda / snack",
};

const CALORIE_STATUS_LABEL: Record<CalorieStatus, string> = {
  UNDER: "Por debajo de la meta",
  ACCEPTABLE: "Dentro del rango",
  OVER: "Por encima de la meta",
};

const CALORIE_STATUS_COLOR: Record<CalorieStatus, "info" | "success" | "warning"> = {
  UNDER: "info",
  ACCEPTABLE: "success",
  OVER: "warning",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function MyNutritionPage() {
  const { user } = useAuth();
  const fallback = useOwnMemberId();
  const memberId = user?.member_id ?? (fallback.status === "resolved" ? fallback.memberId ?? undefined : undefined);

  const [mealFormOpen, setMealFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | undefined>(undefined);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const today = todayIso();
  const { data: summary, isLoading: summaryLoading } = useDailySummary(memberId, today);
  const { data: mealsPage, isLoading: mealsLoading } = useMeals({ memberId, date: today, page: 0, size: 20 });
  const { data: goal } = useNutritionGoal(memberId);
  const { data: trend } = useSummaryTrend(memberId, daysAgoIso(6), today);

  const deleteMeal = useDeleteMeal(memberId);

  const meals = mealsPage?.content ?? [];

  const openNewMeal = () => {
    setEditingMeal(undefined);
    setMealFormOpen(true);
  };

  if (fallback.status === "loading" && !user?.member_id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!memberId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Mi nutrición
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Esta información aparecerá cuando tengas actividad registrada en el sistema.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Mi nutrición
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Resumen de hoy
          </Typography>
          <Button size="small" onClick={() => setGoalDialogOpen(true)}>
            {goal ? "Ajustar meta" : "Definir meta"}
          </Button>
        </Stack>

        {summaryLoading && <CircularProgress size={24} />}

        {summary && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Calorías
                </Typography>
                <Typography variant="h6">{summary.totals.calories}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Proteína (g)
                </Typography>
                <Typography variant="h6">{summary.totals.protein_g}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Carbohidratos (g)
                </Typography>
                <Typography variant="h6">{summary.totals.carbohydrates_g}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Grasa (g)
                </Typography>
                <Typography variant="h6">{summary.totals.fat_g}</Typography>
              </Grid>
            </Grid>

            {summary.calorie_status && (
              <Chip
                label={`${CALORIE_STATUS_LABEL[summary.calorie_status]} (meta: ${summary.goal?.daily_calories} kcal)`}
                color={CALORIE_STATUS_COLOR[summary.calorie_status]}
                size="small"
              />
            )}
            {!summary.calorie_status && (
              <Typography variant="body2" color="text.secondary">
                Define una meta calórica para ver tu progreso comparado.
              </Typography>
            )}
          </>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Comidas de hoy
          </Typography>
          <Button variant="contained" size="small" onClick={openNewMeal}>
            Registrar comida
          </Button>
        </Stack>

        {mealsLoading && <CircularProgress size={24} />}

        {!mealsLoading && meals.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No has registrado comidas hoy.
          </Typography>
        )}

        <Stack spacing={1.5}>
          {meals.map((meal) => (
            <Paper key={meal.meal_id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Chip size="small" label={MEAL_TYPE_LABEL[meal.meal_type]} sx={{ mb: 0.5 }} />
                  <Typography variant="body2">
                    {meal.total_calories} kcal · {meal.items.length} alimento(s)
                  </Typography>
                  {meal.notes && (
                    <Typography variant="caption" color="text.secondary">
                      {meal.notes}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingMeal(meal);
                      setMealFormOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button size="small" color="warning" onClick={() => deleteMeal.mutate(meal.meal_id)}>
                    Eliminar
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Últimos 7 días
        </Typography>
        <Stack spacing={1}>
          {(trend ?? []).map((day) => (
            <Stack key={day.date} direction="row" justifyContent="space-between">
              <Typography variant="body2">{day.date}</Typography>
              <Typography variant="body2">{day.totals.calories} kcal</Typography>
            </Stack>
          ))}
          {(trend ?? []).length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Sin datos en los últimos 7 días.
            </Typography>
          )}
        </Stack>
      </Paper>

      {mealFormOpen && (
        <MealFormDialog
          open={mealFormOpen}
          onClose={() => setMealFormOpen(false)}
          memberId={memberId}
          meal={editingMeal}
        />
      )}

      {goalDialogOpen && (
        <NutritionGoalDialog
          open={goalDialogOpen}
          onClose={() => setGoalDialogOpen(false)}
          memberId={memberId}
          goal={goal}
        />
      )}
    </Box>
  );
}
