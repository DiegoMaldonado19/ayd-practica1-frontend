import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

type StatColor = "primary" | "success" | "warning" | "error" | "info";

interface StatTileProps {
  label: string;
  value: number | string;
  color?: StatColor;
  icon?: ReactNode;
  loading?: boolean;
  linkTo?: string;
}

export function StatTile({ label, value, color = "primary", icon, loading, linkTo }: StatTileProps) {
  const navigate = useNavigate();

  return (
    <Paper
      variant="outlined"
      onClick={linkTo ? () => navigate(linkTo) : undefined}
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
        cursor: linkTo ? "pointer" : "default",
        "&:hover": linkTo ? { borderColor: `${color}.main`, bgcolor: "action.hover" } : undefined,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: `${color}.main`,
            color: `${color}.contrastText`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" noWrap>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}
