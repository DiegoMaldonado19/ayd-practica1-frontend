import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  People,
  Event,
  FitnessCenter,
  ReportProblem,
  Badge,
  CreditCard,
  DirectionsRun,
  Assessment,
} from "@mui/icons-material";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { TrendLineChart } from "@/components/TrendLineChart";
import { useMembers } from "@/modules/members/hooks";
import { useMemberships } from "@/modules/membership/hooks";
import { useTrainers } from "@/modules/trainers/hooks";
import { useTrainerAlerts } from "@/modules/training/hooks";
import { useReportRows } from "@/modules/reports/hooks";
import type { MemberDistributionRow, RevenueRow } from "@/modules/reports/types";
import { StatTile } from "./components/StatTile";

const currency = (value: number) =>
  value.toLocaleString("es-GT", { style: "currency", currency: "GTQ", maximumFractionDigits: 0 });

export function AdminPanel() {
  const { data: activeMembers, isLoading: loadingMembers } = useMembers({
    status: "ACTIVE",
    page: 0,
    size: 1,
  });
  const { data: expiring, isLoading: loadingExpiring } = useMemberships({
    expiring_in_days: 5,
    page: 0,
    size: 5,
  });
  const { data: trainers, isLoading: loadingTrainers } = useTrainers({ page: 0, size: 1 });
  const { data: alerts, isLoading: loadingAlerts } = useTrainerAlerts({
    status: "PENDING",
    page: 0,
    size: 1,
  });

  const revenueRange = useMemo(
    () => ({ from: dayjs().subtract(5, "month").startOf("month").format("YYYY-MM-DD"), to: dayjs().format("YYYY-MM-DD") }),
    [],
  );
  const { data: revenueRows } = useReportRows<RevenueRow>("revenue", {
    from: revenueRange.from,
    to: revenueRange.to,
    group_by: "MONTH",
  });
  const revenuePoints = useMemo(() => {
    const byPeriod = new Map<string, number>();
    for (const row of revenueRows ?? []) {
      byPeriod.set(row.period, (byPeriod.get(row.period) ?? 0) + row.net_amount);
    }
    return Array.from(byPeriod.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([period, value]) => ({ label: dayjs(period).format("MMM"), value }));
  }, [revenueRows]);

  const { data: distributionRows } = useReportRows<MemberDistributionRow>("member-distribution", {});
  const distributionBars = useMemo(() => {
    const byPlan = new Map<string, number>();
    for (const row of distributionRows ?? []) {
      if (row.status !== "ACTIVE") continue;
      byPlan.set(row.plan_name, (byPlan.get(row.plan_name) ?? 0) + row.member_count);
    }
    return Array.from(byPlan.entries()).map(([label, value]) => ({ label, value }));
  }, [distributionRows]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatTile
            label="Socios activos"
            value={activeMembers?.page.total_elements ?? 0}
            loading={loadingMembers}
            color="primary"
            icon={<People />}
            linkTo="/members"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatTile
            label="Membresías por vencer (5 días)"
            value={expiring?.page.total_elements ?? 0}
            loading={loadingExpiring}
            color="warning"
            icon={<Event />}
            linkTo="/memberships"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatTile
            label="Entrenadores"
            value={trainers?.page.total_elements ?? 0}
            loading={loadingTrainers}
            color="info"
            icon={<FitnessCenter />}
            linkTo="/trainers"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatTile
            label="Alertas pendientes"
            value={alerts?.page.total_elements ?? 0}
            loading={loadingAlerts}
            color="error"
            icon={<ReportProblem />}
            linkTo="/training/alerts"
          />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Próximas a vencer
        </Typography>
        {(expiring?.content ?? []).length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay membresías por vencer en los próximos 5 días.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {(expiring?.content ?? []).map((membership) => (
              <Stack key={membership.membership_id} direction="row" justifyContent="space-between">
                <Typography variant="body2">Socio #{membership.member_id}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Vence el {membership.end_date} · {membership.days_remaining} día(s)
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Ingresos netos (últimos 6 meses)
            </Typography>
            <TrendLineChart points={revenuePoints} valueFormatter={currency} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Socios activos por plan
            </Typography>
            <SimpleBarChart bars={distributionBars} />
          </Paper>
        </Grid>
      </Grid>

      <Divider textAlign="left" sx={{ mt: 4, mb: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Accesos rápidos
        </Typography>
      </Divider>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Button fullWidth variant="contained" startIcon={<People />} component={RouterLink} to="/members/new">
            Nuevo socio
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button fullWidth variant="outlined" startIcon={<Badge />} component={RouterLink} to="/employees/new">
            Nuevo empleado
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DirectionsRun />}
            component={RouterLink}
            to="/training/assignments"
          >
            Asignar entrenador
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<CreditCard />}
            component={RouterLink}
            to="/membership-plans"
          >
            Planes de membresía
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FitnessCenter />}
            component={RouterLink}
            to="/training/exercises"
          >
            Catálogo de ejercicios
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button fullWidth variant="outlined" startIcon={<Assessment />} component={RouterLink} to="/reports">
            Ver reportes
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
