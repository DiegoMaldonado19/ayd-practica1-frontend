import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBack, Edit, MoreVert } from "@mui/icons-material";
import { useAuth } from "@/auth/useAuth";
import { useMember, useUpdateMemberStatus } from "@/modules/members/hooks";
import type { MemberStatus } from "@/modules/members/types";
import { MemberStatusChip } from "@/modules/members/components/MemberStatusChip";
import { MemberMembershipCard } from "@/modules/members/components/MemberMembershipCard";
import {
  MemberPersonalData,
  MemberEmergencyContact,
} from "@/modules/members/components/MemberDetailsSections";

export function MemberDetailPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { user } = useAuth();
  // El alta, la edición y PATCH /members/{id}/status son exclusivos de ADMIN; el
  // recepcionista llega a esta pantalla pero solo la consulta.
  const isAdmin = user?.role === "ADMIN";
  const { data: member, isLoading, isError } = useMember(Number(memberId));
  const updateStatus = useUpdateMemberStatus(Number(memberId));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
        <Button onClick={() => navigate("/members")} sx={{ mt: 2 }}>
          Volver a socios
        </Button>
      </Box>
    );
  }

  const handleStatusChange = (newStatus: MemberStatus) => {
    updateStatus.mutate(newStatus);
    setAnchorEl(null);
  };

  const allStatuses: MemberStatus[] = ["ACTIVE", "INACTIVE", "WITHDRAWN"];
  const availableStatuses = allStatuses.filter((status) => status !== member.status);

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
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/members")} sx={{ mb: 1 }}>
            Regresar al listado
          </Button>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {member.person.full_name}
            </Typography>
            <MemberStatusChip status={member.status} size="medium" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Revisa la información del socio, actualiza sus datos o cambia su estado.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          {isAdmin && (
            <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/members/${memberId}/edit`)}>
              Editar
            </Button>
          )}

          {isAdmin && (
            <>
              <Button
                variant="outlined"
                color={member.status === "ACTIVE" ? "error" : "success"}
                disabled={updateStatus.isPending || availableStatuses.length === 0}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                endIcon={<MoreVert />}
              >
                Cambiar estado
              </Button>

              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                {availableStatuses.map((status) => (
                  <MenuItem key={status} onClick={() => handleStatusChange(status)} disabled={updateStatus.isPending}>
                    {status === "ACTIVE" && "Reactivar"}
                    {status === "INACTIVE" && "Suspender"}
                    {status === "WITHDRAWN" && "Dar de baja"}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Stack>
      </Stack>

      <MemberMembershipCard memberId={member.member_id} />

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Datos personales
        </Typography>
        <MemberPersonalData member={member} />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Contacto de emergencia
        </Typography>
        <MemberEmergencyContact member={member} />

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