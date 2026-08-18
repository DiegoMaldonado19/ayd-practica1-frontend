import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FitnessCenter as FitnessCenterIcon, Print as PrintIcon } from "@mui/icons-material";
import { useAuth } from "@/auth/useAuth";
import {
  computePaymentAmounts,
  formatCurrency,
  paymentConceptLabel,
  paymentMethodLabel,
  paymentStatusColor,
  paymentStatusLabel,
} from "@/modules/billing/billingLabels";
import type { Payment } from "@/modules/billing/types";

export interface ReceiptData {
  receipt_series: string;
  receipt_number: number;
  receipt_issued_at: string;
}

interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  receiptData: ReceiptData | null;
  payment: Payment | null;
}

function Row({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: emphasis ? 700 : 500, textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function ReceiptDialog({
  open,
  onClose,
  loading,
  error,
  receiptData,
  payment,
}: ReceiptDialogProps) {
  const { user } = useAuth();
  const amounts = payment ? computePaymentAmounts(payment) : { gross: 0, net: 0, discount: 0 };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 0 }}>Comprobante de pago</DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "grey.50" }}>
        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Cargando comprobante...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        ) : receiptData ? (
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              boxShadow: 1,
              overflow: "hidden",
            }}
          >
            {/* Encabezado con la marca del gimnasio */}
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                px: 3,
                py: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FitnessCenterIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                  FITNESS APP
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Sistema de Gestión de Gimnasio
                </Typography>
              </Box>
            </Box>

            <Box sx={{ px: 3, py: 2.5 }}>
              {/* Datos del folio */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                    Comprobante
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {receiptData.receipt_series}-{String(receiptData.receipt_number).padStart(6, "0")}
                  </Typography>
                </Box>
                {payment?.status && (
                  <Chip
                    size="small"
                    label={paymentStatusLabel[payment.status] ?? payment.status}
                    color={paymentStatusColor[payment.status] ?? "default"}
                  />
                )}
              </Stack>

              <Stack spacing={1.25}>
                <Row label="Cliente" value={user?.full_name ?? "—"} />
                <Row
                  label="Concepto"
                  value={payment ? paymentConceptLabel[payment.concept] ?? payment.concept : "—"}
                />
                <Row
                  label="Método de pago"
                  value={payment ? paymentMethodLabel[payment.payment_method] ?? payment.payment_method : "—"}
                />
                <Row
                  label="Fecha de emisión"
                  value={receiptData.receipt_issued_at ? new Date(receiptData.receipt_issued_at).toLocaleString() : "—"}
                />
              </Stack>

              <Divider sx={{ my: 2, borderStyle: "dashed" }} />

              <Stack spacing={1.25}>
                <Row label="Subtotal" value={`Q ${formatCurrency(amounts.gross)}`} />
                {amounts.discount > 0 && (
                  <Row label="Descuento" value={`- Q ${formatCurrency(amounts.discount)}`} />
                )}
                <Divider sx={{ my: 0.5 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    Total pagado
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                    Q {formatCurrency(amounts.net)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ bgcolor: "grey.100", px: 3, py: 1.5, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", display: "block" }}>
                Pago #{payment?.payment_id ?? "—"} · Gracias por tu preferencia.
              </Typography>
            </Box>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant="contained" startIcon={<PrintIcon />} disabled={!receiptData} onClick={() => window.print()}>
          Imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
