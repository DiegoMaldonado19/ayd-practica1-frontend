import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { Receipt as ReceiptIcon, Search as SearchIcon } from "@mui/icons-material";
import { usePayments } from "@/modules/billing/hooks";
import { getPaymentReceipt } from "@/modules/billing/services";
import type { Payment, PaymentStatus } from "@/modules/billing/types";

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

export function PaymentHistoryPage() {
  const { data, isLoading, isError } = usePayments({ page: 0, size: 200 });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [page, setPage] = useState(1);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<{ receipt_series: string; receipt_number: number; receipt_issued_at: string } | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const rows = useMemo(() => data?.content ?? [], [data]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((payment) => {
      if (status && payment.status !== status) return false;
      if (!needle) return true;
      const haystack = [
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
  }, [rows, status, search]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openReceipt = async (payment: Payment) => {
    setReceiptPayment(payment);
    setReceiptData(null);
    setReceiptError(null);
    setReceiptOpen(true);
    setReceiptLoading(true);
    try {
      const data = await getPaymentReceipt(payment.payment_id);
      setReceiptData(data);
    } catch {
      setReceiptError("El comprobante aún no está disponible.");
    } finally {
      setReceiptLoading(false);
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Mis pagos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Historial de pagos y comprobantes de tu cuenta.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Buscar"
          placeholder="Concepto, folio..."
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
      </Box>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar tu historial de pagos.
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Concepto</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Monto original</TableCell>
              <TableCell align="right">Descuento</TableCell>
              <TableCell align="right">Total pagado</TableCell>
              <TableCell align="right">Comprobante</TableCell>
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

                return (
                  <TableRow key={payment.payment_id} hover>
                    <TableCell>{payment.payment_id}</TableCell>
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
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReceiptIcon />}
                        onClick={() => openReceipt(payment)}
                      >
                        Recibo
                      </Button>
                    </TableCell>
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

      <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Comprobante de pago</DialogTitle>
        <DialogContent dividers>
          {receiptLoading ? (
            <Typography variant="body2" color="text.secondary">
              Cargando comprobante...
            </Typography>
          ) : receiptError ? (
            <Typography variant="body2" color="error">
              {receiptError}
            </Typography>
          ) : receiptData ? (
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Pago #</Typography>
                <Typography variant="body2">{receiptPayment?.payment_id}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Serie</Typography>
                <Typography variant="body2">{receiptData.receipt_series}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Número</Typography>
                <Typography variant="body2">{receiptData.receipt_number}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Emitido</Typography>
                <Typography variant="body2">
                  {receiptData.receipt_issued_at ? new Date(receiptData.receipt_issued_at).toLocaleString() : "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Total pagado</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Q {receiptPayment ? fmt(Number(receiptPayment.net_amount ?? receiptPayment.amount ?? 0)) : "—"}
                </Typography>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReceiptOpen(false)}>Cerrar</Button>
          <Button variant="contained" disabled={!receiptData} onClick={() => window.print()}>
            Imprimir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
