import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Add as AddIcon } from "@mui/icons-material";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeMaterial,
} from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import {
  useCreateMembership,
  useMembershipPlans,
  useMemberships,
} from "@/modules/membership/hooks";
import {
  membershipStatusColor,
  membershipStatusLabel,
} from "@/modules/membership/labels";
import type {
  Membership,
  MembershipStatus,
} from "@/modules/membership/types";
import { MemberSelect } from "@/modules/membership/components/MemberSelect";
import type { Member } from "@/modules/members/types";
import { AppDatePicker } from "@/components/AppDatePicker";
import { useAuth } from "@/auth/useAuth";
import { useMembers } from "@/modules/members/hooks";

ModuleRegistry.registerModules([AllCommunityModule]);

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function ContractDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [member, setMember] = useState<Member | null>(null);
  const [planId, setPlanId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState({ start: false });
  const createMembership = useCreateMembership();
  const { data: plans } = useMembershipPlans({
    page: 0,
    size: 50,
    active: true,
  });

  const today = todayISO();
  const startError = touched.start
    ? startDate
      ? startDate < today
        ? "La fecha de inicio no puede ser anterior a hoy"
        : ""
      : ""
    : "";
  const memberError =
    member && member.status === "WITHDRAWN"
      ? "El socio está dado de baja y no puede contratar"
      : "";
  const isValid =
    !!member && !memberError && planId !== "" && !startError;

  const clean = () => {
    setMember(null);
    setPlanId("");
    setStartDate("");
    setNotes("");
    setTouched({ start: false });
  };

  const submit = () => {
    // Validación defensiva antes de enviar, por si el usuario no pasó por onBlur.
    setTouched({ start: true });
    if (!isValid) return;
    createMembership.mutate(
      {
        member_id: member!.member_id,
        membership_plan_id: Number(planId),
        start_date: startDate || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          clean();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Contratar membresía</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <MemberSelect
            value={member}
            onChange={(m) => setMember(m)}
            error={!!memberError}
            helperText={
              memberError ||
              "El socio no debe tener un contrato vigente o congelado"
            }
          />
          <TextField
            select
            label="Plan"
            value={planId}
            onChange={(e) =>
              setPlanId(e.target.value === "" ? "" : Number(e.target.value))
            }
            fullWidth
          >
            {(plans?.content ?? []).map((plan) => (
              <MenuItem
                key={plan.membership_plan_id}
                value={plan.membership_plan_id}
              >
                {plan.name} · Q {Number(plan.price).toFixed(2)}
              </MenuItem>
            ))}
          </TextField>
          <AppDatePicker
            label="Fecha de inicio"
            fullWidth
            minDate={today}
            value={startDate}
            onChange={setStartDate}
            onBlur={() => setTouched((t) => ({ ...t, start: true }))}
            error={!!startError}
            helperText={startError || "Vacía = hoy"}
          />
          <TextField
            label="Notas"
            fullWidth
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={createMembership.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!isValid || createMembership.isPending}
          onClick={submit}
        >
          {createMembership.isPending ? "Contratando..." : "Contratar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function MembershipsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "RECEPTIONIST";

  const [status, setStatus] = useState<MembershipStatus | "">("");
  const [planId, setPlanId] = useState<number | "">("");
  const [expiringInput, setExpiringInput] = useState("");
  const [expiringInDays, setExpiringInDays] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: plans } = useMembershipPlans({ page: 0, size: 50 });

  const { data: membersData } = useMembers({ page: 0, size: 500 });
  const memberNameById = useMemo(() => {
    const map = new Map<number, string>();
    (membersData?.content ?? []).forEach((member) => {
      map.set(member.member_id, member.person.full_name);
    });
    return map;
  }, [membersData]);

  const { data, isLoading, isError } = useMemberships({
    page,
    size: 20,
    sort: "endDate,asc",
    status: status || undefined,
    plan_id: planId === "" ? undefined : planId,
    expiring_in_days: expiringInDays,
  });

  const applyExpiring = () => {
    if (expiringInput === "") {
      setExpiringInDays(undefined);
      return;
    }
    const n = Number(expiringInput);
    // Validación: días debe ser entero positivo, no negativo ni 0.
    if (Number.isFinite(n) && Number.isInteger(n) && n > 0) {
      setExpiringInDays(n);
    } else {
      setExpiringInDays(undefined);
    }
  };

  const columnDefs = useMemo<ColDef<Membership>[]>(
    () => [
      { field: "membership_id", headerName: "ID", width: 80 },
      {
        headerName: "Socio",
        width: 220,
        valueGetter: (p) =>
          p.data ? memberNameById.get(p.data.member_id) ?? `Socio #${p.data.member_id}` : "",
      },
      {
        headerName: "Plan",
        flex: 1,
        valueGetter: (p) =>
          p.data ? `${p.data.plan.name} (${p.data.plan.code})` : "",
      },
      {
        headerName: "Estado",
        width: 130,
        cellRenderer: (p: { data?: Membership }) =>
          p.data ? (
            <Chip
              size="small"
              label={membershipStatusLabel[p.data.status]}
              color={membershipStatusColor[p.data.status]}
            />
          ) : null,
      },
      { field: "start_date", headerName: "Inicio", width: 120 },
      { field: "end_date", headerName: "Vence", width: 120 },
      { field: "days_remaining", headerName: "Días restantes", width: 130 },
      {
        headerName: "Precio pagado",
        width: 130,
        valueGetter: (p) =>
          p.data ? `Q ${Number(p.data.paid_price).toFixed(2)}` : "",
      },
    ],
    [memberNameById]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Membresías</Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Contratar membresía
          </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          select
          label="Estado"
          value={status}
          onChange={(e) => {
            setPage(0);
            setStatus(e.target.value as MembershipStatus | "");
          }}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {(Object.keys(membershipStatusLabel) as MembershipStatus[]).map(
            (s) => (
              <MenuItem key={s} value={s}>
                {membershipStatusLabel[s]}
              </MenuItem>
            )
          )}
        </TextField>
        <TextField
          select
          label="Plan"
          value={planId}
          onChange={(e) => {
            setPage(0);
            setPlanId(e.target.value === "" ? "" : Number(e.target.value));
          }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {(plans?.content ?? []).map((plan) => (
            <MenuItem
              key={plan.membership_plan_id}
              value={plan.membership_plan_id}
            >
              {plan.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Vence en (días)"
          size="small"
          type="number"
          value={expiringInput}
          onChange={(e) => setExpiringInput(e.target.value)}
          onBlur={applyExpiring}
          onKeyDown={(e) => e.key === "Enter" && applyExpiring()}
          inputProps={{ min: 1, step: 1 }}
          sx={{ minWidth: 150 }}
          helperText="Entero positivo · Enter o clic fuera para aplicar"
        />
      </Box>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el listado de membresías.
        </Typography>
      )}

      <Paper sx={{ height: 520, width: "100%" }}>
        <AgGridReact
          theme={themeMaterial}
          rowData={data?.content ?? []}
          columnDefs={columnDefs}
          loading={isLoading}
          onRowClicked={(e) =>
            e.data && navigate(`/memberships/${e.data.membership_id}`)
          }
          rowSelection="single"
          suppressCellFocus
        />
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {data
            ? `${data.page.total_elements} contratos · página ${data.page.number + 1} de ${Math.max(data.page.total_pages, 1)}`
            : ""}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
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
        </Box>
      </Box>

      <ContractDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}