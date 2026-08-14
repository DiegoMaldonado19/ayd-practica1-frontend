import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMember } from "@/modules/members/hooks";
import { useAuth } from "@/auth/useAuth";
import {
  useMemberMeasurements,
  useMemberNotes,
  useRoutines,
  useUpdateRoutineStatus,
} from "../hooks";
import { RoutineEditorDialog } from "../components/RoutineEditorDialog";
import { MeasurementFormDialog } from "../components/MeasurementFormDialog";
import { MeasurementChart } from "../components/MeasurementChart";
import { NoteFormDialog } from "../components/NoteFormDialog";
import type { ProgressMeasurement, Routine, RoutineStatus, TrainerNote, TrainerNoteType } from "../types";

const ROUTINE_STATUS_LABEL: Record<RoutineStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicada",
  ARCHIVED: "Archivada",
};

const ROUTINE_STATUS_COLOR: Record<RoutineStatus, "default" | "success" | "warning"> = {
  DRAFT: "warning",
  PUBLISHED: "success",
  ARCHIVED: "default",
};

const NOTE_TYPE_LABEL: Record<TrainerNoteType, string> = {
  NUTRITION: "Nutrición",
  TRAINING: "Entrenamiento",
  GENERAL: "General",
};

const WEEKDAY_LABEL: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export function MemberTrainingPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTrainer = user?.role === "TRAINER";
  const id = Number(memberId);

  const { data: member, isLoading, isError } = useMember(id);

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
        <Typography color="error">No se pudo cargar al socio.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 980, mx: "auto" }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 1 }}>
        Regresar
      </Button>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        {member.person.full_name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Código: {member.member_code}
      </Typography>

      <RoutinesSection memberId={id} canEdit={isTrainer} />
      <Divider sx={{ my: 3 }} />
      <MeasurementsSection memberId={id} canEdit={isTrainer} />
      <Divider sx={{ my: 3 }} />
      <NotesSection memberId={id} canEdit={isTrainer} />
    </Box>
  );
}

function RoutinesSection({ memberId, canEdit }: { memberId: number; canEdit: boolean }) {
  const { data, isLoading } = useRoutines({ member_id: memberId, page: 0, size: 20 });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | undefined>(undefined);

  const routines = data?.content ?? [];

  const openNew = () => {
    setEditingRoutine(undefined);
    setEditorOpen(true);
  };

  const openEdit = (routine: Routine) => {
    setEditingRoutine(routine);
    setEditorOpen(true);
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Rutinas
        </Typography>
        {canEdit && (
          <Button variant="contained" size="small" onClick={openNew}>
            Nueva rutina
          </Button>
        )}
      </Stack>

      {isLoading && <CircularProgress size={24} />}

      {!isLoading && routines.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Este socio no tiene rutinas registradas todavía.
        </Typography>
      )}

      <Stack spacing={1.5}>
        {routines.map((routine) => (
          <RoutineCard
            key={routine.routine_id}
            routine={routine}
            expanded={expandedId === routine.routine_id}
            onToggle={() =>
              setExpandedId((current) => (current === routine.routine_id ? null : routine.routine_id))
            }
            canEdit={canEdit}
            onEdit={() => openEdit(routine)}
          />
        ))}
      </Stack>

      {editorOpen && (
        <RoutineEditorDialog
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          memberId={memberId}
          routine={editingRoutine}
        />
      )}
    </Paper>
  );
}

