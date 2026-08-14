import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { apiClient } from "@/api/client";
import type { Page } from "@/api/types";

const notificationTypeLabels: Record<string, string> = {
  SESSION_RESCHEDULED: "Sesión reprogramada",
  CLASS_CANCELLED: "Clase cancelada",
  WAITLIST_PROMOTED: "Promoción a lista de espera",
  MEMBERSHIP_EXPIRING: "Membresía próxima a vencer",
  CHECK_IN: "Ingreso registrado",
};

const notificationStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  SENT: "Enviada",
  FAILED: "Fallida",
  READ: "Leída",
};

type NotificationStatus = keyof typeof notificationStatusLabels;
type NotificationType = keyof typeof notificationTypeLabels;

type NotificationItem = {
  notificationId: number;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  createdAt: string;
  channel: "IN_APP" | "EMAIL";
};

type ApiNotification = {
  notification_id?: number;
  notificationId?: number;
  notification_type?: string;
  notificationType?: string;
  type?: string;
  title?: string;
  message?: string;
  body?: string;
  status?: string;
  channel?: string;
  created_at?: string;
  createdAt?: string;
};

function mapStatus(value?: string): NotificationStatus {
  if (value === "READ") return "READ";
  if (value === "FAILED") return "FAILED";
  if (value === "PENDING") return "PENDING";
  return "SENT";
}

function getNotificationType(value?: string): NotificationType {
  if (value === "CLASS_CANCELLED") return "CLASS_CANCELLED";
  if (value === "WAITLIST_PROMOTED") return "WAITLIST_PROMOTED";
  if (value === "MEMBERSHIP_EXPIRING") return "MEMBERSHIP_EXPIRING";
  if (value === "CHECK_IN") return "CHECK_IN";
  return "SESSION_RESCHEDULED";
}

function normalizeNotification(raw: ApiNotification): NotificationItem {
  const type = getNotificationType(raw.notification_type ?? raw.notificationType ?? raw.type);
  const titles: Record<NotificationType, string> = {
    SESSION_RESCHEDULED: "Sesión reprogramada",
    CLASS_CANCELLED: "Clase cancelada",
    WAITLIST_PROMOTED: "Promoción a lista de espera",
    MEMBERSHIP_EXPIRING: "Membresía próxima a vencer",
    CHECK_IN: "Ingreso registrado",
  };

  return {
    notificationId: raw.notification_id ?? raw.notificationId ?? Date.now(),
    title: raw.title ?? titles[type],
    message: raw.message ?? raw.body ?? "Hay una actualización nueva en tu cuenta.",
    type,
    status: mapStatus(raw.status),
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    channel: raw.channel === "EMAIL" ? "EMAIL" : "IN_APP",
  };
}

