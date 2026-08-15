import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { AppDatePicker } from "@/components/AppDatePicker";
import { getErrorMessage } from "@/api/types";
import { useCreateRoutine, useExercises, useReplaceRoutine } from "../hooks";
import type { Routine, RoutineExerciseItem, Weekday } from "../types";

interface RoutineEditorDialogProps {
  open: boolean;
  onClose: () => void;
  memberId: number;
  routine?: Routine;
}

const WEEKDAY_LABEL: Record<Weekday, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const WEEKDAYS = Object.keys(WEEKDAY_LABEL) as Weekday[];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowIso(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function flattenRoutine(routine: Routine): RoutineExerciseItem[] {
  return routine.days.flatMap((day) =>
    day.exercises.map((exercise) => ({
      exercise_id: exercise.exercise_id,
      weekday: day.weekday,
      display_order: exercise.display_order,
      sets: exercise.sets,
      repetitions: exercise.repetitions,
      rest_seconds: exercise.rest_seconds ?? undefined,
      notes: exercise.notes ?? undefined,
    })),
  );
}

function blankRow(order: number): RoutineExerciseItem {
  return {
    exercise_id: 0,
    weekday: "MONDAY",
    display_order: order,
    sets: 3,
    repetitions: 10,
  };
}

export function RoutineEditorDialog({ open, onClose, memberId, routine }: RoutineEditorDialogProps) {
  const isEdit = Boolean(routine);
  const [name, setName] = useState(routine?.name ?? "");
  const [goalSummary, setGoalSummary] = useState(routine?.goal_summary ?? "");
  const [endDate, setEndDate] = useState(routine?.end_date ?? "");
  const [rows, setRows] = useState<RoutineExerciseItem[]>(
    routine ? flattenRoutine(routine) : [blankRow(1)],
  );

  const { data: exercisesPage } = useExercises({ page: 0, size: 200, active: true });
  const exercises = exercisesPage?.content ?? [];

  const createMutation = useCreateRoutine();
  const replaceMutation = useReplaceRoutine(routine?.routine_id ?? 0);
  const mutation = isEdit ? replaceMutation : createMutation;

  const handleClose = () => {
    mutation.reset();
    onClose();
  };

  const updateRow = (index: number, patch: Partial<RoutineExerciseItem>) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    setRows((current) => current.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setRows((current) => [...current, blankRow(current.length + 1)]);
  };

  const endDateError = endDate !== "" && endDate <= todayIso();

  const canSubmit =
    name.trim() !== "" &&
    rows.length > 0 &&
    rows.every((row) => row.exercise_id > 0) &&
    !endDateError &&
    !mutation.isPending;

  const submit = () => {
    if (!canSubmit) return;
    const payload = {
      member_id: memberId,
      name: name.trim(),
      goal_summary: goalSummary.trim() === "" ? undefined : goalSummary.trim(),
      end_date: endDate === "" ? undefined : endDate,
      exercises: rows,
    };
    mutation.mutate(payload, { onSuccess: () => handleClose() });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? "Editar rutina" : "Nueva rutina"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Nombre de la rutina"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Objetivo (opcional)"
            value={goalSummary}
            onChange={(e) => setGoalSummary(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <AppDatePicker
            label="Fecha de fin (opcional)"
            value={endDate}
            onChange={setEndDate}
            minDate={tomorrowIso()}
            error={endDateError}
            helperText={endDateError ? "La fecha de fin debe ser posterior a hoy" : undefined}
            sx={{ maxWidth: 240 }}
          />

          <Divider />

          <Typography variant="subtitle1">Ejercicios</Typography>

          <Stack spacing={2}>
            {rows.map((row, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    <TextField
                      select
                      label="Ejercicio"
                      value={row.exercise_id || ""}
                      onChange={(e) => updateRow(index, { exercise_id: Number(e.target.value) })}
                      sx={{ minWidth: 220, flex: 1 }}
                    >
                      <MenuItem value="">
                        <em>Selecciona un ejercicio</em>
                      </MenuItem>
                      {exercises.map((exercise) => (
                        <MenuItem key={exercise.exercise_id} value={exercise.exercise_id}>
                          {exercise.name}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Día"
                      value={row.weekday}
                      onChange={(e) => updateRow(index, { weekday: e.target.value as Weekday })}
                      sx={{ minWidth: 140 }}
                    >
                      {WEEKDAYS.map((day) => (
                        <MenuItem key={day} value={day}>
                          {WEEKDAY_LABEL[day]}
                        </MenuItem>
                      ))}
                    </TextField>

                    <IconButton onClick={() => removeRow(index)} aria-label="Eliminar ejercicio">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>

                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    <TextField
                      label="Series"
                      type="number"
                      value={row.sets}
                      onChange={(e) => updateRow(index, { sets: Number(e.target.value) })}
                      sx={{ width: 110 }}
                    />
                    <TextField
                      label="Repeticiones"
                      type="number"
                      value={row.repetitions}
                      onChange={(e) => updateRow(index, { repetitions: Number(e.target.value) })}
                      sx={{ width: 130 }}
                    />
                    <TextField
                      label="Descanso (seg)"
                      type="number"
                      value={row.rest_seconds ?? ""}
                      onChange={(e) =>
                        updateRow(index, {
                          rest_seconds: e.target.value === "" ? undefined : Number(e.target.value),
                        })
                      }
                      sx={{ width: 140 }}
                    />
                    <TextField
                      label="Orden"
                      type="number"
                      value={row.display_order}
                      onChange={(e) => updateRow(index, { display_order: Number(e.target.value) })}
                      sx={{ width: 100 }}
                    />
                    <TextField
                      label="Notas"
                      value={row.notes ?? ""}
                      onChange={(e) => updateRow(index, { notes: e.target.value })}
                      sx={{ flex: 1, minWidth: 160 }}
                    />
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Button onClick={addRow} sx={{ alignSelf: "flex-start" }}>
            Agregar ejercicio
          </Button>

          {mutation.isError && (
            <Alert severity="error" onClose={() => mutation.reset()}>
              {getErrorMessage(mutation.error, "No se pudo guardar la rutina")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Box flexGrow={1} />
        <Button variant="contained" disabled={!canSubmit} onClick={submit}>
          {mutation.isPending ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
