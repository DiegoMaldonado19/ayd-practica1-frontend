export type ReportFormat = "JSON" | "CSV" | "XLSX" | "PDF" | "PNG";
export type RevenueGrouping = "WEEK" | "MONTH";

export interface RevenueRow {
  period: string;
  plan_name: string;
  gross_amount: number;
  discount_amount: number;
  net_amount: number;
}

export interface MembershipExpiryRow {
  membership_id: number;
  member_name: string;
  plan_name: string;
  status: string;
  end_date: string;
  days_to_expiry: number;
}

export interface MemberDistributionRow {
  plan_name: string;
  status: string;
  member_count: number;
}

export interface ClassAttendanceRow {
  session_id: number;
  class_name: string;
  trainer_name: string;
  session_date: string;
  session_time: string;
  attended_count: number;
  absent_count: number;
  cancelled_count: number;
  attendance_rate: number | null;
}

export interface ClassDemandRow {
  class_id: number;
  class_name: string;
  total_sessions: number;
  total_enrollments: number;
  average_occupancy_rate: number | null;
  waitlist_activations_count: number;
}

export interface TrainerLoadRow {
  trainer_id: number;
  trainer_name: string;
  assigned_member_count: number;
  max_member_load: number;
  available_slots: number;
}

export interface MemberProgressRow {
  measurement_id: number;
  measured_on: string;
  weight_kg: number;
  weight_change_kg: number;
  body_fat_percent: number;
  waist_cm: number;
  arm_cm: number;
  leg_cm: number;
  notes: string | null;
}

export interface GuestPassUsageRow {
  guest_pass_id: number;
  guest_name: string;
  pass_type: string;
  visit_date: string;
  converted_to_member: boolean;
  amount_paid: number;
}

export interface NutritionAdherenceRow {
  member_name: string;
  days_logged: number;
  average_daily_calories: number;
  nutrition_goal_calories: number;
  days_within_goal: number;
  adherence_rate: number | null;
}

export type ReportFilterField =
  | "date-range"
  | "plan-select"
  | "trainer-select"
  | "class-select"
  | "member-picker"
  | "group-by"
  | "status"
  | "expiring-in-days"
  | "pass-type"
  | "limit";

export interface ReportDefinition {
  key: string;
  path: string;
  label: string;
  filters: ReportFilterField[];
}

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  { key: "revenue", path: "revenue", label: "Ingresos", filters: ["date-range", "group-by", "plan-select"] },
  {
    key: "memberships",
    path: "memberships",
    label: "Membresías por vencer",
    filters: ["status", "expiring-in-days"],
  },
  {
    key: "member-distribution",
    path: "member-distribution",
    label: "Distribución de socios",
    filters: [],
  },
  {
    key: "class-attendance",
    path: "class-attendance",
    label: "Asistencia a clases",
    filters: ["date-range", "class-select", "trainer-select"],
  },
  { key: "class-demand", path: "class-demand", label: "Demanda de clases", filters: ["date-range"] },
  { key: "trainer-load", path: "trainer-load", label: "Carga de entrenadores", filters: [] },
  {
    key: "member-progress",
    path: "member-progress",
    label: "Progreso de un socio",
    filters: ["member-picker", "date-range"],
  },
  {
    key: "guest-passes",
    path: "guest-passes",
    label: "Uso de pases de invitado",
    filters: ["date-range", "pass-type"],
  },
  {
    key: "nutrition-adherence",
    path: "nutrition-adherence",
    label: "Adherencia nutricional",
    filters: ["date-range", "limit"],
  },
];
