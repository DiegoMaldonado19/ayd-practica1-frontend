import * as yup from "yup";
import type { ClassDiscipline, DifficultyLevel, Weekday } from "@/modules/classes/types";
import { disciplines, difficultyOptions, weekdays } from "@/modules/classes/components/classLabels";

export const classFormSchema = yup.object({
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

export type ClassFormValues = yup.InferType<typeof classFormSchema>;