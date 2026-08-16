import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeMaterial } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { Add as AddIcon } from "@mui/icons-material";
import { useClassSessions, useGroupClasses } from "@/modules/classes/hooks";
import type { ClassDiscipline, ClassSession } from "@/modules/classes/types";
import { AppDatePicker } from "@/components/AppDatePicker";
import { disciplineOptions, isoDate, sessionStatusLabel } from "@/modules/classes/components/classLabels";

ModuleRegistry.registerModules([AllCommunityModule]);

export function ClassesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [discipline, setDiscipline] = useState<ClassDiscipline | "">("");
  const [groupClassId, setGroupClassId] = useState<number | "">("");
  const [from, setFrom] = useState(isoDate(0));
  const [to, setTo] = useState(isoDate(14));

  const { data: classesData } = useGroupClasses({ page: 0, size: 100, active: true });
  const { data, isLoading, isError } = useClassSessions({
    from,
    to,
    discipline: discipline || undefined,
    group_class_id: groupClassId === "" ? undefined : Number(groupClassId),
    page: 0,
    size: 50,
  });

  const columnDefs = useMemo<ColDef<ClassSession>[]>(
    () => [
      {
        headerName: "Clase",
        flex: 1.5,
        valueGetter: (params) => params.data?.group_class_name ?? `Clase #${params.data?.group_class_id ?? "-"}`,
      },
      {
        headerName: "Disciplina",
        width: 140,
        valueGetter: (params) => params.data?.discipline ?? "-",
      },
      {
        headerName: "Fecha",
        width: 120,
        valueGetter: (params) => params.data?.session_date ?? "-",
      },
      {
        headerName: "Horario",
        width: 150,
        valueGetter: (params) => {
          const session = params.data;
          if (!session) return "-";
          return `${session.start_time ?? "--:--"}${session.duration_minutes ? ` · ${session.duration_minutes} min` : ""}`;
        },
      },
      {
        headerName: "Cupo",
        width: 120,
        valueGetter: (params) => {
          const session = params.data;
          if (!session) return "-";
          const taken = session.seats_taken ?? 0;
          const available = session.seats_available ?? 0;
          const max = session.max_capacity ?? taken + available;
          return `${available}/${max}`;
        },
      },
      {
        headerName: "Estado",
        width: 120,
        valueGetter: (params) => sessionStatusLabel[params.data?.status ?? ""] ?? params.data?.status ?? "-",
        cellStyle: (params) => {
          const status = params.data?.status;
          if (status === "CANCELLED") {
            return { color: "#d32f2f" };
          }
          return { color: "#2e7d32" };
        },
      },
      {
        headerName: "Acceso",
        width: 120,
        cellRenderer: (params: { data?: ClassSession }) => {
          const hasSeats = (params.data?.seats_available ?? 0) > 0;
          return (
            <Chip
              label={hasSeats ? "Disponible" : "Lleno"}
              color={hasSeats ? "success" : "warning"}
              size="small"
              variant="filled"
            />
          );
        },
      },
    ],
    []
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2 }}>
        <Typography variant="h4">
          Clases
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/classes/new")}
          >
            Nueva clase
          </Button>
        )}
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          select
          label="Disciplina"
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value as ClassDiscipline | "")}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {disciplineOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Clase base"
          value={groupClassId}
          onChange={(e) => setGroupClassId(e.target.value === "" ? "" : Number(e.target.value))}
          size="small"
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {(classesData?.content ?? []).map((classItem) => (
            <MenuItem key={classItem.group_class_id} value={classItem.group_class_id}>
              {classItem.name}
            </MenuItem>
          ))}
        </TextField>

        <AppDatePicker
          label="Desde"
          value={from}
          onChange={setFrom}
          size="small"
        />

        <AppDatePicker
          label="Hasta"
          value={to}
          onChange={setTo}
          size="small"
        />
      </Stack>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar la cartelera de clases.
        </Typography>
      )}

      <Paper sx={{ height: 560, width: "100%" }}>
        <AgGridReact
          theme={themeMaterial}
          rowData={data?.content ?? []}
          columnDefs={columnDefs}
          loading={isLoading}
          pagination
          paginationPageSize={15}
          suppressCellFocus
          onRowClicked={(event) => {
            if (event.data?.group_class_id) {
              navigate(`/classes/${event.data.group_class_id}`);
            }
          }}
        />
      </Paper>
    </Box>
  );
}