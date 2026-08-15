import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
//import Typography from "@mui/material/Typography";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Sidebar, DRAWER_WIDTH, DRAWER_COLLAPSED_WIDTH } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "@/modules/notifications/components/NotificationBell";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleToggleCollapse = () => setCollapsed((prev) => !prev);

  const sidebarWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
     
      <Sidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapse={handleToggleCollapse}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          ml: { md: `${sidebarWidth}px` },
          transition: "margin 0.2s ease",
        }}
      >
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1 }} />

            <NotificationBell />
            <UserMenu />
          </Toolbar>
        </AppBar>

        {/* Área de páginas */}
        <Box
          sx={{
            flexGrow: 1,
            px: { xs: 1, sm: 2, md: 1 },
            py: { xs: 1, md: 3 },
            maxWidth: 1380,
            width: "100%",
            mx: {},
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}