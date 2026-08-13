import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useTrainers } from "@/modules/trainers/hooks";
import { useCreateGroupClass, useGroupClass, useUpdateGroupClass } from "@/modules/classes/hooks";
import type { ClassDiscipline, DifficultyLevel, Weekday } from "@/modules/classes/types";

const disciplines: ClassDiscipline[] = [
  "YOGA",
  "CROSSFIT",
  "PILATES",
  "HIIT",
  "CARDIO",
  "STRENGTH",
  "FUNCTIONAL",
  "BOXING",
  "SPINNING",
  "MEDITATION",
];

const weekdays: Weekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const difficultyOptions: DifficultyLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const schema = yup.object({
  code: yup.string().required("El código es requerido").max(30, "Máximo 30 caracteres"),
  name: yup.string().required("El nombre es requerido").max(100, "Máximo 100 caracteres"),
  discipline: yup.mixed<ClassDiscipline>().oneOf(disciplines).required("Selecciona una disciplina"),
  trainer_id: yup.number().typeError("Selecciona un entrenador").required("Selecciona un entrenador"),
  weekday: yup.mixed<Weekday>().oneOf(weekdays).required("Selecciona un día"),
  start_time: yup
    .string()
    .required("La hora es requerida")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Usa formato HH:mm"),
  duration_minutes: yup
    .number()
    .typeError("Debe ser un número")
    .integer("Debe ser entero")
    .min(30, "Mínimo 30 minutos")
    .max(180, "Máximo 180 minutos")
    .required("La duración es requerida"),
  max_capacity: yup
    .number()
    .typeError("Debe ser un número")
    .integer("Debe ser entero")
    .min(1, "Mínimo 1 cupo")
    .max(50, "Máximo 50 cupos")
    .required("El cupo es requerido"),
  difficulty_level: yup.mixed<DifficultyLevel>().oneOf(difficultyOptions).optional(),
});

type FormValues = yup.InferType<typeof schema>;

const weekdayLabel: Record<Weekday, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const disciplineLabel: Record<ClassDiscipline, string> = {
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

const difficultyLabel: Record<DifficultyLevel, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

export function ClassFormPage() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const isEdit = Boolean(classId);
  const { data: groupClass, isLoading: isLoadingClass } = useGroupClass(
    isEdit ? Number(classId) : undefined
  );
  const { data: trainersData } = useTrainers({ page: 0, size: 200 });
  const createMutation = useCreateGroupClass();
  const updateMutation = useUpdateGroupClass(Number(classId));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      discipline: "YOGA",
      trainer_id: undefined,
      weekday: "MONDAY",
      start_time: "08:00",
      duration_minutes: 60,
      max_capacity: 10,
      difficulty_level: "BEGINNER",
    },
  });

  useEffect(() => {
    if (!groupClass) return;
    reset({
      code: groupClass.code,
      name: groupClass.name,
      discipline: groupClass.discipline,
      trainer_id: groupClass.trainer_id ?? undefined,
      weekday: groupClass.weekday ?? "MONDAY",
      start_time: groupClass.start_time ?? "08:00",
      duration_minutes: groupClass.duration_minutes ?? 60,
      max_capacity: groupClass.max_capacity ?? 10,
      difficulty_level: groupClass.difficulty_level ?? "BEGINNER",
    });
  }, [groupClass, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      discipline: values.discipline,
      trainer_id: Number(values.trainer_id),
      weekday: values.weekday,
      start_time: values.start_time,
      duration_minutes: Number(values.duration_minutes),
      max_capacity: Number(values.max_capacity),
      difficulty_level: values.difficulty_level,
    };

    if (isEdit) {
      updateMutation.mutate(payload, {
        onSuccess: () => navigate(`/classes/${classId}`),
      });
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: (created) => navigate(`/classes/${created.group_class_id}`),
    });
  };

  if (isEdit && isLoadingClass) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Volver
      </Button>

      <Typography variant="h4" sx={{ mb: 2 }}>
        {isEdit ? "Editar clase" : "Nueva clase"}
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Código"
                    fullWidth
                    error={!!errors.code}
                    helperText={errors.code?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="discipline"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Disciplina"
                    fullWidth
                    error={!!errors.discipline}
                    helperText={errors.discipline?.message}
                  >
                    {disciplines.map((value) => (
                      <MenuItem key={value} value={value}>
                        {disciplineLabel[value]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="difficulty_level"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Nivel"
                    fullWidth
                    error={!!errors.difficulty_level}
                    helperText={errors.difficulty_level?.message}
                  >
                    {difficultyOptions.map((value) => (
                      <MenuItem key={value} value={value}>
                        {difficultyLabel[value]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="trainer_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Entrenador"
                    fullWidth
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    error={!!errors.trainer_id}
                    helperText={errors.trainer_id?.message}
                  >
                    <MenuItem value="">Seleccionar</MenuItem>
                    {(trainersData?.content ?? []).map((trainer) => (
                      <MenuItem key={trainer.trainer_id} value={trainer.trainer_id}>
                        {trainer.person.full_name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="weekday"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Día de la semana"
                    fullWidth
                    error={!!errors.weekday}
                    helperText={errors.weekday?.message}
                  >
                    {weekdays.map((value) => (
                      <MenuItem key={value} value={value}>
                        {weekdayLabel[value]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="time"
                    label="Hora de inicio"
                    fullWidth
                    error={!!errors.start_time}
                    helperText={errors.start_time?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Controller
                name="duration_minutes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Duración"
                    fullWidth
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    error={!!errors.duration_minutes}
                    helperText={errors.duration_minutes?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Controller
                name="max_capacity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Cupo"
                    fullWidth
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    error={!!errors.max_capacity}
                    helperText={errors.max_capacity?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={isSaving}>
              {isSaving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear clase"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
