import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  Check as CheckIcon,
  Circle as CircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { apiClient } from "@/api/client";
import { getErrorMessage, type Page } from "@/api/types";

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

const statusColors: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  PENDING: "default",
  SENT: "info",
  FAILED: "error",
  READ: "success",
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

function formatDate(dateString: string): string {
  const value = new Date(dateString);
  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | NotificationStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      try {
        const { data } = await apiClient.get<Page<ApiNotification>>("/notifications", {
          params: { page: 0, size: 20 },
        });

        if (!cancelled) {
          setNotifications((data.content ?? []).map((item) => normalizeNotification(item)));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "No se pudo cargar la bandeja de notificaciones."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  const pendingCount = useMemo(
    () => notifications.filter((item) => item.status !== "READ").length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (filter === "ALL") return notifications;
    return notifications.filter((item) => item.status === filter);
  }, [notifications, filter]);

  const totals = useMemo(
    () => ({
      total: notifications.length,
      sent: notifications.filter((item) => item.status === "SENT").length,
      read: notifications.filter((item) => item.status === "READ").length,
      failed: notifications.filter((item) => item.status === "FAILED").length,
    }),
    [notifications]
  );

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/status`, { status: "READ" });
      setNotifications((prev) =>
        prev.map((item) =>
          item.notificationId === notificationId
            ? { ...item, status: "READ" }
            : item
        )
      );
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo marcar la notificación como leída."));
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Notificaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bandeja del usuario autenticado con datos reales del backend.
          </Typography>
        </Box>

        <Badge badgeContent={pendingCount || null} color="error" overlap="circular">
          <Chip
            icon={<NotificationsIcon />}
            label={pendingCount > 0 ? `${pendingCount} pendientes` : "Sin pendientes"}
            color={pendingCount > 0 ? "warning" : "default"}
            variant="filled"
          />
        </Badge>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="caption" color="text.secondary">Total</Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{totals.total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="caption" color="text.secondary">Enviadas</Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{totals.sent}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="caption" color="text.secondary">Leídas</Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{totals.read}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="caption" color="text.secondary">Fallidas</Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{totals.failed}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
          {(["ALL", "SENT", "READ", "FAILED", "PENDING"] as const).map((option) => (
            <Button
              key={option}
              variant={filter === option ? "contained" : "outlined"}
              size="small"
              onClick={() => setFilter(option)}
            >
              {option === "ALL" ? "Todas" : notificationStatusLabels[option]}
            </Button>
          ))}
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <List disablePadding>
          {loading ? (
            <ListItem sx={{ py: 3, justifyContent: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Cargando notificaciones...
              </Typography>
            </ListItem>
          ) : filteredNotifications.length === 0 ? (
            <ListItem sx={{ py: 3, justifyContent: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No hay notificaciones para este filtro.
              </Typography>
            </ListItem>
          ) : (
            filteredNotifications.map((notification) => (
              <ListItem key={notification.notificationId} divider sx={{ alignItems: "flex-start", py: 2.5, px: 2.5 }}>
                <Box sx={{ mr: 2, mt: 0.5 }}>
                  {notification.status === "READ" ? (
                    <CheckIcon color="success" />
                  ) : notification.status === "FAILED" ? (
                    <ErrorOutlineIcon color="error" />
                  ) : (
                    <CircleIcon color="info" />
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {notification.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={notificationTypeLabels[notification.type]} size="small" color="primary" variant="outlined" />
                      <Chip label={notificationStatusLabels[notification.status]} size="small" color={statusColors[notification.status]} />
                    </Stack>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {notification.message}
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(notification.createdAt)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Canal: {notification.channel === "IN_APP" ? "Dentro de la app" : "Correo electrónico"}
                    </Typography>
                  </Stack>
                </Box>

                {notification.status !== "READ" && (
                  <IconButton onClick={() => void markAsRead(notification.notificationId)} size="small" sx={{ ml: 1 }} aria-label="Marcar como leída">
                    <CheckIcon fontSize="small" />
                  </IconButton>
                )}
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
}
