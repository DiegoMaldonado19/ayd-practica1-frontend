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
import { usePromotions } from "@/modules/billing/hooks";

const PAGE_SIZE = 12;

export function PromotionsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePromotions({ page: 0, size: 200 });

  const [search, setSearch] = useState("");
  const [active, setActive] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => data?.content ?? [], [data]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((promotion) => {
      if (active === "true" && !promotion.active) return false;
      if (active === "false" && promotion.active) return false;
      if (!needle) return true;
      return `${promotion.code} ${promotion.name}`.toLowerCase().includes(needle);
    });
  }, [rows, search, active]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/promotions/new")}>
          Nueva promoción
        </Button>
      </Stack>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Buscar"
          placeholder="Código o nombre..."
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
          value={active}
          onChange={(e) => {
            setActive(e.target.value as "all" | "true" | "false");
            setPage(1);
          }}
        >
          <MenuItem value="all">Todas</MenuItem>
          <MenuItem value="true">Activas</MenuItem>
          <MenuItem value="false">Inactivas</MenuItem>
        </TextField>
      </Box>

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
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No hay promociones registradas.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((promotion) => (
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

      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filtered.length} promoción(es) · página {safePage} de {totalPages}
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
