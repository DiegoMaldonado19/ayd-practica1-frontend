import Typography from "@mui/material/Typography";
import { useAuth } from "@/auth/useAuth";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Bienvenido, {user?.full_name}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        El panel principal se implementará en el módulo <code>dashboard</code>.
      </Typography>
    </>
  );
}
