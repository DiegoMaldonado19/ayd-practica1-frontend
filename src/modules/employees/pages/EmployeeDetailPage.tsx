import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Stack,
  Menu,
  MenuItem,
} from "@mui/material";
import { ArrowBack, Edit, MoreVert } from "@mui/icons-material";
import { useEmployee, useUpdateEmployeeStatus } from "@/modules/employees/hooks";
import type { EmployeeStatus } from "@/modules/employees/types";
import { EmployeeStatusChip } from "@/modules/employees/components/EmployeeStatusChip";

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export function EmployeeDetailPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const { data: employee, isLoading, isError } = useEmployee(Number(employeeId));
  const updateStatus = useUpdateEmployeeStatus(Number(employeeId));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">No se pudo cargar el empleado.</Typography>
      </Box>
    );
  }

  const handleStatusChange = (newStatus: EmployeeStatus) => {
    updateStatus.mutate(newStatus);
    setAnchorEl(null);
  };

  const allStatuses: EmployeeStatus[] = ["ACTIVE", "SUSPENDED", "TERMINATED"];
  const availableStatuses = allStatuses.filter((status) => status !== employee.status);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 980, mx: "auto" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/employees")} sx={{ mb: 1 }}>
            Regresar al listado
          </Button>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {employee.person.full_name}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Revisa la información del empleado, actualiza sus datos o cambia su estado.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          {employee.trainer_id && (
            <Button variant="outlined" onClick={() => navigate(`/trainers/${employee.trainer_id}`)}>
              Ver perfil de entrenador
            </Button>
          )}
          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/employees/${employeeId}/edit`)}>
            Editar
          </Button>

          <Button
            variant="outlined"
            color={employee.status === "ACTIVE" ? "error" : "success"}
            disabled={updateStatus.isPending || availableStatuses.length === 0}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            endIcon={<MoreVert />}
          >
            Cambiar estado
          </Button>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            {availableStatuses.map((status) => (
              <MenuItem key={status} onClick={() => handleStatusChange(status)} disabled={updateStatus.isPending}>
                {status === "ACTIVE" && "Reincorporar"}
                {status === "SUSPENDED" && "Suspender"}
                {status === "TERMINATED" && "Dar de baja"}
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 3, overflow: "hidden" }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Datos del empleado
          </Typography>
          <EmployeeStatusChip status={employee.status} size="small" />
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Field label="Código de empleado" value={employee.employee_code} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Puesto" value={employee.position} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Fecha de contratación" value={employee.hired_on} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Documento" value={`${employee.person.document_type} ${employee.person.document_number}`} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Correo" value={employee.person.email} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Teléfono" value={employee.person.phone} />
          </Grid>
          <Grid item xs={12}>
            <Field label="Dirección" value={employee.person.address} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Fecha de nacimiento" value={employee.person.birth_date} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Género" value={employee.person.gender} />
          </Grid>
          {employee.terminated_on && (
            <Grid item xs={12} sm={4}>
              <Field label="Fecha de baja" value={employee.terminated_on} />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
}