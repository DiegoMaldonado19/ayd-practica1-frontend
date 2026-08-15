import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { usePayments } from "@/modules/billing/hooks";
import { useMembers } from "@/modules/members/hooks";
import type { PaymentMethod, PaymentStatus } from "@/modules/billing/types";

const PAGE_SIZE = 12;

const statusColor: Record<string, "success" | "warning" | "error" | "default"> = {
  REGISTERED: "warning",
  CONFIRMED: "success",
  VOIDED: "error",
};

const statusLabel: Record<string, string> = {
  REGISTERED: "Registrado",
  CONFIRMED: "Confirmado",
  VOIDED: "Anulado",
};

const conceptLabel: Record<string, string> = {
  OTHER: "Otro",
  MEMBERSHIP: "Membresía",
  GUEST_PASS: "Pase de día",
};

const methodLabel: Record<string, string> = {
  CASH: "Efectivo",
  DEBIT_CARD: "Tarjeta débito",
};

export function PaymentsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePayments({ page: 0, size: 200 });
  const { data: membersData } = useMembers({ page: 0, size: 200 });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => data?.content ?? [], [data]);

  const memberNameById = useMemo(() => {
    const map = new Map<number, string>();
    (membersData?.content ?? []).forEach((member) => {
      map.set(member.member_id, member.person.full_name);
    });
    return map;
  }, [membersData]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((payment) => {
      if (status && payment.status !== status) return false;
      if (method && payment.payment_method !== method) return false;
      if (!needle) return true;

      const memberName = payment.member_id
        ? memberNameById.get(payment.member_id) ?? `Socio #${payment.member_id}`
        : "Invitado";
      const haystack = [
        memberName,
        conceptLabel[payment.concept] ?? payment.concept,
        methodLabel[payment.payment_method] ?? payment.payment_method,
        statusLabel[payment.status] ?? payment.status,
        payment.receipt_series ?? "",
        payment.receipt_number != null ? String(payment.receipt_number) : "",
        String(payment.payment_id),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [rows, status, method, search, memberNameById]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Pagos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historial de pagos y comprobantes del módulo billing.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/payments/new")}>
          Nuevo pago
        </Button>
      </Stack>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Buscar"
          placeholder="Socio, concepto, folio..."
          size="small"
          sx={{ minWidth: 260 }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
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
          label="Estado"
          size="small"
          sx={{ minWidth: 160 }}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as PaymentStatus | "");
            setPage(1);
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {(Object.keys(statusLabel) as PaymentStatus[]).map((s) => (
            <MenuItem key={s} value={s}>
              {statusLabel[s]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Método"
          size="small"
          sx={{ minWidth: 180 }}
          value={method}
          onChange={(e) => {
            setMethod(e.target.value as PaymentMethod | "");
            setPage(1);
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {(Object.keys(methodLabel) as PaymentMethod[]).map((m) => (
            <MenuItem key={m} value={m}>
              {methodLabel[m]}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el historial de pagos.
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Socio</TableCell>
              <TableCell>Concepto</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Monto original</TableCell>
              <TableCell align="right">Descuento</TableCell>
              <TableCell align="right">Total pagado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Cargando pagos...
                </TableCell>
              </TableRow>
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No hay pagos registrados.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((payment) => {
                const gross = Number(payment.gross_amount ?? payment.amount ?? 0);
                const net =
                  typeof payment.net_amount === "number"
                    ? Number(payment.net_amount)
                    : Math.max(gross - Number(payment.discount_amount ?? 0), 0);
                const discount = Math.max(gross - net, 0);
                const fmt = (n: number) =>
                  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                return (
                  <TableRow key={payment.payment_id} hover>
                    <TableCell>{payment.payment_id}</TableCell>
                    <TableCell>
                      {payment.member_id ? memberNameById.get(payment.member_id) ?? `Socio #${payment.member_id}` : "Invitado"}
                    </TableCell>
                    <TableCell>{conceptLabel[payment.concept] ?? payment.concept}</TableCell>
                    <TableCell>{methodLabel[payment.payment_method] ?? payment.payment_method}</TableCell>
                    <TableCell>
                      <Chip label={statusLabel[payment.status] ?? payment.status} color={statusColor[payment.status] ?? "default"} size="small" />
                    </TableCell>
                    <TableCell align="right">Q {fmt(gross)}</TableCell>
                    <TableCell align="right" sx={{ color: discount > 0 ? "success.main" : "text.disabled" }}>
                      {discount > 0 ? `-Q ${fmt(discount)}` : "—"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Q {fmt(net)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filtered.length} pago(s) · página {safePage} de {totalPages}
        </Typography>
        <Pagination
          count={totalPages}
          page={safePage}
          onChange={(_, value) => setPage(value)}
          color="primary"
          shape="rounded"
          size="small"
          showFirstButton
          showLastButton
        />
      </Stack>
    </Box>
  );
}
