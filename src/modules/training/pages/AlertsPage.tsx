import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { getErrorMessage } from "@/api/types";
import { useAuth } from "@/auth/useAuth";
import { useCreateAlert, useTrainerAlerts, useUpdateAlertStatus } from "../hooks";
import { TrainingMemberPicker } from "../components/TrainingMemberPicker";
import type { TrainerAlert, TrainerAlertStatus, TrainerAlertType } from "../types";

const ALERT_TYPE_LABEL: Record<TrainerAlertType, string> = {
  REASSIGNMENT: "Reasignación",
  SPECIAL_ATTENTION: "Atención especial",
};

const STATUS_LABEL: Record<TrainerAlertStatus, string> = {
  PENDING: "Pendiente",
  RESOLVED: "Resuelta",
  DISMISSED: "Descartada",
};

const STATUS_COLOR: Record<TrainerAlertStatus, "warning" | "success" | "default"> = {
  PENDING: "warning",
  RESOLVED: "success",
  DISMISSED: "default",
};

export function AlertsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [statusFilter, setStatusFilter] = useState<TrainerAlertStatus | "">(
    isAdmin ? "PENDING" : "",
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [resolvingAlert, setResolvingAlert] = useState<TrainerAlert | null>(null);

  const { data, isLoading, isError } = useTrainerAlerts({
    page: 0,
    size: 50,
    status: statusFilter || undefined,
  });

  const alerts = data?.content ?? [];

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Alertas de entrenador</Typography>
        {!isAdmin && (
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Escalar alerta
          </Button>
        )}
      </Stack>

      {isAdmin && (
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            select
            label="Estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TrainerAlertStatus | "")}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {(Object.keys(STATUS_LABEL) as TrainerAlertStatus[]).map((status) => (
              <MenuItem key={status} value={status}>
                {STATUS_LABEL[status]}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudieron cargar las alertas.
        </Typography>
      )}

      {isLoading && <CircularProgress size={24} />}

      <Stack spacing={1.5}>
        {alerts.map((alert) => (
          <Paper key={alert.trainer_alert_id} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Chip size="small" label={ALERT_TYPE_LABEL[alert.alert_type]} />
                  <Chip size="small" label={STATUS_LABEL[alert.status]} color={STATUS_COLOR[alert.status]} />
                </Stack>
                <Typography variant="body2">Socio #{alert.member_id}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {alert.description}
                </Typography>
                {alert.resolution_notes && (
                  <Typography variant="caption" color="text.secondary">
                    Resolución: {alert.resolution_notes}
                  </Typography>
                )}
              </Box>
              {isAdmin && alert.status === "PENDING" && (
                <Button size="small" onClick={() => setResolvingAlert(alert)}>
                  Resolver
                </Button>
              )}
            </Stack>
          </Paper>
        ))}

        {!isLoading && alerts.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No hay alertas para mostrar.
          </Typography>
        )}
      </Stack>

      <CreateAlertDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <ResolveAlertDialog alert={resolvingAlert} onClose={() => setResolvingAlert(null)} />
    </Box>
  );
}

function CreateAlertDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [memberId, setMemberId] = useState<number | null>(null);
  const [alertType, setAlertType] = useState<TrainerAlertType>("SPECIAL_ATTENTION");
  const [description, setDescription] = useState("");
  const createAlert = useCreateAlert();

  const handleClose = () => {
    setMemberId(null);
    setAlertType("SPECIAL_ATTENTION");
    setDescription("");
    createAlert.reset();
    onClose();
  };

  const canSubmit = memberId != null && description.trim() !== "" && !createAlert.isPending;

  const submit = () => {
    if (memberId == null || description.trim() === "") return;
    createAlert.mutate(
      { member_id: memberId, alert_type: alertType, description: description.trim() },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Escalar alerta al administrador</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TrainingMemberPicker value={memberId} onChange={setMemberId} />
          <TextField
            select
            label="Tipo de alerta"
            value={alertType}
            onChange={(e) => setAlertType(e.target.value as TrainerAlertType)}
            fullWidth
          >
            {(Object.keys(ALERT_TYPE_LABEL) as TrainerAlertType[]).map((type) => (
              <MenuItem key={type} value={type}>
                {ALERT_TYPE_LABEL[type]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            required
            fullWidth
          />

          {createAlert.isError && (
            <Alert severity="error" onClose={() => createAlert.reset()}>
              {getErrorMessage(createAlert.error, "No se pudo enviar la alerta")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={createAlert.isPending}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!canSubmit} onClick={submit}>
          {createAlert.isPending ? "Enviando..." : "Enviar alerta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ResolveAlertDialog({
  alert,
  onClose,
}: {
  alert: TrainerAlert | null;
  onClose: () => void;
}) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const updateStatus = useUpdateAlertStatus(alert?.trainer_alert_id ?? 0);

  const handleClose = () => {
    setResolutionNotes("");
    updateStatus.reset();
    onClose();
  };

  const resolve = (status: "RESOLVED" | "DISMISSED") => {
    updateStatus.mutate(
      { status, resolution_notes: resolutionNotes.trim() === "" ? undefined : resolutionNotes.trim() },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog open={!!alert} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Resolver alerta</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {alert && <Typography variant="body2">{alert.description}</Typography>}
          <TextField
            label="Notas de resolución (opcional)"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />

          {updateStatus.isError && (
            <Alert severity="error" onClose={() => updateStatus.reset()}>
              {getErrorMessage(updateStatus.error, "No se pudo actualizar la alerta")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={updateStatus.isPending}>
          Cancelar
        </Button>
        <Button onClick={() => resolve("DISMISSED")} disabled={updateStatus.isPending}>
          Descartar
        </Button>
        <Button variant="contained" color="success" onClick={() => resolve("RESOLVED")} disabled={updateStatus.isPending}>
          Resolver
        </Button>
      </DialogActions>
    </Dialog>
  );
}
