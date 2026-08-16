import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function MembersPagination({
  countText,
  disabledPrev,
  disabledNext,
  onPrev,
  onNext,
}: {
  countText: string;
  disabledPrev: boolean;
  disabledNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      spacing={2}
      sx={{ mt: 2 }}
    >
      <Typography variant="body2" color="text.secondary">
        {countText}
      </Typography>

      <Stack direction="row" spacing={1}>
        <Button size="small" disabled={disabledPrev} onClick={onPrev}>
          Anterior
        </Button>

        <Button size="small" disabled={disabledNext} onClick={onNext}>
          Siguiente
        </Button>
      </Stack>
    </Stack>
  );
}