import Chip from "@mui/material/Chip";
import type { EmployeeStatus } from "@/modules/employees/types";

const STATUS_LABEL: Record<EmployeeStatus, string> = {
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  TERMINATED: "Terminado",
};

const STATUS_COLOR: Record<EmployeeStatus, "success" | "warning" | "error"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  TERMINATED: "error",
};

export function EmployeeStatusChip({
  status,
  size = "small",
}: {
  status: EmployeeStatus;
  size?: "small" | "medium";
}) {
  return <Chip size={size} label={STATUS_LABEL[status]} color={STATUS_COLOR[status]} />;
}