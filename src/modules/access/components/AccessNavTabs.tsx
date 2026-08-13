import { useLocation, useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

export function AccessNavTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const value = location.pathname.startsWith("/access/guest-passes") ? 1 : 0;

  return (
    <Paper sx={{ mb: 3 }}>
      <Tabs
        value={value}
        onChange={(_e, v) =>
          navigate(v === 0 ? "/access/visits" : "/access/guest-passes")
        }
      >
        <Tab label="Socios (check-in/check-out)" />
        <Tab label="Invitados / pases de un día" />
      </Tabs>
    </Paper>
  );
}