import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/auth/useAuth";
import { AdminPanel } from "./AdminPanel";
import { ReceptionistPanel } from "./ReceptionistPanel";
import { TrainerPanel } from "./TrainerPanel";
import { MemberPanel } from "./MemberPanel";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Bienvenido, {user?.full_name}
      </Typography>

      {user?.role === "ADMIN" && <AdminPanel />}
      {user?.role === "RECEPTIONIST" && <ReceptionistPanel />}
      {user?.role === "TRAINER" && <TrainerPanel />}
      {user?.role === "MEMBER" && <MemberPanel />}
    </Box>
  );
}
