import type { Control, FieldErrors } from "react-hook-form";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Promotion } from "@/modules/billing/types";
import type { PaymentFormValues } from "@/modules/billing/paymentFormSchema";
import { formatCurrency, formatPhone } from "@/modules/billing/billingLabels";
import { BillingFormField } from "./BillingFormField";

export function GuestPassFields({
  control,
  errors,
}: {
  control: Control<PaymentFormValues>;
  errors: FieldErrors<PaymentFormValues>;
}) {
  return (
    <>
      <Grid item xs={12} sm={4}>
        <BillingFormField control={control} errors={errors} name="guest_first_name" label="Nombre del invitado" />
      </Grid>

      <Grid item xs={12} sm={4}>
        <BillingFormField control={control} errors={errors} name="guest_last_name" label="Apellido del invitado" />
      </Grid>

      <Grid item xs={12} sm={4}>
        <BillingFormField control={control} errors={errors} name="guest_document_type" label="Tipo de documento" select>
          <MenuItem value="DPI">DPI</MenuItem>
          <MenuItem value="PASSPORT">Pasaporte</MenuItem>
          <MenuItem value="NIT">NIT</MenuItem>
        </BillingFormField>
      </Grid>

      <Grid item xs={12} sm={4}>
        <BillingFormField control={control} errors={errors} name="guest_document_number" label="Número de documento" />
      </Grid>

      <Grid item xs={12} sm={4}>
        <BillingFormField control={control} errors={errors} name="guest_email" label="Email (opcional)" />
      </Grid>

      <Grid item xs={12} sm={4}>
        <BillingFormField
          control={control}
          errors={errors}
          name="guest_phone"
          label="Teléfono (opcional)"
          value={(v) => v ?? ""}
          onChange={formatPhone}
        />
      </Grid>
    </>
  );
}

export function PriceBreakdown({
  gross,
  discount,
  net,
  promotion,
}: {
  gross: number;
  discount: number;
  net: number;
  promotion: Promotion | null;
}) {
  return (
    <Grid item xs={12}>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
        <Stack spacing={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">Monto original</Typography>
            <Typography variant="body2">Q {formatCurrency(gross)}</Typography>
          </Box>
          {discount > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Descuento ({promotion?.code ?? "promoción"})
              </Typography>
              <Typography variant="body2" color="success.main">-Q {formatCurrency(discount)}</Typography>
            </Box>
          )}
          <Divider />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total a pagar</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Q {formatCurrency(net)}</Typography>
          </Box>
        </Stack>
      </Paper>
    </Grid>
  );
}