function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return new Intl.DateTimeFormat("es-GT", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function filterByRange(items: NotificationItem[], range: "today" | "week" | "all") {
  if (range === "all") return items;

  const now = new Date();
  const cutoff = new Date();

  if (range === "today") {
    cutoff.setHours(0, 0, 0, 0);
  } else {
    cutoff.setDate(now.getDate() - 7);
  }

  return items.filter((item) => new Date(item.createdAt) >= cutoff);
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [tab, setTab] = useState<"unread" | "read">("unread");
  const [range, setRange] = useState<"today" | "week" | "all">("all");
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(false);

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => item.status !== "READ"),
    [notifications],
  );

  const readNotifications = useMemo(
    () => notifications.filter((item) => item.status === "READ"),
    [notifications],
  );

  const visibleNotifications = useMemo(() => {
    const source = tab === "unread" ? unreadNotifications : readNotifications;
    return filterByRange(source, range);
  }, [readNotifications, range, tab, unreadNotifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get<Page<ApiNotification>>("/notifications", {
        params: { page: 0, size: 30 },
      });

      setNotifications((data.content ?? []).map((item) => normalizeNotification(item)));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    await loadNotifications();
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/status`, { status: "READ" });
      setNotifications((prev) =>
        prev.map((item) =>
          item.notificationId === notificationId ? { ...item, status: "READ" } : item,
        ),
      );
    } catch {
      // ignore for now; backend will reject if not allowed
    }
  };

  const handleOpenDetail = async (notification: NotificationItem) => {
    if (notification.status !== "READ") {
      await handleMarkAsRead(notification.notificationId);
    }
    setSelectedNotification(notification);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Ajustes de notificaciones" arrow>
        <IconButton
          color="inherit"
          size="medium"
          onClick={handleOpen}
          aria-label="notificaciones"
          sx={{
            position: "relative",
            bgcolor: open ? "action.hover" : "transparent",
            borderRadius: 2,
          }}
        >
          <Badge badgeContent={unreadNotifications.length || null} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              width: 420,
              maxHeight: 620,
              mt: 1,
              borderRadius: 3,
              boxShadow: "0 18px 45px rgba(15, 23, 42, 0.18)",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5, minWidth: 360 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Notificaciones
            </Typography>

            <Tooltip title="Abrir toda la bandeja" arrow>
              <Button
                size="small"
                variant="text"
                startIcon={<SettingsIcon fontSize="small" />}
                onClick={() => {
                  setAnchorEl(null);
                  navigate("/notifications");
                }}
              >
                Ajustes
              </Button>
            </Tooltip>
          </Stack>

          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="fullWidth"
            sx={{ mt: 1, mb: 1.5 }}
          >
            <Tab value="unread" label={`No leídas (${unreadNotifications.length})`} />
            <Tab value="read" label={`Leídas (${readNotifications.length})`} />
          </Tabs>

          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            {(["today", "week", "all"] as const).map((option) => (
              <Chip
                key={option}
                label={option === "today" ? "Hoy" : option === "week" ? "Semana" : "Todo"}
                size="small"
                variant={range === option ? "filled" : "outlined"}
                color={range === option ? "primary" : "default"}
                onClick={() => setRange(option)}
              />
            ))}
          </Stack>

          <Divider />

          {loading ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Cargando notificaciones...
              </Typography>
            </Box>
          ) : visibleNotifications.length === 0 ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No hay notificaciones en este filtro.
              </Typography>
            </Box>
          ) : (
            <List disablePadding sx={{ maxHeight: 420, overflowY: "auto" }}>
              {visibleNotifications.map((item) => (
                <ListItemButton
                  key={item.notificationId}
                  onClick={() => void handleOpenDetail(item)}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    px: 1,
                    mb: 0.5,
                    border: item.status !== "READ" ? 1 : 0,
                    borderColor: "divider",
                    bgcolor: item.status !== "READ" ? "action.hover" : "transparent",
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {item.title}
                        </Typography>
                        {item.status !== "READ" && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "error.main",
                            }}
                          />
                        )}
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                          {item.message.length > 90 ? `${item.message.slice(0, 90)}...` : item.message}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {notificationTypeLabels[item.type]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatShortDate(item.createdAt)}
                          </Typography>
                        </Stack>
                      </>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Menu>

      <Dialog
        open={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedNotification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notificationTypeLabels[selectedNotification.type]} · {formatShortDate(selectedNotification.createdAt)}
                </Typography>
              </Box>

              <IconButton onClick={() => setSelectedNotification(null)} size="small" aria-label="cerrar notificación">
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Stack spacing={2}>
                <Chip
                  label={notificationStatusLabels[selectedNotification.status]}
                  color={selectedNotification.status === "READ" ? "success" : "warning"}
                  size="small"
                  icon={selectedNotification.status === "READ" ? <CheckIcon fontSize="small" /> : undefined}
                />
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {selectedNotification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Canal: {selectedNotification.channel === "IN_APP" ? "Dentro de la app" : "Correo electrónico"}
                </Typography>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}
