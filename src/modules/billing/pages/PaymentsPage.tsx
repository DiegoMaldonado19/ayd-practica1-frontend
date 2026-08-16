import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useAuth } from "@/auth/useAuth";
import { useConfirmPayment, usePayments, useVoidPayment } from "@/modules/billing/hooks";
import { useMembers } from "@/modules/members/hooks";
import type { Payment, PaymentMethod, PaymentStatus } from "@/modules/billing/types";
import {
  paymentConceptLabel,
  paymentMethodLabel,
  paymentStatusLabel,
} from "@/modules/billing/billingLabels";
import { PaymentsFiltersBar } from "@/modules/billing/components/PaymentsFiltersBar";
import { PaymentsTable } from "@/modules/billing/components/PaymentsTable";
import { ListPagination } from "@/modules/billing/components/ListPagination";

const PAGE_SIZE = 12;

export function PaymentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data, isLoading, isError } = usePayments({ page: 0, size: 200 });
  const { data: membersData } = useMembers({ page: 0, size: 200 });
  const confirmPayment = useConfirmPayment();
  const voidPayment = useVoidPayment();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [page, setPage] = useState(1);
  const [paymentToVoid, setPaymentToVoid] = useState<Payment | null>(null);
  const [voidReason, setVoidReason] = useState("");

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
        paymentConceptLabel[payment.concept] ?? payment.concept,
        paymentMethodLabel[payment.payment_method] ?? payment.payment_method,
        paymentStatusLabel[payment.status] ?? payment.status,
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

  const closeVoidDialog = () => {
    setPaymentToVoid(null);
    setVoidReason("");
  };

  const submitVoid = () => {
    if (!paymentToVoid || !voidReason.trim()) return;
    voidPayment.mutate(
      { paymentId: paymentToVoid.payment_id, payload: { reason: voidReason.trim() } },
      { onSuccess: closeVoidDialog },
    );
  };

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

      <PaymentsFiltersBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        method={method}
        onMethodChange={(value) => {
          setMethod(value);
          setPage(1);
        }}
        placeholder="Socio, concepto, folio..."
      />

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el historial de pagos.
        </Typography>
      )}

      <PaymentsTable
        rows={pageRows}
        isLoading={isLoading}
        memberNameById={memberNameById}
        onConfirm={(payment) => confirmPayment.mutate(payment.payment_id)}
        // POST /payments/{id}/voids es exclusivo de ADMIN.
        onVoid={isAdmin ? setPaymentToVoid : undefined}
      />

      <ListPagination
        countText={`${filtered.length} pago(s) · página ${safePage} de ${totalPages}`}
        page={safePage}
        totalPages={totalPages}
        onChange={setPage}
      />

      <Dialog open={Boolean(paymentToVoid)} onClose={closeVoidDialog} fullWidth maxWidth="sm">
        <DialogTitle>Anular pago #{paymentToVoid?.payment_id}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            La anulación queda registrada con su motivo y el pago deja de contar para el reporte de ingresos.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            label="Motivo de la anulación"
            value={voidReason}
            onChange={(event) => setVoidReason(event.target.value)}
            inputProps={{ maxLength: 200 }}
            helperText={`${voidReason.length}/200 · obligatorio`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVoidDialog}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={submitVoid}
            disabled={!voidReason.trim() || voidPayment.isPending}
          >
            {voidPayment.isPending ? "Anulando..." : "Anular pago"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}