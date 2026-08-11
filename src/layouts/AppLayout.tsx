import { Outlet } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/auth/useAuth";
import { ROLE_LABEL } from "@/auth/permissions";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fitness App
          </Typography>
          {user && (
            <>
              <Typography variant="body2">{user.full_name}</Typography>
              <Chip label={ROLE_LABEL[user.role]} size="small" color="primary" variant="outlined" />
            </>
          )}
          <Button variant="outlined" size="small" onClick={() => void logout()}>
            Cerrar sesión
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
