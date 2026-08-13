import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Add as AddIcon } from "@mui/icons-material";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeMaterial } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { useMembershipPlans, useUpdateMembershipPlanStatus } from "@/modules/membership/hooks";
import type { MembershipPlan } from "@/modules/membership/types";

ModuleRegistry.registerModules([AllCommunityModule]);

const billingPeriodLabel: Record<string, string> = {
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  ANNUAL: "Anual",
};

function StatusButton({ plan }: { plan: MembershipPlan }) {
  const updateStatus = useUpdateMembershipPlanStatus(plan.membership_plan_id);
  return (
    <Button
      size="small"
      color={plan.active ? "error" : "success"}
      disabled={updateStatus.isPending}
      onClick={(e) => {
        e.stopPropagation();
        updateStatus.mutate({ active: !plan.active });
      }}
    >
      {plan.active ? "Desactivar" : "Activar"}
    </Button>
  );
}

export function MembershipPlansListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useMembershipPlans({ page, size: 20, sort: "tier,asc" });

  const columnDefs = useMemo<ColDef<MembershipPlan>[]>(
    () => [
      { field: "code", headerName: "Código", width: 110 },
      { field: "name", headerName: "Nombre", flex: 1 },
      {
        headerName: "Precio",
        width: 110,
        valueGetter: (p) => (p.data ? `Q ${Number(p.data.price).toFixed(2)}` : ""),
      },
      {
        headerName: "Periodo",
        width: 120,
        valueGetter: (p) => (p.data ? billingPeriodLabel[p.data.billing_period] ?? p.data.billing_period : ""),
      },
      { field: "tier", headerName: "Nivel", width: 90 },
      {
        headerName: "Clases grupales",
        width: 150,
        valueGetter: (p) =>
          p.data?.includes_group_classes
            ? p.data.weekly_class_limit
              ? `Hasta ${p.data.weekly_class_limit}/semana`
              : "Ilimitadas"
            : "No incluye",
      },
      {
        headerName: "Entrenador personal",
        width: 160,
        valueGetter: (p) => (p.data?.includes_personal_trainer ? "Sí" : "No"),
      },
      {
        headerName: "Estado",
        width: 120,
        cellRenderer: (p: { data?: MembershipPlan }) =>
          p.data ? (
            <Chip
              size="small"
              label={p.data.active ? "Activo" : "Inactivo"}
              color={p.data.active ? "success" : "default"}
            />
          ) : null,
      },
      {
        headerName: "Acciones",
        width: 130,
        cellRenderer: (p: { data?: MembershipPlan }) =>
          p.data ? <StatusButton plan={p.data} /> : null,
      },
    ],
    []
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Planes de membresía</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/membership-plans/new")}>
          Nuevo plan
        </Button>
      </Box>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el catálogo de planes.
        </Typography>
      )}

      <Paper sx={{ height: 520, width: "100%" }}>
        <AgGridReact
          theme={themeMaterial}
          rowData={data?.content ?? []}
          columnDefs={columnDefs}
          defaultColDef={{
            tooltipValueGetter: () => "Hacer clic para editar",
          }}
          tooltipShowDelay={150}
          loading={isLoading}
          onRowClicked={(e) => e.data && navigate(`/membership-plans/${e.data.membership_plan_id}/edit`)}
          rowSelection="single"
          suppressCellFocus
        />
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {data
            ? `${data.page.total_elements} planes · página ${data.page.number + 1} de ${Math.max(data.page.total_pages, 1)}`
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