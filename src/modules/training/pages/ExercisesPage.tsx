import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { getErrorMessage } from "@/api/types";
import { useAuth } from "@/auth/useAuth";
import {
  useCreateExercise,
  useDeactivateExercise,
  useExercises,
  useUpdateExercise,
} from "../hooks";
import type { Exercise, MuscleGroup } from "../types";

ModuleRegistry.registerModules([AllCommunityModule]);

const MUSCLE_GROUP_LABEL: Record<MuscleGroup, string> = {
  CHEST: "Pecho",
  BACK: "Espalda",
  LEGS: "Piernas",
  SHOULDERS: "Hombros",
  ARMS: "Brazos",
  CORE: "Core",
  CARDIO: "Cardio",
  FULL_BODY: "Cuerpo completo",
};

interface ExerciseFormState {
  code: string;
  name: string;
  muscle_group: MuscleGroup;
  description: string;
  video_url: string;
}

const BLANK_FORM: ExerciseFormState = {
  code: "",
  name: "",
  muscle_group: "FULL_BODY",
  description: "",
  video_url: "",
};

export function ExercisesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | "">("");
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ExerciseFormState>(BLANK_FORM);

  const { data, isLoading, isError } = useExercises({
    page: 0,
    size: 100,
    muscle_group: muscleGroup || undefined,
  });

  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise(editing?.exercise_id ?? 0);
  const deactivateExercise = useDeactivateExercise();
  const mutation = editing ? updateExercise : createExercise;

  const openCreate = () => {
    setEditing(null);
    setForm(BLANK_FORM);
    setFormOpen(true);
  };

  const openEdit = (exercise: Exercise) => {
    setEditing(exercise);
    setForm({
      code: exercise.code,
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      description: exercise.description ?? "",
      video_url: exercise.video_url ?? "",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    mutation.reset();
  };

  const submit = () => {
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      muscle_group: form.muscle_group,
      description: form.description.trim() === "" ? undefined : form.description.trim(),
      video_url: form.video_url.trim() === "" ? undefined : form.video_url.trim(),
    };
    mutation.mutate(payload, { onSuccess: closeForm });
  };

  const canSubmit = form.code.trim() !== "" && form.name.trim() !== "" && !mutation.isPending;

  const columnDefs = useMemo<ColDef<Exercise>[]>(
    () => [
      { field: "code", headerName: "Código", width: 120 },
      { field: "name", headerName: "Nombre", flex: 1 },
      {
        headerName: "Grupo muscular",
        width: 160,
        valueGetter: (p) => (p.data ? MUSCLE_GROUP_LABEL[p.data.muscle_group] : ""),
      },
      {
        headerName: "Activo",
        width: 100,
        valueGetter: (p) => (p.data?.active ? "Sí" : "No"),
      },
      {
        headerName: "Acciones",
        width: isAdmin ? 220 : 110,
        cellRenderer: (p: { data: Exercise }) => (
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => openEdit(p.data)}>
              Editar
            </Button>
            {isAdmin && p.data.active && (
              <Button
                size="small"
                color="warning"
                onClick={() => deactivateExercise.mutate(p.data.exercise_id)}
              >
                Desactivar
              </Button>
            )}
          </Stack>
        ),
      },
    ],
    [isAdmin, deactivateExercise],
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Catálogo de ejercicios</Typography>
        <Button variant="contained" onClick={openCreate}>
          Nuevo ejercicio
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          select
          label="Grupo muscular"
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup | "")}
          size="small"
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {(Object.keys(MUSCLE_GROUP_LABEL) as MuscleGroup[]).map((group) => (
            <MenuItem key={group} value={group}>
              {MUSCLE_GROUP_LABEL[group]}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el catálogo de ejercicios.
        </Typography>
      )}

      <Paper sx={{ height: 520, width: "100%" }}>
        <AgGridReact
          theme={themeMaterial}
          rowData={data?.content ?? []}
          columnDefs={columnDefs}
          loading={isLoading}
          suppressCellFocus
        />
      </Paper>

      <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Editar ejercicio" : "Nuevo ejercicio"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Código"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              select
              label="Grupo muscular"
              value={form.muscle_group}
              onChange={(e) =>
                setForm((f) => ({ ...f, muscle_group: e.target.value as MuscleGroup }))
              }
              fullWidth
            >
              {(Object.keys(MUSCLE_GROUP_LABEL) as MuscleGroup[]).map((group) => (
                <MenuItem key={group} value={group}>
                  {MUSCLE_GROUP_LABEL[group]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Descripción"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              label="URL de video (opcional)"
              value={form.video_url}
              onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
              fullWidth
            />

            {mutation.isError && (
              <Alert severity="error" onClose={() => mutation.reset()}>
                {getErrorMessage(mutation.error, "No se pudo guardar el ejercicio")}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeForm} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button variant="contained" disabled={!canSubmit} onClick={submit}>
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
