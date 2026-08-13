import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getErrorMessage } from "@/api/types";
import { useTrainers, useTransferTrainerMembers } from "@/modules/trainers/hooks";
import type { Trainer } from "@/modules/trainers/types";

type Props = {
  open: boolean;
  onClose: () => void;
  sourceTrainer: Trainer;
};

export function TransferDialog({ open, onClose, sourceTrainer }: Props) {
  const { data: trainersPage, isLoading } = useTrainers({
    page: 0,
    size: 100,
    search: undefined,
  });
  const transfer = useTransferTrainerMembers(sourceTrainer.trainer_id);
  const [toId, setToId] = useState<number | "">("");

  // Filtra: quita al propio y a los dados de baja.
  const candidates = (trainersPage?.content ?? []).filter(
    (t) => t.trainer_id !== sourceTrainer.trainer_id && t.active !== false
  );

  // Cierra y resetea el estado del diálogo de forma limpia
  const handleClose = () => {
    setToId("");
    transfer.reset();
    onClose();
  };

  const selected = candidates.find((t) => t.trainer_id === toId);
  const canSubmit = !!selected && !transfer.isPending;

  const submit = () => {
    if (!selected) return;
    transfer.mutate(
      { to_trainer_id: selected.trainer_id },
      { onSuccess: () => handleClose() }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Transferir cartera de {sourceTrainer.person.full_name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Se cerrará cada asignación vigente de este entrenador con motivo{" "}
            <strong>TRAINER_LEFT</strong> y se abrirá una nueva sobre el destino. El
            historial no se reescribe, se apila. Cada socio transferido recibe una
            notificación en su bandeja.
          </Typography>

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <TextField
              select
              label="Entrenador destino"
              value={toId}
              onChange={(e) =>
                setToId(e.target.value === "" ? "" : Number(e.target.value))
              }
              fullWidth
              helperText={
                candidates.length === 0
                  ? "No hay otros entrenadores activos disponibles"
                  : undefined
              }
            >
              <MenuItem value="">
                <em>Selecciona un entrenador</em>
              </MenuItem>
              {candidates.map((t) => (
                <MenuItem key={t.trainer_id} value={t.trainer_id}>
                  {t.person.full_name} · capacidad {t.max_member_load}
                </MenuItem>
              ))}
            </TextField>
          )}

          {selected && (
            <Alert severity="info" variant="outlined">
              La cartera completa de <strong>{sourceTrainer.person.full_name}</strong>{" "}
              se moverá a <strong>{selected.person.full_name}</strong>. El destino
              deberá tener capacidad suficiente; si no la tiene, la operación se
              rechaza sin cambios parciales.
            </Alert>
          )}

          {/* Banner de error prominente: controlado directamente por React Query */}
          {transfer.isError && (
            <Alert
              severity="error"
              onClose={() => transfer.reset()}
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {getErrorMessage(
                transfer.error,
                "No se pudo transferir la cartera. Revisa la capacidad del destino."
              )}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={transfer.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="warning"
          disabled={!canSubmit}
          onClick={submit}
        >
          {transfer.isPending ? "Transfiriendo..." : "Transferir cartera"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}