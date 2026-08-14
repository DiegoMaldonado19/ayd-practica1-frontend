import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { PeopleAlt, Event, HowToReg, PersonAdd, CreditCard } from "@mui/icons-material";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { useMemberships } from "@/modules/membership/hooks";
import { useGuestPasses, useVisits } from "../hooks";
import { StatTile } from "./components/StatTile";

const WEEKDAY_LABEL = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ReceptionistPanel() {
  const { data: openVisits, isLoading: loadingVisits } = useVisits({
    open: true,
    page: 0,
    size: 1,
  });
  const { data: expiring, isLoading: loadingExpiring } = useMemberships({
    expiring_in_days: 5,
    page: 0,
    size: 1,
  });
  const today = todayIso();
  const { data: guestPasses, isLoading: loadingGuestPasses } = useGuestPasses({
    from: today,
    to: today,
    page: 0,
    size: 1,
  });

  const weekRange = useMemo(
    () => ({ from: dayjs().subtract(6, "day").format("YYYY-MM-DD"), to: today }),
    [today],
  );
  const { data: weekVisits } = useVisits({ ...weekRange, page: 0, size: 500 });
  const visitsByDay = useMemo(() => {
    const counts = new Map<string, number>();
    for (const visit of weekVisits?.content ?? []) {
      const day = dayjs(visit.checked_in_at).format("YYYY-MM-DD");
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return Array.from({ length: 7 }, (_, i) => {
      const day = dayjs(weekRange.from).add(i, "day");
      return { label: WEEKDAY_LABEL[day.day()], value: counts.get(day.format("YYYY-MM-DD")) ?? 0 };
    });
  }, [weekVisits, weekRange]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <StatTile
            label="Quién está dentro"
            value={openVisits?.page.total_elements ?? 0}
            loading={loadingVisits}
            color="primary"
            icon={<PeopleAlt />}
            linkTo="/access/visits"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatTile
            label="Membresías por vencer (5 días)"
            value={expiring?.page.total_elements ?? 0}
            loading={loadingExpiring}
            color="warning"
            icon={<Event />}
            linkTo="/memberships"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatTile
            label="Pases de invitado hoy"
            value={guestPasses?.page.total_elements ?? 0}
            loading={loadingGuestPasses}
            color="info"
            icon={<HowToReg />}
            linkTo="/access/guest-passes"
          />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Visitas de los últimos 7 días
        </Typography>
        <SimpleBarChart bars={visitsByDay} />
      </Paper>

      <Divider textAlign="left" sx={{ mt: 4, mb: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Accesos rápidos
        </Typography>
      </Divider>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Button fullWidth variant="contained" startIcon={<PeopleAlt />} component={RouterLink} to="/access/visits">
            Check-in / check-out
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<HowToReg />}
            component={RouterLink}
            to="/access/guest-passes"
          >
            Registrar pase de invitado
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button fullWidth variant="outlined" startIcon={<PersonAdd />} component={RouterLink} to="/members/new">
            Nuevo socio
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button fullWidth variant="outlined" startIcon={<CreditCard />} component={RouterLink} to="/memberships">
            Ver membresías
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
