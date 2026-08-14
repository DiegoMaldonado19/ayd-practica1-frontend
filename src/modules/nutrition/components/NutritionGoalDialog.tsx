import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { getErrorMessage } from "@/api/types";
import { useUpsertNutritionGoal } from "../hooks";
import type { GoalType, NutritionGoal } from "../types";

interface NutritionGoalDialogProps {
  open: boolean;
  onClose: () => void;
  memberId: number;
  goal?: NutritionGoal;
}

const GOAL_TYPE_LABEL: Record<GoalType, string> = {
  WEIGHT_LOSS: "Pérdida de peso",
  MUSCLE_GAIN: "Ganancia muscular",
  MAINTENANCE: "Mantenimiento",
};

export function NutritionGoalDialog({ open, onClose, memberId, goal }: NutritionGoalDialogProps) {
  const [goalType, setGoalType] = useState<GoalType>(goal?.goal_type ?? "MAINTENANCE");
  const [dailyCalories, setDailyCalories] = useState(goal?.daily_calories?.toString() ?? "2000");
  const [tolerancePercent, setTolerancePercent] = useState(goal?.tolerance_percent?.toString() ?? "");
  const [targetWeightKg, setTargetWeightKg] = useState(goal?.target_weight_kg?.toString() ?? "");

  const upsertGoal = useUpsertNutritionGoal(memberId);

  const handleClose = () => {
    upsertGoal.reset();
    onClose();
  };

  const canSubmit = dailyCalories.trim() !== "" && !upsertGoal.isPending;

  const submit = () => {
    const calories = Number(dailyCalories);
    if (Number.isNaN(calories)) return;

    upsertGoal.mutate(
      {
        goal_type: goalType,
        daily_calories: calories,
        tolerance_percent: tolerancePercent.trim() === "" ? undefined : Number(tolerancePercent),
        target_weight_kg: targetWeightKg.trim() === "" ? undefined : Number(targetWeightKg),
      },
      { onSuccess: () => handleClose() },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{goal ? "Ajustar meta calórica" : "Definir meta calórica"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            select
            label="Tipo de meta"
            value={goalType}
            onChange={(e) => setGoalType(e.target.value as GoalType)}
            fullWidth
          >
            {(Object.keys(GOAL_TYPE_LABEL) as GoalType[]).map((type) => (
              <MenuItem key={type} value={type}>
                {GOAL_TYPE_LABEL[type]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Calorías diarias"
            type="number"
            value={dailyCalories}
            onChange={(e) => setDailyCalories(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Tolerancia (%) — opcional"
            type="number"
            value={tolerancePercent}
            onChange={(e) => setTolerancePercent(e.target.value)}
            helperText="Por defecto usa el valor configurado del gimnasio (±10%)"
            fullWidth
          />

          <TextField
            label="Peso objetivo (kg) — opcional"
            type="number"
            value={targetWeightKg}
            onChange={(e) => setTargetWeightKg(e.target.value)}
            fullWidth
          />

          {upsertGoal.isError && (
            <Alert severity="error" onClose={() => upsertGoal.reset()}>
              {getErrorMessage(upsertGoal.error, "No se pudo guardar la meta calórica")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={upsertGoal.isPending}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!canSubmit} onClick={submit}>
          {upsertGoal.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
