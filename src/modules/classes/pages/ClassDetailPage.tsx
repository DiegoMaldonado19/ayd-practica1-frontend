import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from "@mui/icons-material";
import { useClassSessions, useGenerateGroupClassSessions, useGroupClass } from "@/modules/classes/hooks";

const weekdayLabel: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const disciplineLabel: Record<string, string> = {
  YOGA: "Yoga",
  CROSSFIT: "CrossFit",
  PILATES: "Pilates",
  HIIT: "HIIT",
  CARDIO: "Cardio",
  STRENGTH: "Fuerza",
  FUNCTIONAL: "Funcional",
  BOXING: "Boxeo",
  SPINNING: "Spinning",
  MEDITATION: "Meditación",
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

function isoDate(daysFromToday: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

export function ClassDetailPage() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const { data: groupClass, isLoading, isError } = useGroupClass(Number(classId));
  const [sessionFrom, setSessionFrom] = useState(() => isoDate(0));
  const [sessionTo, setSessionTo] = useState(() => isoDate(30));
  const generateSessionsMutation = useGenerateGroupClassSessions(Number(classId));

  const dateError = useMemo(() => {
    if (!sessionFrom || !sessionTo) {
      return "Debes seleccionar ambas fechas.";
    }

    if (sessionFrom > sessionTo) {
      return "La fecha inicial no puede ser mayor que la fecha final.";
    }

    const today = isoDate(0);
    if (sessionFrom < today) {
      return "La fecha inicial no puede ser anterior a hoy.";
    }

    return "";
  }, [sessionFrom, sessionTo]);

  const dateRange = useMemo(() => {
    const from = new Date();
    const to = new Date();
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    to.setDate(to.getDate() + 30);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  }, []);

  const { data: sessionsData } = useClassSessions({
    group_class_id: Number(classId),
    from: dateRange.from,
    to: dateRange.to,
    page: 0,
    size: 20,
  });

  const handleGenerateSessions = () => {
    if (!classId || dateError) return;

    generateSessionsMutation.mutate({
      from: sessionFrom,
      to: sessionTo,
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !groupClass) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">No se pudo cargar la clase.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/classes")} sx={{ mb: 1 }}>
            Regresar
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {groupClass.name}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/classes/${classId}/edit`)}
        >
          Editar
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3, md: 4 }, borderRadius: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Field label="Código" value={groupClass.code} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Disciplina" value={disciplineLabel[groupClass.discipline] ?? groupClass.discipline} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Nivel" value={groupClass.difficulty_level ?? "—"} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Día" value={groupClass.weekday ? weekdayLabel[groupClass.weekday] : "—"} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Hora" value={groupClass.start_time ?? "—"} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Duración" value={groupClass.duration_minutes ? `${groupClass.duration_minutes} min` : "—"} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Cupo máximo" value={groupClass.max_capacity ?? "—"} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Entrenador" value={groupClass.trainer_id ?? "—"} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="Estado" value={groupClass.active ? "Activa" : "Inactiva"} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Acciones rápidas
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => navigate(`/classes/${classId}/edit`)}>
            Modificar clase
          </Button>
          <Button variant="outlined" onClick={() => navigate("/classes")}>
            Volver al listado
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            type="date"
            label="Desde"
            value={sessionFrom}
            onChange={(event) => setSessionFrom(event.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            error={!!dateError}
          />
          <TextField
            type="date"
            label="Hasta"
            value={sessionTo}
            onChange={(event) => setSessionTo(event.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            error={!!dateError}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleGenerateSessions}
            disabled={generateSessionsMutation.isPending || !!dateError || !sessionFrom || !sessionTo}
          >
            {generateSessionsMutation.isPending ? "Generando..." : "Generar sesiones"}
          </Button>
        </Stack>

        {dateError && (
          <Typography variant="caption" color="error" sx={{ display: "block", mb: 2 }}>
            {dateError}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Sesiones programadas
        </Typography>

        <Stack spacing={1.5}>
          {(sessionsData?.content ?? []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay sesiones creadas todavía.
            </Typography>
          ) : (
            (sessionsData?.content ?? []).map((session) => (
              <Paper key={session.class_session_id} variant="outlined" sx={{ p: 1.5, cursor: "pointer" }} onClick={() => navigate(`/classes/${classId}/sessions/${session.class_session_id}`)}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {session.date} · {session.start_time}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cupo: {session.seats_available ?? 0} disponibles · Estado: {session.status ?? "-"}
                </Typography>
              </Paper>
            ))
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
