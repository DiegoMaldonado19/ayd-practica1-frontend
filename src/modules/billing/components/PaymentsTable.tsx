import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Block as BlockIcon, CheckCircle as CheckCircleIcon, Receipt as ReceiptIcon } from "@mui/icons-material";
import type { Payment } from "@/modules/billing/types";
import {
  computePaymentAmounts,
  formatCurrency,
  paymentConceptLabel,
  paymentMethodLabel,
  paymentStatusColor,
  paymentStatusLabel,
} from "@/modules/billing/billingLabels";

export function PaymentsTable({
  rows,
  isLoading,
  memberNameById,
  onViewReceipt,
  onConfirm,
  onVoid,
}: {
  rows: Payment[];
  isLoading: boolean;
  memberNameById?: Map<number, string>;
  onViewReceipt?: (payment: Payment) => void;
  onConfirm?: (payment: Payment) => void;
  onVoid?: (payment: Payment) => void;
}) {
  const showActions = Boolean(onViewReceipt || onConfirm || onVoid);
  const colSpan = 7 + (memberNameById ? 1 : 0) + (showActions ? 1 : 0);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            {memberNameById && <TableCell>Socio</TableCell>}
            <TableCell>Concepto</TableCell>
            <TableCell>Método</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Monto original</TableCell>
            <TableCell align="right">Descuento</TableCell>
            <TableCell align="right">Total pagado</TableCell>
            {showActions && <TableCell align="right">Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={colSpan} align="center" sx={{ py: 4, color: "text.secondary" }}>
                Cargando pagos...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} align="center" sx={{ py: 4, color: "text.secondary" }}>
                No hay pagos registrados.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((payment) => {
              const { gross, net, discount } = computePaymentAmounts(payment);
              return (
                <TableRow key={payment.payment_id} hover>
                  <TableCell>{payment.payment_id}</TableCell>
                  {memberNameById && (
                    <TableCell>
                      {payment.member_id
                        ? memberNameById.get(payment.member_id) ?? `Socio #${payment.member_id}`
                        : "Invitado"}
                    </TableCell>
                  )}
                  <TableCell>{paymentConceptLabel[payment.concept] ?? payment.concept}</TableCell>
                  <TableCell>{paymentMethodLabel[payment.payment_method] ?? payment.payment_method}</TableCell>
                  <TableCell>
                    <Chip
                      label={paymentStatusLabel[payment.status] ?? payment.status}
                      color={paymentStatusColor[payment.status] ?? "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">Q {formatCurrency(gross)}</TableCell>
                  <TableCell align="right" sx={{ color: discount > 0 ? "success.main" : "text.disabled" }}>
                    {discount > 0 ? `-Q ${formatCurrency(discount)}` : "—"}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Q {formatCurrency(net)}</TableCell>
                  {showActions && (
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                        {/* Un pago nace REGISTERED y solo cuenta para el reporte de
                            ingresos cuando pasa a CONFIRMED. */}
                        {onConfirm && payment.status === "REGISTERED" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => onConfirm(payment)}
                          >
                            Confirmar
                          </Button>
                        )}
                        {onVoid && payment.status !== "VOIDED" && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<BlockIcon />}
                            onClick={() => onVoid(payment)}
                          >
                            Anular
                          </Button>
                        )}
                        {onViewReceipt && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ReceiptIcon />}
                            onClick={() => onViewReceipt(payment)}
                          >
                            Recibo
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}