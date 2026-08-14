import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { getErrorMessage } from "@/api/types";
import { useCreateMeasurement, useUpdateMeasurement } from "../hooks";
import type { ProgressMeasurement } from "../types";

interface MeasurementFormDialogProps {
  open: boolean;
  onClose: () => void;
  memberId: number;
  measurement?: ProgressMeasurement;
}

function toNumberOrUndefined(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function MeasurementFormDialog({
  open,
  onClose,
  memberId,
  measurement,
}: MeasurementFormDialogProps) {
  const isEdit = Boolean(measurement);
  const [measuredOn, setMeasuredOn] = useState(measurement?.measured_on ?? "");
  const [weightKg, setWeightKg] = useState(measurement?.weight_kg?.toString() ?? "");
  const [waistCm, setWaistCm] = useState(measurement?.waist_cm?.toString() ?? "");
  const [armCm, setArmCm] = useState(measurement?.arm_cm?.toString() ?? "");
  const [legCm, setLegCm] = useState(measurement?.leg_cm?.toString() ?? "");
  const [bodyFatPercent, setBodyFatPercent] = useState(
    measurement?.body_fat_percent?.toString() ?? "",
  );
  const [notes, setNotes] = useState(measurement?.notes ?? "");

  const createMutation = useCreateMeasurement(memberId);
  const updateMutation = useUpdateMeasurement(measurement?.progress_measurement_id ?? 0, memberId);
  const mutation = isEdit ? updateMutation : createMutation;

  const handleClose = () => {
    mutation.reset();
    onClose();
  };

  const canSubmit = measuredOn !== "" && weightKg.trim() !== "" && !mutation.isPending;

  const submit = () => {
    const weight = toNumberOrUndefined(weightKg);
    if (measuredOn === "" || weight === undefined) return;

    mutation.mutate(
      {
        measured_on: measuredOn,
        weight_kg: weight,
        waist_cm: toNumberOrUndefined(waistCm),
        arm_cm: toNumberOrUndefined(armCm),
        leg_cm: toNumberOrUndefined(legCm),
        body_fat_percent: toNumberOrUndefined(bodyFatPercent),
        notes: notes.trim() === "" ? undefined : notes,
      },
      { onSuccess: () => handleClose() },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Corregir medición" : "Registrar medición"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            type="date"
            label="Fecha"
            value={measuredOn}
            onChange={(e) => setMeasuredOn(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Peso (kg)"
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="% grasa corporal"
                type="number"
                value={bodyFatPercent}
                onChange={(e) => setBodyFatPercent(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Cintura (cm)"
                type="number"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Brazo (cm)"
                type="number"
                value={armCm}
                onChange={(e) => setArmCm(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Pierna (cm)"
                type="number"
                value={legCm}
                onChange={(e) => setLegCm(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
          <TextField
            label="Notas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />

          {mutation.isError && (
            <Alert severity="error" onClose={() => mutation.reset()}>
              {getErrorMessage(mutation.error, "No se pudo guardar la medición")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!canSubmit} onClick={submit}>
          {mutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
