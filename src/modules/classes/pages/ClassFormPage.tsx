import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, CircularProgress, Grid, MenuItem, Paper, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useTrainers } from "@/modules/trainers/hooks";
import { useCreateGroupClass, useGroupClass, useUpdateGroupClass } from "@/modules/classes/hooks";
import type { CreateGroupClassDTO } from "@/modules/classes/types";
import {
  classFormSchema,
  type ClassFormValues,
} from "@/modules/classes/classFormSchema";
import {
  disciplines,
  disciplineLabel,
  difficultyLabel,
  difficultyOptions,
  weekdayLabel,
  weekdays,
} from "@/modules/classes/components/classLabels";
import { ClassFormField } from "@/modules/classes/components/ClassFormField";

export function ClassFormPage() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const isEdit = Boolean(classId);
  const { data: groupClass, isLoading: isLoadingClass } = useGroupClass(isEdit ? Number(classId) : undefined);
  const { data: trainersData } = useTrainers({ page: 0, size: 200 });
  const createMutation = useCreateGroupClass();
  const updateMutation = useUpdateGroupClass(Number(classId));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: yupResolver(classFormSchema),
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

  const onSubmit = (values: ClassFormValues) => {
    const payload: CreateGroupClassDTO = {
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
              <ClassFormField control={control} errors={errors} name="code" label="Código" />
            </Grid>

            <Grid item xs={12} sm={8}>
              <ClassFormField control={control} errors={errors} name="name" label="Nombre" />
            </Grid>

            <Grid item xs={12} sm={4}>
              <ClassFormField control={control} errors={errors} name="discipline" label="Disciplina" select>
                {disciplines.map((value) => (
                  <MenuItem key={value} value={value}>
                    {disciplineLabel[value]}
                  </MenuItem>
                ))}
              </ClassFormField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <ClassFormField control={control} errors={errors} name="difficulty_level" label="Nivel" select>
                {difficultyOptions.map((value) => (
                  <MenuItem key={value} value={value}>
                    {difficultyLabel[value]}
                  </MenuItem>
                ))}
              </ClassFormField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <ClassFormField
                control={control}
                errors={errors}
                name="trainer_id"
                label="Entrenador"
                select
                value={(v) => v ?? ""}
                onChange={(v) => (v === "" ? undefined : Number(v))}
              >
                <MenuItem value="">Seleccionar</MenuItem>
                {(trainersData?.content ?? []).map((trainer) => (
                  <MenuItem key={trainer.trainer_id} value={trainer.trainer_id}>
                    {trainer.person.full_name}
                  </MenuItem>
                ))}
              </ClassFormField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <ClassFormField control={control} errors={errors} name="weekday" label="Día de la semana" select>
                {weekdays.map((value) => (
                  <MenuItem key={value} value={value}>
                    {weekdayLabel[value]}
                  </MenuItem>
                ))}
              </ClassFormField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <ClassFormField control={control} errors={errors} name="start_time" label="Hora de inicio" type="time" />
            </Grid>

            <Grid item xs={12} sm={2}>
              <ClassFormField
                control={control}
                errors={errors}
                name="duration_minutes"
                label="Duración"
                type="number"
                value={(v) => v ?? ""}
                onChange={(v) => (v === "" ? undefined : Number(v))}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <ClassFormField
                control={control}
                errors={errors}
                name="max_capacity"
                label="Cupo"
                type="number"
                value={(v) => v ?? ""}
                onChange={(v) => (v === "" ? undefined : Number(v))}
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