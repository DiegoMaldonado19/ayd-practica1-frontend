import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useMember } from "@/modules/members/hooks";
import { getErrorMessage } from "@/api/types";
import { useAuth } from "@/auth/useAuth";
import { useDailySummary, useNutritionGoal, useSummaryTrend } from "../hooks";
import { NutritionGoalDialog } from "../components/NutritionGoalDialog";
import type { CalorieStatus } from "../types";

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

export function MemberNutritionPage() {
  const { memberId: memberIdParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTrainer = user?.role === "TRAINER";
  const memberId = Number(memberIdParam);

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const { data: member, isLoading: memberLoading, isError: memberError } = useMember(memberId);
  const { data: summary, isLoading: summaryLoading } = useDailySummary(memberId, todayIso());
  const { data: goal } = useNutritionGoal(memberId);
  const { data: trend } = useSummaryTrend(memberId, daysAgoIso(6), todayIso());

  if (memberLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (memberError || !member) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Un entrenador que abre a un socio que no tiene asignado recibe
            TRAINER_SCOPE_VIOLATION: vale mas mostrar ese motivo que un error generico. */}
        <Typography color="error">{getErrorMessage(memberError, "No se pudo cargar al socio.")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 1 }}>
        Regresar
      </Button>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        {member.person.full_name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Nutrición — Código: {member.member_code}
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Resumen de hoy
          </Typography>
          {isTrainer && (
            <Button size="small" onClick={() => setGoalDialogOpen(true)}>
              {goal ? "Ajustar meta" : "Definir meta"}
            </Button>
          )}
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

            {summary.calorie_status ? (
              <Chip
                label={`${CALORIE_STATUS_LABEL[summary.calorie_status]} (meta: ${summary.goal?.daily_calories} kcal)`}
                color={CALORIE_STATUS_COLOR[summary.calorie_status]}
                size="small"
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Este socio no tiene una meta calórica definida.
              </Typography>
            )}
          </>
        )}
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
