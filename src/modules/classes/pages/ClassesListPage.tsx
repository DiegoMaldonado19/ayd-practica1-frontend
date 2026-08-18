import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { Box, Button, Chip, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeMaterial } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { useGroupClasses } from "@/modules/classes/hooks";
import type { ClassDiscipline, GroupClass } from "@/modules/classes/types";
import { disciplineLabel, disciplineOptions, weekdayLabel } from "@/modules/classes/components/classLabels";

ModuleRegistry.registerModules([AllCommunityModule]);

export function ClassesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [discipline, setDiscipline] = useState<ClassDiscipline | "">("");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useGroupClasses({ page: 0, size: 200, active: true });

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (data?.content ?? []).filter((groupClass) => {
      if (discipline && groupClass.discipline !== discipline) return false;
      if (!needle) return true;
      return `${groupClass.code} ${groupClass.name}`.toLowerCase().includes(needle);
    });
  }, [data, search, discipline]);

  const columnDefs = useMemo<ColDef<GroupClass>[]>(
    () => [
      { field: "code", headerName: "Código", width: 120 },
      {
        field: "name",
        headerName: "Curso",
        flex: 1.5,
        valueGetter: (params) => params.data?.name ?? "—",
      },
      {
        headerName: "Disciplina",
        width: 140,
        valueGetter: (params) => (params.data?.discipline ? disciplineLabel[params.data.discipline] ?? params.data.discipline : "—"),
      },
      {
        headerName: "Día",
        width: 120,
        valueGetter: (params) => (params.data?.weekday ? weekdayLabel[params.data.weekday] ?? params.data.weekday : "—"),
      },
      {
        headerName: "Horario",
        width: 160,
        valueGetter: (params) => {
          const groupClass = params.data;
          if (!groupClass) return "—";
          return `${groupClass.start_time ?? "--:--"}${groupClass.duration_minutes ? ` · ${groupClass.duration_minutes} min` : ""}`;
        },
      },
      {
        headerName: "Cupo máximo",
        width: 130,
        valueGetter: (params) => params.data?.max_capacity ?? "—",
      },
      {
        headerName: "Estado",
        width: 120,
        cellRenderer: (params: { data?: GroupClass }) => (
          <Chip
            label={params.data?.active ? "Activa" : "Inactiva"}
            color={params.data?.active ? "success" : "default"}
            size="small"
            variant="filled"
          />
        ),
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
          label="Buscar"
          placeholder="Código o nombre del curso..."
          size="small"
          sx={{ minWidth: 260 }}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Disciplina"
          value={discipline}
          onChange={(event) => setDiscipline(event.target.value as ClassDiscipline | "")}
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
      </Stack>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar la cartelera de clases.
        </Typography>
      )}

      <Paper sx={{ height: 560, width: "100%" }}>
        <AgGridReact
          theme={themeMaterial}
          rowData={rows}
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
