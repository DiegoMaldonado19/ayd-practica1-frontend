import { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const FIELD_LABEL: Record<string, string> = {
  period: "Periodo",
  plan_name: "Plan",
  gross_amount: "Monto bruto",
  discount_amount: "Descuento",
  net_amount: "Monto neto",
  membership_id: "ID de membresía",
  member_name: "Socio",
  status: "Estado",
  end_date: "Fecha de vencimiento",
  days_to_expiry: "Días para vencer",
  member_count: "Cantidad de socios",
  session_id: "ID de sesión",
  class_name: "Clase",
  trainer_name: "Entrenador",
  session_date: "Fecha",
  session_time: "Hora",
  attended_count: "Asistieron",
  absent_count: "Ausentes",
  cancelled_count: "Cancelados",
  attendance_rate: "% de asistencia",
  class_id: "ID de clase",
  total_sessions: "Sesiones totales",
  total_enrollments: "Inscripciones totales",
  average_occupancy_rate: "% de ocupación promedio",
  waitlist_activations_count: "Activaciones de lista de espera",
  trainer_id: "ID de entrenador",
  assigned_member_count: "Socios asignados",
  max_member_load: "Carga máxima",
  available_slots: "Cupos disponibles",
  measurement_id: "ID de medición",
  measured_on: "Fecha de medición",
  weight_kg: "Peso (kg)",
  weight_change_kg: "Cambio de peso (kg)",
  body_fat_percent: "% de grasa corporal",
  waist_cm: "Cintura (cm)",
  arm_cm: "Brazo (cm)",
  leg_cm: "Pierna (cm)",
  notes: "Notas",
  guest_pass_id: "ID de pase",
  guest_name: "Invitado",
  pass_type: "Tipo de pase",
  visit_date: "Fecha de visita",
  converted_to_member: "Se hizo socio",
  amount_paid: "Monto pagado",
  days_logged: "Días registrados",
  average_daily_calories: "Calorías diarias promedio",
  nutrition_goal_calories: "Meta calórica",
  days_within_goal: "Días dentro de la meta",
  adherence_rate: "% de adherencia",
};

function humanize(field: string): string {
  return FIELD_LABEL[field] ?? field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ReportResultsTableProps {
  rows: Record<string, unknown>[];
  isLoading: boolean;
  isError: boolean;
}

export function ReportResultsTable({ rows, isLoading, isError }: ReportResultsTableProps) {
  const columnDefs = useMemo<ColDef[]>(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).map((field) => ({
      field,
      headerName: humanize(field),
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => (typeof p.value === "boolean" ? (p.value ? "Sí" : "No") : p.value ?? "—"),
    }));
  }, [rows]);

  if (isError) {
    return (
      <Typography color="error" sx={{ mb: 2 }}>
        No se pudo generar el reporte.
      </Typography>
    );
  }

  if (!isLoading && rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        No hay datos para los filtros seleccionados.
      </Typography>
    );
  }

  return (
    <Box sx={{ height: 520, width: "100%" }}>
      <AgGridReact theme={themeMaterial} rowData={rows} columnDefs={columnDefs} loading={isLoading} suppressCellFocus />
    </Box>
  );
}
