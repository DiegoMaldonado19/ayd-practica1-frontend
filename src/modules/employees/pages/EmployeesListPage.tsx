import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, TextField, MenuItem, Chip, Paper } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { useEmployees } from "@/modules/employees/hooks";
import type { Employee, EmployeeStatus, Position } from "@/modules/employees/types";

ModuleRegistry.registerModules([AllCommunityModule]);

const statusLabel: Record<EmployeeStatus, string> = {
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  TERMINATED: "Terminado",
};
const statusColor: Record<EmployeeStatus, "success" | "warning" | "error"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  TERMINATED: "error",
};
const positionLabel: Record<Position, string> = {
  ADMIN: "Administrador",
  RECEPTIONIST: "Recepcionista",
  TRAINER: "Entrenador",
};

export function EmployeesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<Position | "">("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useEmployees({
    page,
    size: 20,
    search: search || undefined,
    position: position || undefined,
  });

  const columnDefs = useMemo<ColDef<Employee>[]>(
    () => [
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
        cellRenderer: (p: { data: Employee }) => (
          <Chip size="small" label={statusLabel[p.data.status]} color={statusColor[p.data.status]} />
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Personal</Typography>
        <Button variant="contained" onClick={() => navigate("/employees/new")}>
          Nuevo empleado
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Buscar"
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
          size="small"
          sx={{ minWidth: 280 }}
        />
        <TextField
          select
          label="Puesto"
          value={position}
          onChange={(e) => {
            setPage(0);
            setPosition(e.target.value as Position | "");
          }}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="ADMIN">Administrador</MenuItem>
          <MenuItem value="RECEPTIONIST">Recepcionista</MenuItem>
          <MenuItem value="TRAINER">Entrenador</MenuItem>
        </TextField>
      </Box>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el listado de personal.
        </Typography>
      )}

      <Paper sx={{ height: 520, width: "100%" }}>
        <AgGridReact
          theme={themeMaterial}
          rowData={data?.content ?? []}
          columnDefs={columnDefs}
          loading={isLoading}
          onRowClicked={(e) => e.data && navigate(`/employees/${e.data.employee_id}`)}
          rowSelection="single"
          suppressCellFocus
        />
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {data
            ? `${data.page.total_elements} empleados · página ${data.page.number + 1} de ${Math.max(data.page.total_pages, 1)}`
            : ""}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <Button size="small" disabled={!data || page + 1 >= data.page.total_pages} onClick={() => setPage((p) => p + 1)}>
            Siguiente
          </Button>
        </Box>
      </Box>
    </Box>
  );
}