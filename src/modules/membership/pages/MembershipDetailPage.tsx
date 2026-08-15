import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useAuth } from "@/auth/useAuth";
import { hasAnyRole } from "@/auth/permissions";
import { useMember } from "@/modules/members/hooks";
import {
  useCancelMembership,
  useChangeMembershipPlan,
  useFreezeMembership,
  useMembership,
  useMembershipFreezes,
  useMembershipPlans,
  useReactivateMembership,
  useRenewMembership,
  useMemberMembershipHistory,
} from "@/modules/membership/hooks";
import {
  cancellationReasonLabel,
  freezeReasonLabel,
  membershipStatusColor,
  membershipStatusLabel,
} from "@/modules/membership/labels";
import type {
  CancellationReason,
  FreezeReason,
} from "@/modules/membership/types";
import { AppDatePicker } from "@/components/AppDatePicker";

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysBetween(from: string, to: string): number {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5 }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  confirmColor = "primary",
  pending,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  confirmColor?: "primary" | "error";
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={pending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          disabled={pending}
          onClick={onConfirm}
        >
          {pending ? "Procesando..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function FreezeDialog({
  open,
  onClose,
  membershipId,
}: {
  open: boolean;
  onClose: () => void;
  membershipId: number;
}) {
  const freeze = useFreezeMembership(membershipId);
  const { data: summary } = useMembershipFreezes(membershipId);
  const [reason, setReason] = useState<FreezeReason | "">("");
  const [detail, setDetail] = useState("");
  const [expectedEnd, setExpectedEnd] = useState("");
  const [touched, setTouched] = useState({ reason: false, end: false });

  const today = todayISO();

  const reasonError = touched.reason && !reason ? "Selecciona el motivo" : "";
  const endError =
    touched.end && expectedEnd && expectedEnd < today
      ? "La fecha estimada no puede ser anterior a hoy"
      : "";

  const projectedDays = expectedEnd ? daysBetween(today, expectedEnd) : 0;

  // Un solo congelamiento nunca puede superar el tope de dias del ciclo.
  // El acumulado con congelamientos anteriores lo valida el backend
  // (FREEZE_LIMIT_REACHED) y el hook ya muestra el mensaje correcto.
  const projectedTooLong = summary
    ? projectedDays > summary.max_days_per_cycle
    : false;

  const countOver =
    !!summary &&
    (summary.freezes_used_in_cycle ?? 0) >= summary.max_count_per_cycle;

  const canSubmit =
    !!reason && !reasonError && !endError && !countOver && !projectedTooLong;

  const submit = () => {
    setTouched({ reason: true, end: true });
    if (!canSubmit) return;
    freeze.mutate(
      {
        reason: reason as FreezeReason,
        reason_detail: detail || undefined,
        expected_end_date: expectedEnd || null,
      },
      {
        onSuccess: () => {
          setReason("");
          setDetail("");
          setExpectedEnd("");
          setTouched({ reason: false, end: false });
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Congelar membresía</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {summary && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                size="small"
                color={countOver ? "error" : "default"}
                label={`${summary.freezes_used_in_cycle} de ${summary.max_count_per_cycle} congelamientos en el ciclo`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`Máx. ${summary.max_days_per_cycle} días por ciclo de ${summary.cycle_days} días`}
              />
            </Box>
          )}
          {countOver && (
            <Typography variant="body2" color="error">
              Ya se alcanzó el límite de congelamientos de este ciclo.
            </Typography>
          )}
          <TextField
            select
            label="Motivo"
            value={reason}
            onChange={(e) => setReason(e.target.value as FreezeReason | "")}
            onBlur={() => setTouched((t) => ({ ...t, reason: true }))}
            fullWidth
            error={!!reasonError}
            helperText={reasonError}
          >
            {(Object.keys(freezeReasonLabel) as FreezeReason[]).map((r) => (
              <MenuItem key={r} value={r}>
                {freezeReasonLabel[r]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Detalle del motivo"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <AppDatePicker
            label="Fecha estimada de reactivación"
            value={expectedEnd}
            onChange={setExpectedEnd}
            onBlur={() => setTouched((t) => ({ ...t, end: true }))}
            fullWidth
            minDate={today}
            error={!!endError || projectedTooLong}
            helperText={
              endError ||
              (projectedTooLong
                ? `Supera el tope del ciclo de ${summary?.max_days_per_cycle} días`
                : expectedEnd
                  ? `Duración estimada: ${projectedDays} día(s)`
                  : "Opcional: no descuenta tiempo de vigencia")
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={freeze.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!canSubmit || freeze.isPending}
          onClick={submit}
        >
          {freeze.isPending ? "Congelando..." : "Congelar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PlanChangeDialog({
  open,
  onClose,
  membershipId,
  currentPlanId,
}: {
  open: boolean;
  onClose: () => void;
  membershipId: number;
  currentPlanId: number;
}) {
  const navigate = useNavigate();
  const changePlan = useChangeMembershipPlan(membershipId);
  const { data: plans } = useMembershipPlans({
    page: 0,
    size: 50,
    active: true,
  });
  const [planId, setPlanId] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  const options = (plans?.content ?? []).filter(
    (p) => p.membership_plan_id !== currentPlanId
  );

  const submit = () => {
    if (planId === "") return;
    changePlan.mutate(
      { membership_plan_id: Number(planId), notes: notes || undefined },
      {
        onSuccess: (created) => {
          onClose();
          navigate(`/memberships/${created.membership_id}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cambiar de plan</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            El cambio crea un contrato nuevo que arranca hoy con el período
            completo del plan destino; el contrato actual pasa a EXPIRED. No
            hay prorrateo.
          </Typography>
          <TextField
            select
            label="Plan destino"
            value={planId}
            onChange={(e) =>
              setPlanId(e.target.value === "" ? "" : Number(e.target.value))
            }
            fullWidth
          >
            {options.map((plan) => (
              <MenuItem
                key={plan.membership_plan_id}
                value={plan.membership_plan_id}
              >
                {plan.name} · Q {Number(plan.price).toFixed(2)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Notas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={changePlan.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={planId === "" || changePlan.isPending}
          onClick={submit}
        >
          {changePlan.isPending ? "Cambiando..." : "Cambiar plan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CancelDialog({
  open,
  onClose,
  membershipId,
}: {
  open: boolean;
  onClose: () => void;
  membershipId: number;
}) {
  const cancel = useCancelMembership(membershipId);
  const [reason, setReason] = useState<CancellationReason | "">("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);

  const reasonError = touched && !reason ? "Selecciona el motivo" : "";
  const canSubmit = !!reason && !reasonError;

  const submit = () => {
    setTouched(true);
    if (!canSubmit) return;
    cancel.mutate(
      {
        cancellation_reason: reason as CancellationReason,
        notes: notes || undefined,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cancelar membresía</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Typography variant="body2" color="error">
            La cancelación es definitiva: el contrato no se puede reactivar ni
            renovar después.
          </Typography>
          <TextField
            select
            label="Motivo de cancelación"
            value={reason}
            onChange={(e) =>
              setReason(e.target.value as CancellationReason | "")
            }
            onBlur={() => setTouched(true)}
            fullWidth
            error={!!reasonError}
            helperText={reasonError}
          >
            {(Object.keys(cancellationReasonLabel) as CancellationReason[]).map(
              (r) => (
                <MenuItem key={r} value={r}>
                  {cancellationReasonLabel[r]}
                </MenuItem>
              )
            )}
          </TextField>
          <TextField
            label="Notas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={cancel.isPending}>
          Volver
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={!canSubmit || cancel.isPending}
          onClick={submit}
        >
          {cancel.isPending ? "Cancelando..." : "Cancelar membresía"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function MembershipDetailPage() {
  const navigate = useNavigate();
  const { membershipId } = useParams();
  const id = Number(membershipId);
  const { user } = useAuth();
  const canManage = hasAnyRole(user?.role, ["ADMIN", "RECEPTIONIST"]);

  const { data: membership, isLoading, isError } = useMembership(id);
  const { data: member } = useMember(membership?.member_id);
  const { data: freezes } = useMembershipFreezes(id);
  const { data: history } = useMemberMembershipHistory(membership?.member_id);
  const renew = useRenewMembership(id);
  const reactivate = useReactivateMembership(id);

  const [freezeOpen, setFreezeOpen] = useState(false);
  const [planChangeOpen, setPlanChangeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !membership) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">No se pudo cargar el contrato.</Typography>
      </Box>
    );
  }

  const status = membership.status;
  const plan = membership.plan;

  // Si el socio ya tiene otro contrato vigente, este contrato EXPIRED fue
  // reemplazado (renovacion o cambio de plan): renovarlo de nuevo violaria
  // uq_membership_in_force y el backend responde 500. Se bloquea en la UI.
  const hasOtraVigente = (history?.content ?? []).some(
    (m) =>
      m.membership_id !== id &&
      (m.status === "ACTIVE" || m.status === "FROZEN")
  );
  const puedeRenovarOCambiar =
    status === "ACTIVE" || (status === "EXPIRED" && !hasOtraVigente);

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
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/memberships")}
            sx={{ mb: 1 }}
          >
            Regresar al listado
          </Button>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Contrato #{membership.membership_id}
            </Typography>
            <Chip
              label={membershipStatusLabel[status]}
              color={membershipStatusColor[status]}
              size="small"
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {member
              ? `${member.person.full_name} · ${member.member_code}`
              : `Socio #${membership.member_id}`}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ flexWrap: "wrap" }}
        >
          {canManage && (
            <Button
              variant="outlined"
              onClick={() => navigate(`/members/${membership.member_id}`)}
            >
              Ver socio
            </Button>
          )}
          {status === "ACTIVE" && (
            <Button variant="outlined" onClick={() => setFreezeOpen(true)}>
              Congelar
            </Button>
          )}
          {status === "FROZEN" && canManage && (
            <Button
              variant="outlined"
              color="success"
              onClick={() => setReactivateOpen(true)}
            >
              Reactivar
            </Button>
          )}
          {puedeRenovarOCambiar && (
            <Button variant="outlined" onClick={() => setRenewOpen(true)}>
              Renovar
            </Button>
          )}
          {puedeRenovarOCambiar && (
            <Button variant="outlined" onClick={() => setPlanChangeOpen(true)}>
              Cambiar plan
            </Button>
          )}
          {status !== "CANCELLED" && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setCancelOpen(true)}
            >
              Cancelar
            </Button>
          )}
        </Stack>
      </Stack>

      {status === "EXPIRED" && hasOtraVigente && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Este contrato ya fue reemplazado por uno más reciente (renovación o
            cambio de plan). Para renovar o cambiar de plan, abre el contrato
            vigente del socio; este se conserva como historial.
          </Typography>
        </Paper>
      )}

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 3, mb: 3 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Datos del contrato
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Field label="Plan" value={`${plan.name} (${plan.code})`} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field
              label="Clases grupales"
              value={
                !plan.includes_group_classes
                  ? "No incluye"
                  : plan.weekly_class_limit == null
                    ? "Ilimitadas"
                    : `${plan.weekly_class_limit} por semana`
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field
              label="Entrenador personal"
              value={plan.includes_personal_trainer ? "Incluye" : "No incluye"}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field
              label="Precio pagado"
              value={`Q ${Number(membership.paid_price).toFixed(2)}`}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Inicio" value={membership.start_date} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Vencimiento" value={membership.end_date} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field
              label="Días restantes"
              value={String(membership.days_remaining)}
            />
          </Grid>
          {membership.notes && (
            <Grid item xs={12}>
              <Field label="Notas" value={membership.notes} />
            </Grid>
          )}
          {status === "CANCELLED" && (
            <>
              <Grid item xs={12} sm={4}>
                <Field label="Cancelada el" value={membership.cancelled_on} />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Field
                  label="Motivo de cancelación"
                  value={
                    membership.cancellation_reason
                      ? cancellationReasonLabel[
                          membership.cancellation_reason as CancellationReason
                        ] ?? membership.cancellation_reason
                      : null
                  }
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Congelamientos
          </Typography>
          {freezes && (
            <>
              <Chip
                size="small"
                label={`${freezes.freezes_used_in_cycle} de ${freezes.max_count_per_cycle} en el ciclo`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${freezes.max_days_per_cycle} días máx / ciclo de ${freezes.cycle_days} días`}
              />
            </>
          )}
        </Stack>

        {!freezes || freezes.freezes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Este contrato no tiene congelamientos registrados.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {freezes.freezes.map((f) => (
              <Box
                key={f.membership_freeze_id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                  p: 1.5,
                  borderRadius: 2,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {freezeReasonLabel[f.reason]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Inicio: {f.start_date}
                    {f.expected_end_date
                      ? ` · Reactivación estimada: ${f.expected_end_date}`
                      : ""}
                    {f.reason_detail ? ` · ${f.reason_detail}` : ""}
                  </Typography>
                </Box>
                {f.in_progress ? (
                  <Chip size="small" label="En curso" color="info" />
                ) : (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Reactivada el ${f.reactivated_on ?? "—"}`}
                  />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <FreezeDialog
        open={freezeOpen}
        onClose={() => setFreezeOpen(false)}
        membershipId={id}
      />
      <PlanChangeDialog
        open={planChangeOpen}
        onClose={() => setPlanChangeOpen(false)}
        membershipId={id}
        currentPlanId={plan.membership_plan_id}
      />
      <CancelDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        membershipId={id}
      />
      <ConfirmDialog
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        title="Renovar membresía"
        body="La renovación crea un contrato nuevo encadenado al actual: arranca donde terminaba este y el actual pasa a EXPIRED. Se renueva el mismo plan."
        confirmLabel="Renovar"
        pending={renew.isPending}
        onConfirm={() =>
          renew.mutate(undefined, {
            onSuccess: (created) => {
              setRenewOpen(false);
              navigate(`/memberships/${created.membership_id}`);
            },
          })
        }
      />
      <ConfirmDialog
        open={reactivateOpen}
        onClose={() => setReactivateOpen(false)}
        title="Reactivar membresía"
        body="La nueva fecha de vencimiento se recalcula sumando el tiempo que la membresía permaneció congelada."
        confirmLabel="Reactivar"
        pending={reactivate.isPending}
        onConfirm={() =>
          reactivate.mutate(undefined, {
            onSuccess: () => setReactivateOpen(false),
          })
        }
      />
    </Box>
  );
}