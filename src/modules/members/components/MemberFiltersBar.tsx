import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { MemberStatus } from "@/modules/members/types";

export function MemberFiltersBar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: {
  search: string;
  status: MemberStatus | "";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: MemberStatus | "") => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, borderRadius: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          fullWidth
          label="Buscar por nombre o documento"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
        />

        <TextField
          select
          label="Estado"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as MemberStatus | "")}
          size="small"
          sx={{ minWidth: { xs: "100%", md: 180 } }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="ACTIVE">Activo</MenuItem>
          <MenuItem value="INACTIVE">Inactivo</MenuItem>
          <MenuItem value="WITHDRAWN">Retirado</MenuItem>
        </TextField>
      </Stack>
    </Paper>
  );
}