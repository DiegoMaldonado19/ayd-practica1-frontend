import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";
//import ArrowBackIcon from "@mui/icons-material/ArrowBack";
//import EditIcon from "@mui/icons-material/Edit";
import { useMember, useUpdateMemberStatus } from "@/modules/members/hooks";
import type { MemberStatus } from "@/modules/members/types";

const statusLabel: Record<MemberStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  WITHDRAWN: "Retirado",
};

const statusColor: Record<MemberStatus, "success" | "default" | "error"> = {
  ACTIVE: "success",
  INACTIVE: "default",
  WITHDRAWN: "error",
};

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

export function MemberDetailPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { data: member, isLoading, isError } = useMember(Number(memberId));
  const updateStatus = useUpdateMemberStatus(Number(memberId));

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !member) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">No se pudo cargar el socio.</Typography>
      </Box>
    );
  }

  const nextStatus: MemberStatus =
    member.status === "ACTIVE" ? "WITHDRAWN" : "ACTIVE";

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
        maxWidth: 980,
        mx: "auto",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {member.person.full_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revisa la información del socio, actualiza sus datos o cambia su estado.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
<Button
  variant="outlined"
  onClick={() => navigate("/members")}
>
  Regresar al listado
</Button>
<Button
  variant="outlined"
  onClick={() => navigate(`/members/${memberId}/edit`)}
>
  Editar
</Button>
          <Button
            variant="outlined"
            color={member.status === "ACTIVE" ? "error" : "success"}
            disabled={updateStatus.isPending}
            onClick={() => updateStatus.mutate(nextStatus)}
          >
            {member.status === "ACTIVE" ? "Dar de baja" : "Reactivar"}
          </Button>
        </Stack>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Datos personales
          </Typography>
          <Chip
            label={statusLabel[member.status]}
            color={statusColor[member.status]}
            size="small"
          />
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Field label="Código de socio" value={member.member_code} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field
              label="Documento"
              value={`${member.person.document_type} ${member.person.document_number}`}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Fecha de ingreso" value={member.joined_on} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Correo" value={member.person.email} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Teléfono" value={member.person.phone} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Fecha de nacimiento" value={member.person.birth_date} />
          </Grid>
          <Grid item xs={12}>
            <Field label="Dirección" value={member.person.address} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Contacto de emergencia
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Field label="Nombre" value={member.emergency_contact_name} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field label="Teléfono" value={member.emergency_contact_phone} />
          </Grid>
        </Grid>

        {member.notes && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Notas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {member.notes}
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
}