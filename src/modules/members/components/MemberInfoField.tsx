import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function MemberInfoField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}