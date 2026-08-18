import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
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
  Assessment as AssessmentIcon,
  Payment as PaymentIcon,
  Restaurant as RestaurantIcon,
  DirectionsRun as DirectionsRunIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/useAuth";
import { canAccessModule, hasAnyRole, type ModuleKey } from "@/auth/permissions";
import type { Role } from "@/modules/auth/types";

export const DRAWER_WIDTH = 220;
export const DRAWER_COLLAPSED_WIDTH = 64;

type NavChild = {
  label: string;
  path: string;
  roles?: Role[];
};

type NavItem = {
  label: string;
  icon: React.ReactElement;
  module: ModuleKey;
  path?: string;
  roles?: Role[];
  children?: NavChild[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon />, module: "dashboard", roles: ["ADMIN", "RECEPTIONIST", "TRAINER"] },
  { label: "Inicio", path: "/dashboard", icon: <HomeIcon />, module: "dashboard", roles: ["MEMBER"] },
  { label: "Socios", path: "/members", icon: <PeopleIcon />, module: "members" },
  { label: "Personal", path: "/employees", icon: <BadgeIcon />, module: "employees" },
  {
    label: "Entrenadores",
    path: "/trainers",
    icon: <FitnessCenterIcon />,
    module: "trainers",
    roles: ["ADMIN", "RECEPTIONIST"],
  },
  { label: "Planes", path: "/membership-plans", icon: <CreditCardIcon />, module: "membershipPlans" },
  { label: "Membresías", path: "/memberships", icon: <CreditCardIcon />, module: "memberships" },
  { label: "Acceso", path: "/access/visits", icon: <EventIcon />, module: "access" },
  { label: "Clases", path: "/classes", icon: <ClassIcon />, module: "classes" },
  // { label: "Notificaciones", path: "/notifications", icon: <NotificationsIcon />, module: "notifications" },
  { label: "Reportes", path: "/reports", icon: <AssessmentIcon />, module: "reports" },
  { label: "Pagos", path: "/payments", icon: <PaymentIcon />, module: "billing" },
  { label: "Mis pagos", path: "/payments/me", icon: <PaymentIcon />, module: "billing", roles: ["MEMBER"] },
  { label: "Promociones", path: "/promotions", icon: <CreditCardIcon />, module: "billing" },
  { label: "Nutrición", path: "/nutrition", icon: <RestaurantIcon />, module: "nutrition" },
  {
    label: "Entrenamiento",
    icon: <DirectionsRunIcon />,
    module: "training",
    children: [
      { label: "Asignaciones", path: "/training/assignments", roles: ["ADMIN"] },
      { label: "Mis socios", path: "/training/my-members", roles: ["TRAINER"] },
      { label: "Ejercicios", path: "/training/exercises", roles: ["ADMIN", "TRAINER"] },
      { label: "Alertas de entrenador", path: "/training/alerts", roles: ["ADMIN", "TRAINER"] },
      { label: "Mi entrenamiento", path: "/training/me", roles: ["MEMBER"] },
    ],
  },
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
  const [pendingNotifications, setPendingNotifications] = useState(0);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadPendingNotifications = async () => {
      try {
        const { data } = await apiClient.get("/notifications", {
          params: { page: 0, size: 100 },
        });

        if (cancelled) return;

        const notifications = Array.isArray(data?.content) ? data.content : [];
        const count = notifications.filter((item: { status?: string }) => item.status !== "READ").length;
        setPendingNotifications(count);
      } catch {
        if (!cancelled) {
          setPendingNotifications(0);
        }
      }
    };

    void loadPendingNotifications();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const visibleChildrenByLabel = useMemo(() => {
    const map = new Map<string, NavChild[]>();
    for (const item of NAV_ITEMS) {
      if (!item.children) continue;
      map.set(
        item.label,
        item.children.filter((child) => user && hasAnyRole(user.role, child.roles ?? [])),
      );
    }
    return map;
  }, [user]);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!user) return false;
    if (item.children) return (visibleChildrenByLabel.get(item.label) ?? []).length > 0;
    return item.roles ? hasAnyRole(user.role, item.roles) : canAccessModule(user.role, item.module);
  });

  const isGroupOpen = (item: NavItem) => {
    const children = visibleChildrenByLabel.get(item.label) ?? [];
    const hasActiveChild = children.some((child) => isActive(child.path));
    return openGroups[item.label] ?? hasActiveChild;
  };

  const toggleGroup = (label: string, currentlyOpen: boolean) => {
    setOpenGroups((current) => ({ ...current, [label]: !currentlyOpen }));
  };

  const itemButtonSx = (active: boolean, indent: boolean) => ({
    borderRadius: 2,
    minHeight: 44,
    px: collapsed ? 1.5 : indent ? 5 : 2,
    justifyContent: collapsed ? "center" : "flex-start",
    bgcolor: active ? "primary.main" : "transparent",
    color: active ? "primary.contrastText" : "text.primary",
    "&:hover": {
      bgcolor: active ? "primary.dark" : "action.hover",
    },
    "&.Mui-selected": {
      bgcolor: active ? "primary.main" : "transparent",
    },
  });

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar
        sx={{
          px: collapsed ? 1.5 : 2.5,
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: 54,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 46,
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

      <List sx={{ flexGrow: 1, px: collapsed ? 0.75 : 1, py: 1.5, overflowY: "auto" }}>
        {visibleItems.map((item) => {
          // Group item
          if (item.children) {
            const children = visibleChildrenByLabel.get(item.label) ?? [];
            const open = isGroupOpen(item);
            const groupActive = children.some((child) => isActive(child.path));

            const groupButton = (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    if (collapsed) {
                      navigate(children[0].path);
                      onCloseMobile();
                    } else {
                      toggleGroup(item.label, open);
                    }
                  }}
                  sx={itemButtonSx(groupActive && collapsed, false)}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, color: "inherit", justifyContent: "center" }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
                      {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
            );

            return (
              <Box key={item.label}>
                {collapsed ? (
                  <Tooltip title={item.label} placement="right" arrow>
                    {groupButton}
                  </Tooltip>
                ) : (
                  groupButton
                )}
                {!collapsed && (
                  <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {children.map((child) => {
                        const active = isActive(child.path);
                        return (
                          <ListItem key={child.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                              onClick={() => {
                                navigate(child.path);
                                onCloseMobile();
                              }}
                              selected={active}
                              sx={itemButtonSx(active, true)}
                            >
                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{ fontWeight: 500, variant: "body2" }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          }

          // Leaf item: navigates directly.
          const path = item.path as string;
          const active = isActive(path);
          const button = (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(path);
                  onCloseMobile();
                }}
                selected={active}
                sx={itemButtonSx(active, false)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 0 : 40,
                    color: "inherit",
                    justifyContent: "center",
                  }}
                >
                  {path === "/notifications" && pendingNotifications > 0 ? (
                    <Badge badgeContent={pendingNotifications} color="error" overlap="circular">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
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