import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { useCloseAssignment, useTrainerAssignments } from "../hooks";
import { AssignTrainerDialog } from "../components/AssignTrainerDialog";
import type { AssignmentEndReason, TrainerAssignment } from "../types";

ModuleRegistry.registerModules([AllCommunityModule]);

const END_REASON_LABEL: Record<AssignmentEndReason, string> = {
  REASSIGNMENT: "Reasignación",
  TRAINER_LEFT: "Entrenador dado de baja",
  PLAN_DOWNGRADE: "Cambio de plan",
  MEMBER_REQUEST: "Solicitud del socio",
};

export function AssignmentsPage() {
  const [page, setPage] = useState(0);
  const [activeOnly, setActiveOnly] = useState<"" | "true" | "false">("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [closingAssignment, setClosingAssignment] = useState<TrainerAssignment | null>(null);
  const [endReason, setEndReason] = useState<AssignmentEndReason>("REASSIGNMENT");

  const { data, isLoading, isError } = useTrainerAssignments({
    page,
    size: 20,
    active: activeOnly === "" ? undefined : activeOnly === "true",
  });

  const closeAssignment = useCloseAssignment(
    closingAssignment?.trainer_assignment_id ?? 0,
    closingAssignment?.member_id,
  );

  const closeCloseDialog = () => {
    setClosingAssignment(null);
    setEndReason("REASSIGNMENT");
    closeAssignment.reset();
  };

  const columnDefs = useMemo<ColDef<TrainerAssignment>[]>(
    () => [
      { field: "member_id", headerName: "ID del socio", width: 120 },
      { field: "trainer_id", headerName: "ID del entrenador", width: 150 },
      { field: "start_date", headerName: "Inicio", width: 130 },
      { field: "end_date", headerName: "Fin", width: 130, valueGetter: (p) => p.data?.end_date ?? "—" },
      {
        headerName: "Motivo de cierre",
        flex: 1,
        valueGetter: (p) => (p.data?.end_reason ? END_REASON_LABEL[p.data.end_reason] : "—"),
      },
      {
        headerName: "Acciones",
        width: 150,
        cellRenderer: (p: { data: TrainerAssignment }) =>
          !p.data.end_date && (
            <Button size="small" color="warning" onClick={() => setClosingAssignment(p.data)}>
              Cerrar
            </Button>
          ),
      },
    ],
    [],
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Asignaciones de entrenador</Typography>
        <Button variant="contained" onClick={() => setAssignOpen(true)}>
          Asignar entrenador
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          select
          label="Estado"
          value={activeOnly}
          onChange={(e) => {
            setPage(0);
            setActiveOnly(e.target.value as "" | "true" | "false");
          }}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="true">Activas</MenuItem>
          <MenuItem value="false">Cerradas</MenuItem>
        </TextField>
      </Box>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el listado de asignaciones.
        </Typography>
      )}

      <Paper sx={{ height: 520, width: "100%" }}>
        <AgGridReact
          theme={themeMaterial}
          rowData={data?.content ?? []}
          columnDefs={columnDefs}
          loading={isLoading}
          suppressCellFocus
        />
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {data
            ? `${data.page.total_elements} asignaciones · página ${data.page.number + 1} de ${Math.max(data.page.total_pages, 1)}`
            : ""}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <Button
            size="small"
            disabled={!data || page + 1 >= data.page.total_pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </Box>
      </Box>

      <AssignTrainerDialog open={assignOpen} onClose={() => setAssignOpen(false)} />

      <Dialog open={!!closingAssignment} onClose={closeCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>Cerrar asignación</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Motivo"
            value={endReason}
            onChange={(e) => setEndReason(e.target.value as AssignmentEndReason)}
            fullWidth
            sx={{ mt: 1 }}
          >
            {(Object.keys(END_REASON_LABEL) as AssignmentEndReason[]).map((reason) => (
              <MenuItem key={reason} value={reason}>
                {END_REASON_LABEL[reason]}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeCloseDialog} disabled={closeAssignment.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="warning"
            disabled={closeAssignment.isPending}
            onClick={() =>
              closeAssignment.mutate({ end_reason: endReason }, { onSuccess: closeCloseDialog })
            }
          >
            {closeAssignment.isPending ? "Cerrando..." : "Cerrar asignación"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
