import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function ListPagination({
  countText,
  page,
  totalPages,
  onChange,
}: {
  countText: string;
  page: number;
  totalPages: number;
  onChange: (value: number) => void;
}) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {countText}
      </Typography>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, value) => onChange(value)}
        color="primary"
        shape="rounded"
        size="small"
        showFirstButton
        showLastButton
      />
    </Stack>
  );
}