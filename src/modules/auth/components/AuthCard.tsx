import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h5" component="h1" fontWeight={600}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}
