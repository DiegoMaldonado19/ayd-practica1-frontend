import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { useMember } from "@/modules/members/hooks";
import { useTrainerAssignments } from "../hooks";
import type { TrainerAssignment } from "../types";

ModuleRegistry.registerModules([AllCommunityModule]);

function MemberNameCell({ data }: { data: TrainerAssignment }) {
  const { data: member, isLoading } = useMember(data.member_id);
  if (isLoading) return <span>Cargando…</span>;
  return <span>{member?.person.full_name ?? `Socio #${data.member_id}`}</span>;
}

export function MyMembersPage() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useTrainerAssignments({
    page: 0,
    size: 100,
    active: true,
  });

  const columnDefs = useMemo<ColDef<TrainerAssignment>[]>(
    () => [
      { headerName: "Socio", cellRenderer: MemberNameCell, flex: 1 },
      { field: "start_date", headerName: "Asignado desde", width: 160 },
    ],
    [],
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Mis socios
      </Typography>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar tu cartera de socios.
        </Typography>
      )}

      <Paper sx={{ height: 520, width: "100%" }}>
        <AgGridReact
          theme={themeMaterial}
          rowData={data?.content ?? []}
          columnDefs={columnDefs}
          loading={isLoading}
          onRowClicked={(e) => e.data && navigate(`/training/members/${e.data.member_id}`)}
          rowSelection="single"
          suppressCellFocus
        />
      </Paper>
    </Box>
  );
}
