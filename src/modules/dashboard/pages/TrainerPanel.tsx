import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { People, ReportProblem, FitnessCenter, Warning } from "@mui/icons-material";
import { useTrainerAlerts, useTrainerAssignments } from "@/modules/training/hooks";
import { StatTile } from "./components/StatTile";

export function TrainerPanel() {
  const { data: assignments, isLoading: loadingAssignments } = useTrainerAssignments({
    active: true,
    page: 0,
    size: 1,
  });
  const { data: alerts, isLoading: loadingAlerts } = useTrainerAlerts({
    status: "PENDING",
    page: 0,
    size: 1,
  });

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <StatTile
            label="Mis socios asignados"
            value={assignments?.page.total_elements ?? 0}
            loading={loadingAssignments}
            color="primary"
            icon={<People />}
            linkTo="/training/my-members"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatTile
            label="Mis alertas pendientes"
            value={alerts?.page.total_elements ?? 0}
            loading={loadingAlerts}
            color="warning"
            icon={<ReportProblem />}
            linkTo="/training/alerts"
          />
        </Grid>
      </Grid>

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
            startIcon={<People />}
            component={RouterLink}
            to="/training/my-members"
          >
            Mis socios
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
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
        <Grid item xs={12} sm={4}>
          <Button fullWidth variant="outlined" startIcon={<Warning />} component={RouterLink} to="/training/alerts">
            Alertas
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
