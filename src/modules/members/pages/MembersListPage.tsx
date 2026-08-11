import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Paper,
  Stack,
  InputAdornment,
} from "@mui/material";
//import SearchIcon from "@mui/icons-material/Search";
//import AddIcon from "@mui/icons-material/Add";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeMaterial,
} from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { useMembers } from "@/modules/members/hooks";
import type { Member, MemberStatus } from "@/modules/members/types";

ModuleRegistry.registerModules([AllCommunityModule]);

const statusLabel: Record<MemberStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  WITHDRAWN: "Retirado",
};

const statusColor: Record<MemberStatus, "success" | "default" | "error"> = {
  ACTIVE: "success",
  INACTIVE: "default",
  WITHDRAWN: "error",
};

export function MembersListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MemberStatus | "">("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading, isError } = useMembers({
    page,
    size: pageSize,
    search: search || undefined,
    status: status || undefined,
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: "member_code", headerName: "Código", width: 130 },
      {
        headerName: "Nombre",
        valueGetter: (p) => p.data?.person.full_name,
        flex: 1,
      },
      {
        headerName: "Documento",
        valueGetter: (p) =>
          `${p.data?.person.document_type} ${p.data?.person.document_number}`,
        width: 180,
      },
      {
        headerName: "Correo",
        valueGetter: (p) => p.data?.person.email ?? "—",
        flex: 1,
      },
      { field: "joined_on", headerName: "Ingreso", width: 130 },
      {
        headerName: "Estado",
        width: 130,
        cellRenderer: (p: { data: Member }) => (
          <Chip
            label={statusLabel[p.data.status]}
            color={statusColor[p.data.status]}
            size="small"
          />
        ),
      },
    ],
    []
  );

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Socios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Busca, filtra y entra al detalle de cada socio desde esta pantalla.
          </Typography>
        </Box>

        <Button variant="contained" onClick={() => navigate("/members/new")}>  Nuevo socio</Button>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2,
          borderRadius: 3,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            fullWidth
            label="Buscar por nombre o documento"
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            size="small"
          />

          <TextField
            select
            label="Estado"
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value as MemberStatus | "");
            }}
            size="small"
            sx={{ minWidth: { xs: "100%", md: 180 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ACTIVE">Activo</MenuItem>
            <MenuItem value="INACTIVE">Inactivo</MenuItem>
            <MenuItem value="WITHDRAWN">Retirado</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el listado de socios. Intenta de nuevo.
        </Typography>
      )}

      <Paper
        variant="outlined"
        sx={{
          height: 540,
          width: "100%",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <AgGridReact<Member>
          theme={themeMaterial}
          rowData={data?.content ?? []}
          columnDefs={columnDefs}
          loading={isLoading}
          onRowClicked={(e) =>
            e.data && navigate(`/members/${e.data.member_id}`)
          }
          rowSelection="single"
          suppressCellFocus
        />
      </Paper>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mt: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          {data
            ? `${data.page.total_elements} socios · página ${
                data.page.number + 1
              } de ${Math.max(data.page.total_pages, 1)}`
            : ""}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>

          <Button
            size="small"
            disabled={!data || page + 1 >= data.page.total_pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}