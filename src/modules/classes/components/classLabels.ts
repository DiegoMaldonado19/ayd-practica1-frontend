import type { ClassDiscipline, DifficultyLevel, Weekday } from "@/modules/classes/types";

export const disciplines: ClassDiscipline[] = [
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

export const weekdays: Weekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const difficultyOptions: DifficultyLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export const weekdayLabel: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export const disciplineLabel: Record<string, string> = {
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

export const difficultyLabel: Record<DifficultyLevel, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

export const disciplineOptions: Array<{ value: string; label: string }> = disciplines.map(
  (value) => ({ value, label: disciplineLabel[value] }),
);

export const sessionStatusLabel: Record<string, string> = {
  SCHEDULED: "Programada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const enrollmentStatusLabels: Record<string, string> = {
  ENROLLED: "Inscrito",
  CANCELLED: "Cancelado",
  ATTENDED: "Asistió",
  ABSENT: "Ausente",
  WAITING: "En espera",
  NOTIFIED: "Cupo liberado",
  PROMOTED: "Promovido",
  EXPIRED: "Vencido",
};

export function isoDate(daysFromToday: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}