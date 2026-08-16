import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useAuth } from "@/auth/useAuth";
import {
  useCancelClassSession,
  useCancelEnrollment,
  useCancelWaitlistEntry,
  useClassSession,
  useClassSessionEnrollments,
  useClassSessionWaitlist,
  useConfirmWaitlistEntry,
  useEnrollMemberInClassSession,
  useJoinWaitlist,
  useMarkAttendance,
  useMemberEnrollments,
  useMemberWaitlistEntries,
  useUpdateClassSessionStatus,
} from "@/modules/classes/hooks";
import { useMembers } from "@/modules/members/hooks";
import { ClassInfoField } from "@/modules/classes/components/ClassInfoField";
import {
  disciplineLabel,
  enrollmentStatusLabels,
  sessionStatusLabel,
} from "@/modules/classes/components/classLabels";
import type { EnrollmentStatus } from "@/modules/classes/types";

type AttendanceMark = Extract<EnrollmentStatus, "ATTENDED" | "ABSENT">;

function getMemberDisplayName(
  memberId: number,
  memberMap: Map<number, { person: { full_name: string; document_number: string } }>,
) {
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

  const { user } = useAuth();
  const isMember = user?.role === "MEMBER";
  const isAdmin = user?.role === "ADMIN";
  const isTrainer = user?.role === "TRAINER";
  // POST .../enrollments y .../waitlist-entries excluyen a TRAINER.
  const canEnrollOthers = isAdmin || user?.role === "RECEPTIONIST";
  const canReadRoster = !isMember;
  const canMarkAttendance = isAdmin || isTrainer;
  const ownMemberId = user?.member_id ?? undefined;

  const { data: session, isLoading, isError } = useClassSession(sessionNumber);

  // markAttendance responde SESSION_NOT_OPEN mientras la sesión siga SCHEDULED.
  const attendanceIsOpen =
    canMarkAttendance && (session?.status === "IN_PROGRESS" || session?.status === "COMPLETED");
  const { data: enrollments } = useClassSessionEnrollments(sessionNumber, canReadRoster);
  const { data: waitlist } = useClassSessionWaitlist(sessionNumber, canReadRoster);

  // GET /members es 403 para un socio, así que la lista solo se pide cuando se usa.
  const { data: membersData } = useMembers({ page: 0, size: 500, status: "ACTIVE" }, canReadRoster);

  const { data: myEnrollments } = useMemberEnrollments(
    isMember ? ownMemberId : undefined,
    session ? { from: session.session_date, to: session.session_date } : {},
  );
  const { data: myWaitlist } = useMemberWaitlistEntries(isMember ? ownMemberId : undefined);

  const enrollMutation = useEnrollMemberInClassSession(sessionNumber);
  const waitlistMutation = useJoinWaitlist(sessionNumber);
  const cancelEnrollment = useCancelEnrollment();
  const cancelWaitlist = useCancelWaitlistEntry();
  const confirmWaitlist = useConfirmWaitlistEntry();
  const markAttendance = useMarkAttendance(sessionNumber);
  const changeStatus = useUpdateClassSessionStatus(sessionNumber);
  const cancelSession = useCancelClassSession(sessionNumber);

  const [memberId, setMemberId] = useState<number | "">("");
  const [attendance, setAttendance] = useState<Record<number, AttendanceMark>>({});
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const memberMap = useMemo(
    () => new Map((membersData?.content ?? []).map((member) => [member.member_id, member])),
    [membersData],
  );
  const memberOptions = useMemo(() => membersData?.content ?? [], [membersData]);

  const activeEnrollments = useMemo(
    () => (enrollments?.content ?? []).filter((entry) => entry.status !== "CANCELLED"),
    [enrollments],
  );
  const pendingWaitlist = useMemo(
    () => (waitlist?.content ?? []).filter((entry) => entry.status !== "CANCELLED"),
    [waitlist],
  );

  const enrolledMemberIds = useMemo(
    () => new Set(activeEnrollments.map((entry) => entry.member_id)),
    [activeEnrollments],
  );
  const waitlistedMemberIds = useMemo(
    () => new Set(pendingWaitlist.map((entry) => entry.member_id)),
    [pendingWaitlist],
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

  // Lo que el socio tiene en ESTA sesión, resuelto por sus dos rutas self-scoped.
  const myEnrollment = useMemo(
    () =>
      (myEnrollments?.content ?? []).find(
        (entry) => entry.class_session_id === sessionNumber && entry.status === "ENROLLED",
      ),
    [myEnrollments, sessionNumber],
  );
  const myWaitlistEntry = useMemo(
    () => (myWaitlist ?? []).find((entry) => entry.class_session_id === sessionNumber),
    [myWaitlist, sessionNumber],
  );
  const mySeatIsReserved =
    myWaitlistEntry?.status === "NOTIFIED" &&
    Boolean(myWaitlistEntry.confirmation_deadline) &&
    new Date(myWaitlistEntry.confirmation_deadline as string) > new Date();

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

  const seatsAvailable = session.seats_available ?? 0;
  const isOpenForChanges = session.status !== "CANCELLED" && session.status !== "COMPLETED";

  const handleEnroll = () => {
    if (!memberId || Number(memberId) <= 0) return;
    if (selectedMemberAlreadyEnrolled || selectedMemberAlreadyWaitlisted) return;
    enrollMutation.mutate({ member_id: Number(memberId), channel: "FRONT_DESK" });
  };

  const handleWaitlist = () => {
    if (!memberId || Number(memberId) <= 0) return;
    if (selectedMemberAlreadyEnrolled || selectedMemberAlreadyWaitlisted) return;
    waitlistMutation.mutate({ member_id: Number(memberId) });
  };

  const handleSaveAttendance = () => {
    const attendances = activeEnrollments
      .map((entry) => ({
        enrollment_id: entry.class_enrollment_id,
        status: attendance[entry.class_enrollment_id],
      }))
      .filter((mark): mark is { enrollment_id: number; status: AttendanceMark } => Boolean(mark.status));

    if (attendances.length === 0) return;
    markAttendance.mutate({ attendances });
  };

  const handleCancelSession = () => {
    if (!cancelReason.trim()) return;
    cancelSession.mutate(
      { cancellation_reason: cancelReason.trim() },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          setCancelReason("");
        },
      },
    );
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/classes/${classId}`)} sx={{ mb: 2 }}>
        Volver a la clase
      </Button>

      <Typography variant="h4" sx={{ mb: 1 }}>
        Sesión {session.session_date}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Esta es una fecha concreta de la clase. Los socios se inscriben por sesión, no por la clase base.
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <ClassInfoField
              label="Clase"
              value={session.group_class_name ?? `Clase #${session.group_class_id}`}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ClassInfoField
              label="Disciplina"
              value={session.discipline ? disciplineLabel[session.discipline] ?? session.discipline : "—"}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ClassInfoField
              label="Horario"
              value={
                session.duration_minutes
                  ? `${session.start_time} · ${session.duration_minutes} min`
                  : session.start_time
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ClassInfoField label="Cupo" value={`${seatsAvailable} de ${session.max_capacity ?? 0} disponibles`} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ClassInfoField
              label="Estado"
              value={session.status ? sessionStatusLabel[session.status] ?? session.status : "—"}
            />
          </Grid>
          {session.cancellation_reason && (
            <Grid item xs={12} sm={4}>
              <ClassInfoField label="Motivo de cancelación" value={session.cancellation_reason} />
            </Grid>
          )}
        </Grid>
      </Paper>

      {isMember && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Mi inscripción
          </Typography>

          {!ownMemberId ? (
            <Alert severity="info">
              Tu cuenta aún no está vinculada a un expediente de socio. Acércate a recepción.
            </Alert>
          ) : !isOpenForChanges ? (
            <Alert severity="info">Esta sesión ya no admite cambios.</Alert>
          ) : myEnrollment ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <Chip color="success" label="Estás inscrito en esta sesión" />
              <Button
                variant="outlined"
                color="error"
                onClick={() => cancelEnrollment.mutate(myEnrollment.class_enrollment_id)}
                disabled={cancelEnrollment.isPending}
              >
                {cancelEnrollment.isPending ? "Cancelando..." : "Cancelar mi inscripción"}
              </Button>
            </Stack>
          ) : myWaitlistEntry && myWaitlistEntry.status !== "EXPIRED" ? (
            <Stack spacing={2}>
              <Box>
                <Chip
                  color={mySeatIsReserved ? "warning" : "default"}
                  label={
                    mySeatIsReserved
                      ? "Se liberó un cupo: confirma antes de que venza"
                      : "Estás en la lista de espera"
                  }
                />
                {mySeatIsReserved && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    Vence: {new Date(myWaitlistEntry.confirmation_deadline as string).toLocaleString()}
                  </Typography>
                )}
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {mySeatIsReserved && (
                  <Button
                    variant="contained"
                    onClick={() => confirmWaitlist.mutate(myWaitlistEntry.waitlist_entry_id)}
                    disabled={confirmWaitlist.isPending}
                  >
                    {confirmWaitlist.isPending ? "Confirmando..." : "Confirmar mi lugar"}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => cancelWaitlist.mutate(myWaitlistEntry.waitlist_entry_id)}
                  disabled={cancelWaitlist.isPending}
                >
                  {cancelWaitlist.isPending ? "Saliendo..." : "Abandonar la lista de espera"}
                </Button>
              </Stack>
            </Stack>
          ) : seatsAvailable > 0 ? (
            <Button
              variant="contained"
              onClick={() => enrollMutation.mutate({ member_id: ownMemberId, channel: "SELF_SERVICE" })}
              disabled={enrollMutation.isPending}
            >
              {enrollMutation.isPending ? "Inscribiendo..." : "Inscribirme"}
            </Button>
          ) : (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                La sesión está llena. Puedes unirte a la lista de espera y te avisamos si se libera un cupo.
              </Typography>
              <Button
                variant="outlined"
                color="warning"
                sx={{ alignSelf: "flex-start" }}
                onClick={() => waitlistMutation.mutate({ member_id: ownMemberId })}
                disabled={waitlistMutation.isPending}
              >
                {waitlistMutation.isPending ? "Agregando..." : "Unirme a la lista de espera"}
              </Button>
            </Stack>
          )}
        </Paper>
      )}

      {canReadRoster && (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Acciones de la sesión
          </Typography>

          {canEnrollOthers && isOpenForChanges && (
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
          )}

          {(canMarkAttendance || isAdmin) && isOpenForChanges && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
              {canMarkAttendance && session.status === "SCHEDULED" && (
                <Button variant="outlined" onClick={() => changeStatus.mutate({ status: "IN_PROGRESS" })}>
                  Iniciar clase
                </Button>
              )}
              {canMarkAttendance && session.status === "IN_PROGRESS" && (
                <Button variant="outlined" onClick={() => changeStatus.mutate({ status: "COMPLETED" })}>
                  Cerrar clase
                </Button>
              )}
              {isAdmin && (
                <Button variant="outlined" color="error" onClick={() => setCancelDialogOpen(true)}>
                  Cancelar sesión
                </Button>
              )}
            </Stack>
          )}

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6">Inscritos</Typography>
                {attendanceIsOpen && activeEnrollments.length > 0 && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSaveAttendance}
                    disabled={Object.keys(attendance).length === 0 || markAttendance.isPending}
                  >
                    {markAttendance.isPending ? "Guardando..." : "Guardar asistencia"}
                  </Button>
                )}
              </Stack>
              <Stack spacing={1}>
                {activeEnrollments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No hay socios inscritos en esta sesión.
                  </Typography>
                ) : (
                  activeEnrollments.map((entry) => (
                    <Paper key={entry.class_enrollment_id} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ sm: "center" }}
                        spacing={1}
                      >
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {getMemberDisplayName(entry.member_id, memberMap)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Estado: {enrollmentStatusLabels[entry.status ?? ""] ?? entry.status ?? "-"}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {attendanceIsOpen && (
                            <ToggleButtonGroup
                              size="small"
                              exclusive
                              value={attendance[entry.class_enrollment_id] ?? entry.status ?? null}
                              onChange={(_, value: AttendanceMark | null) =>
                                value &&
                                setAttendance((current) => ({ ...current, [entry.class_enrollment_id]: value }))
                              }
                            >
                              <ToggleButton value="ATTENDED">Asistió</ToggleButton>
                              <ToggleButton value="ABSENT">Ausente</ToggleButton>
                            </ToggleButtonGroup>
                          )}
                          {canEnrollOthers && isOpenForChanges && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => cancelEnrollment.mutate(entry.class_enrollment_id)}
                              disabled={cancelEnrollment.isPending}
                            >
                              Cancelar
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  ))
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Lista de espera
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Ordenada por prioridad de plan: Élite antes que Premium, y luego por hora de solicitud.
              </Typography>
              <Stack spacing={1}>
                {pendingWaitlist.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No hay personas en espera para esta sesión.
                  </Typography>
                ) : (
                  pendingWaitlist.map((entry, index) => (
                    <Paper key={entry.waitlist_entry_id} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ sm: "center" }}
                        spacing={1}
                      >
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {index + 1}. {getMemberDisplayName(entry.member_id, memberMap)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Estado: {enrollmentStatusLabels[entry.status ?? ""] ?? entry.status ?? "En espera"}
                          </Typography>
                        </Box>
                        {canEnrollOthers && isOpenForChanges && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => cancelWaitlist.mutate(entry.waitlist_entry_id)}
                            disabled={cancelWaitlist.isPending}
                          >
                            Quitar
                          </Button>
                        )}
                      </Stack>
                    </Paper>
                  ))
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cancelar sesión del {session.session_date}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Se notificará a todos los socios inscritos.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            label="Motivo de la cancelación"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            inputProps={{ maxLength: 200 }}
            helperText={`${cancelReason.length}/200 · obligatorio`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Volver</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelSession}
            disabled={!cancelReason.trim() || cancelSession.isPending}
          >
            {cancelSession.isPending ? "Cancelando..." : "Cancelar sesión"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
