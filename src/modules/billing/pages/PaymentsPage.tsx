import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { usePayments } from "@/modules/billing/hooks";
import { useMembers } from "@/modules/members/hooks";

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

export function PaymentsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePayments({ page: 0, size: 20 });
  const { data: membersData } = useMembers({ page: 0, size: 200 });

  const rows = useMemo(() => data?.content ?? [], [data]);

  const memberNameById = useMemo(() => {
    const map = new Map<number, string>();
    (membersData?.content ?? []).forEach((member) => {
      map.set(member.member_id, member.person.full_name);
    });
    return map;
  }, [membersData]);

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
              <TableCell align="right">Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Cargando pagos...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No hay pagos registrados.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((payment) => {
                // Backend returns `net_amount` (after discount) and `gross_amount`.
                const finalAmount =
                  typeof payment.net_amount === "number"
                    ? Number(payment.net_amount)
                    : Math.max(Number(payment.amount ?? 0) - Number(payment.discount_amount ?? 0), 0);
                const formattedAmount = finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                return (
                  <TableRow key={payment.payment_id} hover>
                    <TableCell>{payment.payment_id}</TableCell>
                    <TableCell>
                      {payment.member_id ? memberNameById.get(payment.member_id) ?? `Socio #${payment.member_id}` : "Invitado"}
                    </TableCell>
                    <TableCell>{payment.concept}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>
                      <Chip label={statusLabel[payment.status] ?? payment.status} color={statusColor[payment.status] ?? "default"} size="small" />
                    </TableCell>
                    <TableCell align="right">Q {formattedAmount}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}