import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { Search as SearchIcon } from "@mui/icons-material";
import type { PaymentMethod, PaymentStatus } from "@/modules/billing/types";
import {
  paymentMethodLabel,
  paymentStatusLabel,
} from "@/modules/billing/billingLabels";

export function PaymentsFiltersBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  method,
  onMethodChange,
  placeholder,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: PaymentStatus | "";
  onStatusChange: (value: PaymentStatus | "") => void;
  method?: PaymentMethod | "";
  onMethodChange?: (value: PaymentMethod | "") => void;
  placeholder?: string;
}) {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
      <TextField
        label="Buscar"
        placeholder={placeholder}
        size="small"
        sx={{ minWidth: 260 }}
        value={search}
        onChange={(e) => {
          onSearchChange(e.target.value);
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
          onStatusChange(e.target.value as PaymentStatus | "");
        }}
      >
        <MenuItem value="">Todos</MenuItem>
        {(Object.keys(paymentStatusLabel) as PaymentStatus[]).map((s) => (
          <MenuItem key={s} value={s}>
            {paymentStatusLabel[s]}
          </MenuItem>
        ))}
      </TextField>
      {method !== undefined && onMethodChange && (
        <TextField
          select
          label="Método"
          size="small"
          sx={{ minWidth: 180 }}
          value={method}
          onChange={(e) => {
            onMethodChange(e.target.value as PaymentMethod | "");
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {(Object.keys(paymentMethodLabel) as PaymentMethod[]).map((m) => (
            <MenuItem key={m} value={m}>
              {paymentMethodLabel[m]}
            </MenuItem>
          ))}
        </TextField>
      )}
    </Box>
  );
}