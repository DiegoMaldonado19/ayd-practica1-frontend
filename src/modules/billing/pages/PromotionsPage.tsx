import { useMemo } from "react";
import { Box, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { usePromotions } from "@/modules/billing/hooks";

export function PromotionsPage() {
  const { data, isLoading, isError } = usePromotions({ page: 0, size: 20 });

  const rows = useMemo(() => data?.content ?? [], [data]);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Promociones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Promociones activas e inactivas del módulo billing.
          </Typography>
        </Box>
      </Stack>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          No se pudo cargar el catálogo de promociones.
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descuento</TableCell>
              <TableCell>Vigencia</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Cargando promociones...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No hay promociones registradas.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((promotion) => (
                <TableRow key={promotion.promotion_id} hover>
                  <TableCell>{promotion.promotion_id}</TableCell>
                  <TableCell>{promotion.code}</TableCell>
                  <TableCell>{promotion.name}</TableCell>
                  <TableCell>
                    {promotion.discount_type === "PERCENTAGE"
                      ? `${promotion.discount_value}%`
                      : `Q ${Number(promotion.discount_value).toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    {promotion.valid_from} / {promotion.valid_to}
                  </TableCell>
                  <TableCell>
                    <Chip label={promotion.active ? "Activa" : "Inactiva"} color={promotion.active ? "success" : "default"} size="small" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
