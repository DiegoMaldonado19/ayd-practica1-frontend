import { useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import {
  MenuOpen as MenuOpenIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Badge as BadgeIcon,
  FitnessCenter as FitnessCenterIcon,
  CreditCard as CreditCardIcon,
  Event as EventIcon,
  Class as ClassIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  Payment as PaymentIcon,
  Restaurant as RestaurantIcon,
  DirectionsRun as DirectionsRunIcon,
} from "@mui/icons-material";
import { useAuth } from "@/auth/useAuth";
import { canAccessModule, type ModuleKey} from "@/auth/permissions";

export const DRAWER_WIDTH = 260;
export const DRAWER_COLLAPSED_WIDTH = 72;

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactElement;
  module: ModuleKey;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon />, module: "dashboard" },
  { label: "Socios", path: "/members", icon: <PeopleIcon />, module: "members" },
  { label: "Personal", path: "/employees", icon: <BadgeIcon />, module: "employees" },
  { label: "Entrenadores", path: "/trainers", icon: <FitnessCenterIcon />, module: "trainers" },
  { label: "Planes", path: "/membership-plans", icon: <CreditCardIcon />, module: "membershipPlans" },
  { label: "Membresías", path: "/memberships", icon: <CreditCardIcon />, module: "memberships" },
  { label: "Acceso", path: "/access/visits", icon: <EventIcon />, module: "access" },
  { label: "Clases", path: "/classes", icon: <ClassIcon />, module: "classes" },
  { label: "Notificaciones", path: "/notifications", icon: <NotificationsIcon />, module: "notifications" },
  { label: "Reportes", path: "/reports", icon: <AssessmentIcon />, module: "reports" },
  { label: "Pagos", path: "/payments", icon: <PaymentIcon />, module: "billing" },
  { label: "Nutrición", path: "/nutrition", icon: <RestaurantIcon />, module: "nutrition" },
  { label: "Entrenamiento", path: "/training", icon: <DirectionsRunIcon />, module: "training" },
];


type SidebarProps = {
  mobileOpen: boolean;
  collapsed: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
};

export function Sidebar({ mobileOpen, collapsed, onCloseMobile, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => user && canAccessModule(user.role, item.module)
  );

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo / marca */}
      <Toolbar
        sx={{
          px: collapsed ? 1.5 : 2.5,
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              F
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                Fitness
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                App
              </Typography>
            </Box>
          </Box>
        )}

        {collapsed && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "1.25rem",
            }}
          >
            F
          </Box>
        )}

        {!collapsed && (
          <IconButton onClick={onToggleCollapse} size="small" sx={{ display: { xs: "none", md: "flex" } }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Toolbar>

      <Divider />

      {/* Navegación */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {visibleItems.map((item) => {
          const active = isActive(item.path);
          const button = (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  onCloseMobile();
                }}
                selected={active}
                sx={{
                  borderRadius: 2,
                  minHeight: 44,
                  px: collapsed ? 1.5 : 2,
                  justifyContent: collapsed ? "center" : "flex-start",
                  bgcolor: active ? "primary.main" : "transparent",
                  color: active ? "primary.contrastText" : "text.primary",
                  "&:hover": {
                    bgcolor: active ? "primary.dark" : "action.hover",
                  },
                  "&.Mui-selected": {
                    bgcolor: active ? "primary.main" : "transparent",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 40,
                    color: "inherit",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />}
              </ListItemButton>
            </ListItem>
          );

          return collapsed ? (
            <Tooltip key={item.label} title={item.label} placement="right" arrow>
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>

      {/* Footer: botón colapsar */}
      <Box sx={{ p: 1, borderTop: 1, borderColor: "divider", display: { xs: "none", md: "block" } }}>
        <ListItemButton
          onClick={onToggleCollapse}
          sx={{ borderRadius: 2, justifyContent: collapsed ? "center" : "flex-start", px: collapsed ? 1.5 : 2 }}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: "center" }}>
            {collapsed ? <MenuOpenIcon /> : <ChevronLeftIcon />}
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Colapsar menú" primaryTypographyProps={{ variant: "body2", color: "text.secondary" }} />}
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH },
        flexShrink: { md: 0 },
      }}
    >
      {/* Mobile: drawer temporal */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop: drawer permanente */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH,
            borderRight: 1,
            borderColor: "divider",
            overflowX: "hidden",
            transition: "width 0.2s ease",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}