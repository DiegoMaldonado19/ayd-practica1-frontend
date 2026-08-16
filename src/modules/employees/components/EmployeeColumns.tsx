import type { ColDef } from "ag-grid-community";
import type { Employee, Position } from "@/modules/employees/types";
import { EmployeeStatusChip } from "./EmployeeStatusChip";

const positionLabel: Record<Position, string> = {
  ADMIN: "Administrador",
  RECEPTIONIST: "Recepcionista",
  TRAINER: "Entrenador",
};

export function buildEmployeesColumns(): ColDef<Employee>[] {
  return [
    { field: "employee_code", headerName: "Código", width: 130 },
    { headerName: "Nombre", valueGetter: (p) => p.data?.person.full_name, flex: 1 },
    {
      headerName: "Puesto",
      width: 160,
      valueGetter: (p) => (p.data ? positionLabel[p.data.position] : ""),
    },
    { field: "hired_on", headerName: "Contratado", width: 130 },
    {
      headerName: "Estado",
      width: 140,
      cellRenderer: (p: { data: Employee }) => <EmployeeStatusChip status={p.data.status} />,
    },
  ];
}