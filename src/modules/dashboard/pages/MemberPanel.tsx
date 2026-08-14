import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FitnessCenter, Restaurant, Security } from "@mui/icons-material";
import { TrendLineChart } from "@/components/TrendLineChart";
import { useAuth } from "@/auth/useAuth";
import { useMemberMembershipHistory } from "@/modules/membership/hooks";
import { useDailySummary, useSummaryTrend } from "@/modules/nutrition/hooks";
import { useMemberMeasurements, useRoutines } from "@/modules/training/hooks";
import { MeasurementChart } from "@/modules/training/components/MeasurementChart";
import type { MembershipStatus } from "@/modules/membership/types";

const MEMBERSHIP_STATUS_LABEL: Record<MembershipStatus, string> = {
  ACTIVE: "Activa",
  FROZEN: "Congelada",
  EXPIRED: "Vencida",
  CANCELLED: "Cancelada",
};

const MEMBERSHIP_STATUS_COLOR: Record<MembershipStatus, "success" | "warning" | "error" | "default"> = {
  ACTIVE: "success",
  FROZEN: "warning",
  EXPIRED: "error",
  CANCELLED: "default",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MemberPanel() {
  const { user } = useAuth();
  const memberId = user?.member_id ?? undefined;

  const { data: history, isLoading: loadingMembership } = useMemberMembershipHistory(memberId);
  const { data: routines, isLoading: loadingRoutines } = useRoutines({ page: 0, size: 20 });
  const { data: summary, isLoading: loadingSummary } = useDailySummary(memberId, todayIso());
  const { data: measurements } = useMemberMeasurements(memberId);

  const weekAgo = useMemo(() => dayjs().subtract(6, "day").format("YYYY-MM-DD"), []);
  const { data: nutritionTrend } = useSummaryTrend(memberId, weekAgo, todayIso());
  const caloriePoints = useMemo(
    () => (nutritionTrend ?? []).map((day) => ({ label: dayjs(day.date).format("DD/MM"), value: day.totals.calories })),
    [nutritionTrend],
  );

  const currentMembership =
    history?.content.find((m) => m.status === "ACTIVE" || m.status === "FROZEN") ?? history?.content[0];
  const currentRoutine =
    (routines?.content ?? []).find((r) => r.status === "PUBLISHED") ?? (routines?.content ?? [])[0];

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Mi membresía
            </Typography>
            {loadingMembership ? (
              <CircularProgress size={20} />
            ) : currentMembership ? (
              <Stack spacing={1}>
                <Chip
                  size="small"
                  label={MEMBERSHIP_STATUS_LABEL[currentMembership.status]}
                  color={MEMBERSHIP_STATUS_COLOR[currentMembership.status]}
                  sx={{ alignSelf: "flex-start" }}
                />
                <Typography variant="body2">{currentMembership.plan.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentMembership.days_remaining} día(s) restantes
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No tienes un contrato registrado todavía.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Mi rutina
            </Typography>
            {loadingRoutines ? (
              <CircularProgress size={20} />
            ) : currentRoutine ? (
              <Stack spacing={1}>
                <Typography variant="body2">{currentRoutine.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentRoutine.days.length} día(s) de entrenamiento
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Aún no tienes una rutina registrada.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Mi nutrición hoy
            </Typography>
            {!memberId ? (
              <Typography variant="body2" color="text.secondary">
                Esta información aparecerá cuando tengas actividad registrada.
              </Typography>
            ) : loadingSummary ? (
              <CircularProgress size={20} />
            ) : summary ? (
              <Stack spacing={1}>
                <Typography variant="body2">{summary.totals.calories} kcal consumidas</Typography>
                <Typography variant="body2" color="text.secondary">
                  {(summary.by_meal_time ?? []).length} comida(s) registrada(s)
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No has registrado comidas hoy.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {memberId && (
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Mi peso
              </Typography>
              <MeasurementChart measurements={measurements ?? []} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Calorías (últimos 7 días)
              </Typography>
              <TrendLineChart points={caloriePoints} valueFormatter={(v) => `${v} kcal`} />
            </Paper>
          </Grid>
        </Grid>
      )}

      <Divider textAlign="left" sx={{ mt: 4, mb: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Accesos rápidos
        </Typography>
      </Divider>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<FitnessCenter />}
            component={RouterLink}
            to="/training/me"
          >
            Ver mi entrenamiento
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Restaurant />}
            component={RouterLink}
            to="/nutrition/me"
          >
            Ver mi nutrición
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Security />}
            component={RouterLink}
            to="/account/security"
          >
            Seguridad de mi cuenta
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
