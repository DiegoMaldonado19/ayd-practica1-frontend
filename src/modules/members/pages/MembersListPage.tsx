import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { useMembers } from "@/modules/members/hooks";
import type { Member, MemberStatus } from "@/modules/members/types";
import { buildMembersColumns } from "@/modules/members/components/MemberColumns";
import { MemberFiltersBar } from "@/modules/members/components/MemberFiltersBar";
import { MembersPagination } from "@/modules/members/components/MembersPagination";

ModuleRegistry.registerModules([AllCommunityModule]);

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

  const columnDefs = useMemo<ColDef[]>(() => buildMembersColumns(), []);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
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

        <Button variant="contained" onClick={() => navigate("/members/new")}>
          Nuevo socio
        </Button>
      </Stack>

      <MemberFiltersBar
        search={search}
        status={status}
        onSearchChange={(value) => {
          setPage(0);
          setSearch(value);
        }}
        onStatusChange={(value) => {
          setPage(0);
          setStatus(value);
        }}
      />

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
          onRowClicked={(e) => e.data && navigate(`/members/${e.data.member_id}`)}
          rowSelection="single"
          suppressCellFocus
        />
      </Paper>

      <MembersPagination
        countText={
          data
            ? `${data.page.total_elements} socios · página ${data.page.number + 1} de ${Math.max(data.page.total_pages, 1)}`
            : ""
        }
        disabledPrev={page === 0}
        disabledNext={!data || page + 1 >= data.page.total_pages}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />
    </Box>
  );
}