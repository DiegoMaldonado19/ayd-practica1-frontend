// src/modules/trainers/pages/TrainersListPage.tsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, MenuItem, Chip, Paper, Button } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { useTrainers } from "@/modules/trainers/hooks";
import type { Trainer, Specialty } from "@/modules/trainers/types";

ModuleRegistry.registerModules([AllCommunityModule]);

const specialtyLabel: Record<Specialty, string> = {
  WEIGHT_LOSS: "Pérdida de peso",
  MUSCLE_GAIN: "Ganancia muscular",
  REHABILITATION: "Rehabilitación",
  FUNCTIONAL: "Funcional",
  CARDIO: "Cardio",
};

export function TrainersListPage() {
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState<Specialty | "">("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useTrainers({
    page,
    size: 20,
    specialty: specialty || undefined,
  });

  const columnDefs = useMemo<ColDef<Trainer>[]>(
    () => [
      { headerName: "Nombre", valueGetter: (p) => p.data?.person.full_name, flex: 1 },
      { field: "max_member_load", headerName: "Carga máxima", width: 140 },
      {
        headerName: "Especialidades",
        flex: 1.5,
        cellRenderer: (p: { data: Trainer }) => (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {p.data.specialties.map((s) => (
              <Chip key={s} size="small" label={specialtyLabel[s]} />
            ))}
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Entrenadores
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          select
          label="Especialidad"
          value={specialty}
          onChange={(e) => {
            setPage(0);
            setSpecialty(e.target.value as Specialty | "");
          }}
          size="small"
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {Object.entries(specialtyLabel).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el listado de entrenadores.
        </Typography>
      )}

      <Paper sx={{ height: 520, width: "100%" }}>
        <AgGridReact
          theme={themeMaterial}
          rowData={data?.content ?? []}
          columnDefs={columnDefs}
          loading={isLoading}
          onRowClicked={(e) => e.data && navigate(`/trainers/${e.data.trainer_id}`)}
          rowSelection="single"
          suppressCellFocus
        />
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {data ? `${data.page.total_elements} entrenadores · página ${data.page.number + 1} de ${Math.max(data.page.total_pages, 1)}` : ""}
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