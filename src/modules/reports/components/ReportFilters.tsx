import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { AppDatePicker } from "@/components/AppDatePicker";
import { useMembershipPlans } from "@/modules/membership/hooks";
import { useTrainers } from "@/modules/trainers/hooks";
import { useGroupClasses } from "@/modules/classes/hooks";
import { MemberPicker } from "./MemberPicker";
import type { ReportFilterField } from "../types";

export interface ReportFilterValues {
  from?: string;
  to?: string;
  group_by?: "WEEK" | "MONTH";
  plan_id?: number;
  status?: string;
  expiring_in_days?: number;
  group_class_id?: number;
  trainer_id?: number;
  member_id?: number;
  pass_type?: string;
  limit?: number;
}

interface ReportFiltersProps {
  fields: ReportFilterField[];
  values: ReportFilterValues;
  onChange: (patch: Partial<ReportFilterValues>) => void;
}

const MEMBERSHIP_STATUSES = ["ACTIVE", "FROZEN", "EXPIRED", "CANCELLED"];

export function ReportFilters({ fields, values, onChange }: ReportFiltersProps) {
  const needsPlans = fields.includes("plan-select");
  const needsTrainers = fields.includes("trainer-select");
  const needsClasses = fields.includes("class-select");

  const { data: plansPage } = useMembershipPlans({ page: 0, size: 100 });
  const { data: trainersPage } = useTrainers({ page: 0, size: 100 });
  const { data: classesPage } = useGroupClasses({ page: 0, size: 100 });

  if (fields.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
      {fields.includes("date-range") && (
        <>
          <AppDatePicker
            label="Desde"
            value={values.from ?? ""}
            onChange={(value) => onChange({ from: value || undefined })}
            size="small"
            sx={{ minWidth: 160 }}
          />
          <AppDatePicker
            label="Hasta"
            value={values.to ?? ""}
            onChange={(value) => onChange({ to: value || undefined })}
            size="small"
            sx={{ minWidth: 160 }}
          />
        </>
      )}

      {fields.includes("group-by") && (
        <TextField
          select
          label="Agrupar por"
          value={values.group_by ?? ""}
          onChange={(e) => onChange({ group_by: (e.target.value || undefined) as "WEEK" | "MONTH" | undefined })}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Sin agrupar</MenuItem>
          <MenuItem value="WEEK">Semana</MenuItem>
          <MenuItem value="MONTH">Mes</MenuItem>
        </TextField>
      )}

      {needsPlans && (
        <TextField
          select
          label="Plan"
          value={values.plan_id ?? ""}
          onChange={(e) => onChange({ plan_id: e.target.value === "" ? undefined : Number(e.target.value) })}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {(plansPage?.content ?? []).map((plan) => (
            <MenuItem key={plan.membership_plan_id} value={plan.membership_plan_id}>
              {plan.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      {needsTrainers && (
        <TextField
          select
          label="Entrenador"
          value={values.trainer_id ?? ""}
          onChange={(e) => onChange({ trainer_id: e.target.value === "" ? undefined : Number(e.target.value) })}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {(trainersPage?.content ?? []).map((trainer) => (
            <MenuItem key={trainer.trainer_id} value={trainer.trainer_id}>
              {trainer.person.full_name}
            </MenuItem>
          ))}
        </TextField>
      )}

      {needsClasses && (
        <TextField
          select
          label="Clase"
          value={values.group_class_id ?? ""}
          onChange={(e) => onChange({ group_class_id: e.target.value === "" ? undefined : Number(e.target.value) })}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {(classesPage?.content ?? []).map((groupClass) => (
            <MenuItem key={groupClass.group_class_id} value={groupClass.group_class_id}>
              {groupClass.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      {fields.includes("member-picker") && (
        <Box sx={{ minWidth: 260 }}>
          <MemberPicker
            value={values.member_id ?? null}
            onChange={(memberId) => onChange({ member_id: memberId ?? undefined })}
          />
        </Box>
      )}

      {fields.includes("status") && (
        <TextField
          select
          label="Estado"
          value={values.status ?? ""}
          onChange={(e) => onChange({ status: e.target.value || undefined })}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {MEMBERSHIP_STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
      )}

      {fields.includes("expiring-in-days") && (
        <TextField
          type="number"
          label="Vencen en (días)"
          value={values.expiring_in_days ?? ""}
          onChange={(e) =>
            onChange({ expiring_in_days: e.target.value === "" ? undefined : Number(e.target.value) })
          }
          size="small"
          sx={{ minWidth: 160 }}
        />
      )}

      {fields.includes("pass-type") && (
        <TextField
          label="Tipo de pase"
          value={values.pass_type ?? ""}
          onChange={(e) => onChange({ pass_type: e.target.value || undefined })}
          size="small"
          sx={{ minWidth: 160 }}
        />
      )}

      {fields.includes("limit") && (
        <TextField
          type="number"
          label="Límite de resultados"
          value={values.limit ?? ""}
          onChange={(e) => onChange({ limit: e.target.value === "" ? undefined : Number(e.target.value) })}
          size="small"
          sx={{ minWidth: 160 }}
        />
      )}
    </Box>
  );
}