function RoutineCard({
  routine,
  expanded,
  onToggle,
  canEdit,
  onEdit,
}: {
  routine: Routine;
  expanded: boolean;
  onToggle: () => void;
  canEdit: boolean;
  onEdit: () => void;
}) {
  const updateStatus = useUpdateRoutineStatus(routine.routine_id);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" onClick={onToggle} sx={{ cursor: "pointer" }}>
        <Box>
          <Typography variant="subtitle1">{routine.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {routine.start_date}
            {routine.end_date ? ` → ${routine.end_date}` : ""}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={ROUTINE_STATUS_LABEL[routine.status]}
          color={ROUTINE_STATUS_COLOR[routine.status]}
        />
      </Stack>

      {expanded && (
        <Box sx={{ mt: 2 }}>
          {routine.goal_summary && (
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              {routine.goal_summary}
            </Typography>
          )}
          <Stack spacing={1}>
            {routine.days.map((day) => (
              <Box key={day.weekday}>
                <Typography variant="caption" color="text.secondary">
                  {WEEKDAY_LABEL[day.weekday] ?? day.weekday}
                </Typography>
                {day.exercises.map((exercise) => (
                  <Typography key={exercise.routine_exercise_id} variant="body2">
                    {exercise.exercise_name} — {exercise.sets}×{exercise.repetitions}
                    {exercise.rest_seconds ? ` · descanso ${exercise.rest_seconds}s` : ""}
                  </Typography>
                ))}
              </Box>
            ))}
          </Stack>

          {canEdit && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button size="small" onClick={onEdit}>
                Editar
              </Button>
              {routine.status === "DRAFT" && (
                <Button
                  size="small"
                  color="success"
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ status: "PUBLISHED" })}
                >
                  Publicar
                </Button>
              )}
              {routine.status !== "ARCHIVED" && (
                <Button
                  size="small"
                  color="warning"
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ status: "ARCHIVED" })}
                >
                  Archivar
                </Button>
              )}
            </Stack>
          )}
        </Box>
      )}
    </Paper>
  );
}

function MeasurementsSection({ memberId, canEdit }: { memberId: number; canEdit: boolean }) {
  const { data: measurements, isLoading } = useMemberMeasurements(memberId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProgressMeasurement | undefined>(undefined);

  const rows = measurements ?? [];

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Mediciones de progreso
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            Registrar medición
          </Button>
        )}
      </Stack>

      {isLoading && <CircularProgress size={24} />}

      {!isLoading && rows.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Todavía no hay mediciones registradas.
        </Typography>
      )}

      {rows.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <MeasurementChart measurements={rows} />
        </Box>
      )}

      <Stack spacing={1}>
        {rows.map((measurement) => (
          <Stack
            key={measurement.progress_measurement_id}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2">
              {measurement.measured_on} — {measurement.weight_kg} kg
              {measurement.body_fat_percent ? ` · ${measurement.body_fat_percent}% grasa` : ""}
            </Typography>
            {canEdit && (
              <Button
                size="small"
                onClick={() => {
                  setEditing(measurement);
                  setFormOpen(true);
                }}
              >
                Corregir
              </Button>
            )}
          </Stack>
        ))}
      </Stack>

      {formOpen && (
        <MeasurementFormDialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          memberId={memberId}
          measurement={editing}
        />
      )}
    </Paper>
  );
}

function NotesSection({ memberId, canEdit }: { memberId: number; canEdit: boolean }) {
  const { data: notes, isLoading } = useMemberNotes(memberId);
  const [formOpen, setFormOpen] = useState(false);

  const rows: TrainerNote[] = notes ?? [];

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Observaciones del entrenador
        </Typography>
        {canEdit && (
          <Button variant="contained" size="small" onClick={() => setFormOpen(true)}>
            Agregar observación
          </Button>
        )}
      </Stack>

      {isLoading && <CircularProgress size={24} />}

      {!isLoading && rows.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No hay observaciones registradas.
        </Typography>
      )}

      <Stack spacing={1.5}>
        {rows.map((note) => (
          <Box key={note.trainer_note_id}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={NOTE_TYPE_LABEL[note.note_type]} />
              <Typography variant="caption" color="text.secondary">
                {note.reference_date ?? note.created_at.slice(0, 10)}
              </Typography>
            </Stack>
            <Typography variant="body2">{note.content}</Typography>
          </Box>
        ))}
      </Stack>

      {formOpen && (
        <NoteFormDialog open={formOpen} onClose={() => setFormOpen(false)} memberId={memberId} />
      )}
    </Paper>
  );
}
