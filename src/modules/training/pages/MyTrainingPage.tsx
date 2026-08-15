import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/auth/useAuth";
import { useMemberMeasurements, useMemberNotes, useMemberTrainer, useRoutines } from "../hooks";
import { MeasurementChart } from "../components/MeasurementChart";
import type { RoutineStatus, TrainerNoteType } from "../types";

const ROUTINE_STATUS_LABEL: Record<RoutineStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicada",
  ARCHIVED: "Archivada",
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

export function MyTrainingPage() {
  const { user } = useAuth();
  const memberId = user?.member_id ?? undefined;

  const { data: routines, isLoading: routinesLoading } = useRoutines({ page: 0, size: 20 });
  const currentRoutine = (routines?.content ?? []).find((r) => r.status === "PUBLISHED") ??
    (routines?.content ?? [])[0];

  const { data: trainer } = useMemberTrainer(memberId);
  const { data: measurements, isLoading: measurementsLoading } = useMemberMeasurements(memberId);
  const { data: notes, isLoading: notesLoading } = useMemberNotes(memberId);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Mi entrenamiento
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Mi entrenador
        </Typography>
        {trainer ? (
          <Typography variant="body1">{trainer.person.full_name}</Typography>
        ) : memberId ? (
          <Typography variant="body2" color="text.secondary">
            Todavía no tienes un entrenador asignado.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Esta información aparecerá cuando tu entrenador te asigne una rutina.
          </Typography>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Mi rutina
        </Typography>

        {routinesLoading && <CircularProgress size={24} />}

        {!routinesLoading && !currentRoutine && (
          <Typography variant="body2" color="text.secondary">
            Aún no tienes una rutina registrada.
          </Typography>
        )}

        {currentRoutine && (
          <>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle1">{currentRoutine.name}</Typography>
              <Chip size="small" label={ROUTINE_STATUS_LABEL[currentRoutine.status]} />
            </Stack>
            {currentRoutine.goal_summary && (
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                {currentRoutine.goal_summary}
              </Typography>
            )}
            <Stack spacing={1}>
              {currentRoutine.days.map((day) => (
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
          </>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Mi progreso
        </Typography>

        {!memberId ? (
          <Typography variant="body2" color="text.secondary">
            Esta información aparecerá cuando tu entrenador te asigne una rutina.
          </Typography>
        ) : (
          <>
            {measurementsLoading && <CircularProgress size={24} />}
            {!measurementsLoading && (measurements ?? []).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Todavía no hay mediciones registradas.
              </Typography>
            )}
            {(measurements ?? []).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <MeasurementChart measurements={measurements ?? []} />
              </Box>
            )}
            <Stack spacing={1}>
              {(measurements ?? []).map((measurement) => (
                <Typography key={measurement.progress_measurement_id} variant="body2">
                  {measurement.measured_on} — {measurement.weight_kg} kg
                </Typography>
              ))}
            </Stack>
          </>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Observaciones de mi entrenador
        </Typography>

        {!memberId ? (
          <Typography variant="body2" color="text.secondary">
            Esta información aparecerá cuando tu entrenador te asigne una rutina.
          </Typography>
        ) : (
          <>
            {notesLoading && <CircularProgress size={24} />}
            {!notesLoading && (notes ?? []).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No hay observaciones registradas.
              </Typography>
            )}
            <Stack spacing={1.5}>
              {(notes ?? []).map((note) => (
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
          </>
        )}
      </Paper>
    </Box>
  );
}
