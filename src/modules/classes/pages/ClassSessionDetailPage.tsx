import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useClassSession, useClassSessionEnrollments, useClassSessionWaitlist, useEnrollMemberInClassSession, useJoinWaitlist } from "@/modules/classes/hooks";
import { useMembers } from "@/modules/members/hooks";
import { ClassInfoField } from "@/modules/classes/components/ClassInfoField";
import { enrollmentStatusLabels } from "@/modules/classes/components/classLabels";

function getMemberDisplayName(memberId: number, memberMap: Map<number, { person: { full_name: string; document_number: string } }>) {
  const member = memberMap.get(memberId);
  if (!member) {
    return `Socio #${memberId}`;
  }

  return `${member.person.full_name} (${member.person.document_number})`;
}

export function ClassSessionDetailPage() {
  const navigate = useNavigate();
  const { classId, sessionId } = useParams();
  const sessionNumber = Number(sessionId);
  const { data: session, isLoading, isError } = useClassSession(sessionNumber);
  const { data: enrollments } = useClassSessionEnrollments(sessionNumber);
  const { data: waitlist } = useClassSessionWaitlist(sessionNumber);
  const enrollMutation = useEnrollMemberInClassSession(sessionNumber);
  const waitlistMutation = useJoinWaitlist(sessionNumber);
  const [memberId, setMemberId] = useState<number | "">("");
  const { data: membersData } = useMembers({ page: 0, size: 500, status: "ACTIVE" });

  const memberMap = useMemo(
    () => new Map((membersData?.content ?? []).map((member) => [member.member_id, member])),
    [membersData]
  );
  const memberOptions = useMemo(() => membersData?.content ?? [], [membersData]);
  const enrolledMemberIds = useMemo(
    () => new Set((enrollments?.content ?? []).filter((entry) => entry.status !== "CANCELLED").map((entry) => entry.member_id)),
    [enrollments]
  );
  const waitlistedMemberIds = useMemo(
    () => new Set((waitlist?.content ?? []).filter((entry) => entry.status !== "CANCELLED").map((entry) => entry.member_id)),
    [waitlist]
  );
  const selectedMember = memberId !== "" ? Number(memberId) : null;
  const selectedMemberAlreadyEnrolled = selectedMember !== null && enrolledMemberIds.has(selectedMember);
  const selectedMemberAlreadyWaitlisted = selectedMember !== null && waitlistedMemberIds.has(selectedMember);
  const memberValidationMessage =
    selectedMember === null
      ? "Debes seleccionar un socio."
      : selectedMemberAlreadyEnrolled
        ? "Este socio ya está inscrito en esta sesión."
        : selectedMemberAlreadyWaitlisted
          ? "Este socio ya está en la lista de espera de esta sesión."
          : "";

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !session) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">No se pudo cargar la sesión.</Typography>
      </Box>
    );
  }

  const handleEnroll = () => {
    if (!memberId || Number(memberId) <= 0) return;
    if (selectedMemberAlreadyEnrolled || selectedMemberAlreadyWaitlisted) return;
    enrollMutation.mutate({ member_id: Number(memberId) });
  };

  const handleWaitlist = () => {
    if (!memberId || Number(memberId) <= 0) return;
    if (selectedMemberAlreadyEnrolled || selectedMemberAlreadyWaitlisted) return;
    waitlistMutation.mutate({ member_id: Number(memberId) });
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/classes/${classId}`)} sx={{ mb: 2 }}>
        Volver a la clase
      </Button>

      <Typography variant="h4" sx={{ mb: 1 }}>
        Sesión {session.date}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Esta es una fecha concreta de la clase. Los socios se inscriben por sesión, no por la clase base.
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <ClassInfoField label="Clase" value={session.group_class_name ?? session.name ?? `Clase #${session.group_class_id}`} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ClassInfoField label="Disciplina" value={session.discipline ?? "-"} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ClassInfoField label="Horario" value={session.start_time ?? "-"} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ClassInfoField label="Cupo" value={`${session.seats_available ?? 0} disponibles`} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ClassInfoField label="Estado" value={session.status ?? "-"} />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Acciones de la sesión
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: "rgba(0,0,0,0.015)" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
            <TextField
              select
              label="Socio"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value === "" ? "" : Number(e.target.value))}
              sx={{ minWidth: 260, flex: 1 }}
              error={!!memberValidationMessage}
              helperText={memberValidationMessage || "Seleccione un socio para inscribirlo o ponerlo en espera."}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              {memberOptions.map((member) => (
                <MenuItem key={member.member_id} value={member.member_id}>
                  {member.person.full_name} ({member.person.document_number})
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              onClick={handleEnroll}
              disabled={!memberId || Boolean(memberValidationMessage) || enrollMutation.isPending}
            >
              {enrollMutation.isPending ? "Inscribiendo..." : "Inscribir a la sesión"}
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={handleWaitlist}
              disabled={!memberId || Boolean(memberValidationMessage) || waitlistMutation.isPending}
            >
              {waitlistMutation.isPending ? "Agregando..." : "Agregar a lista de espera"}
            </Button>
          </Stack>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Inscritos
            </Typography>
            <Stack spacing={1}>
              {(enrollments?.content ?? []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">No hay socios inscritos en esta sesión.</Typography>
              ) : (
                (enrollments?.content ?? []).map((entry) => (
                  <Paper key={entry.class_enrollment_id} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {getMemberDisplayName(entry.member_id, memberMap)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Estado: {enrollmentStatusLabels[entry.status ?? ""] ?? entry.status ?? "-"}
                    </Typography>
                  </Paper>
                ))
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Lista de espera
            </Typography>
            <Stack spacing={1}>
              {(waitlist?.content ?? []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">No hay personas en espera para esta sesión.</Typography>
              ) : (
                (waitlist?.content ?? []).map((entry) => (
                  <Paper key={entry.waitlist_entry_id} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {getMemberDisplayName(entry.member_id, memberMap)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Estado: {enrollmentStatusLabels[entry.status ?? ""] ?? entry.status ?? "En espera"}
                    </Typography>
                  </Paper>
                ))
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
