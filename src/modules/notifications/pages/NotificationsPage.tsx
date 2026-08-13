import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
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
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from "@mui/icons-material";

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
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  createdAt: string;
  channel: "IN_APP" | "EMAIL";
};

const seedNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Sesión reprogramada",
    message: "La sesión de Yoga matutino fue movida al viernes a las 7:30 AM.",
    type: "SESSION_RESCHEDULED",
    status: "SENT",
    createdAt: "2026-08-13T08:30:00.000Z",
    channel: "IN_APP",
  },
  {
    id: 2,
    title: "Lista de espera",
    message: "Se te promocionó a la sesión de Spinning del próximo martes.",
    type: "WAITLIST_PROMOTED",
    status: "READ",
    createdAt: "2026-08-12T15:15:00.000Z",
    channel: "IN_APP",
  },
  {
    id: 3,
    title: "Membresía por vencer",
    message: "Tu membresía vence en 5 días. Puedes renovarla desde recepción o desde tu cuenta.",
    type: "MEMBERSHIP_EXPIRING",
    status: "PENDING",
    createdAt: "2026-08-11T09:00:00.000Z",
    channel: "EMAIL",
  },
];

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

function buildNotificationFromEvent(payload: { type?: string; message?: string }): NotificationItem {
  const now = new Date().toISOString();
  const type = (payload.type as NotificationType) ?? "SESSION_RESCHEDULED";
  const titles: Record<NotificationType, string> = {
    SESSION_RESCHEDULED: "Sesión reprogramada",
    CLASS_CANCELLED: "Clase cancelada",
    WAITLIST_PROMOTED: "Promoción a lista de espera",
    MEMBERSHIP_EXPIRING: "Membresía próxima a vencer",
    CHECK_IN: "Ingreso registrado",
  };

  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: titles[type],
    message: payload.message ?? "Hay una actualización nueva en tu cuenta.",
    type,
    status: "SENT",
    createdAt: now,
    channel: "IN_APP",
  };
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(seedNotifications);
  const [filter, setFilter] = useState<"ALL" | NotificationStatus>("ALL");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;
    let heartbeat: number | undefined;

    const socket = new WebSocket("wss://echo.websocket.events");
    wsRef.current = socket;

    socket.onopen = () => {
      if (!isMounted) return;
      setConnected(true);

      heartbeat = window.setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          const messageBank: Array<{ type: NotificationType; message: string }> = [
            {
              type: "SESSION_RESCHEDULED",
              message: "Tu sesión de Yoga fue reprogramada para otro horario disponible.",
            },
            {
              type: "WAITLIST_PROMOTED",
              message: "Gracias a tu prioridad, ahora tienes un lugar reservado en la clase.",
            },
            {
              type: "CLASS_CANCELLED",
              message: "La clase de CrossFit programada para hoy fue cancelada por el entrenador.",
            },
            {
              type: "MEMBERSHIP_EXPIRING",
              message: "Tu membresía está por vencer. Revisa la renovación disponible.",
            },
          ];

          const randomMessage = messageBank[Math.floor(Math.random() * messageBank.length)];
          socket.send(
            JSON.stringify({
              type: "notification",
              data: {
                type: randomMessage.type,
                message: randomMessage.message,
              },
            })
          );
        }
      }, 15000);
    };

    socket.onmessage = (event) => {
      if (!isMounted) return;

      try {
        const raw = JSON.parse(event.data) as
          | { type?: string; data?: { type?: string; message?: string } }
          | { type?: string; message?: string };

        const item: { type?: string; message?: string } | undefined =
          "data" in raw && raw.data ? raw.data : "type" in raw || "message" in raw ? raw : undefined;

        if (item && (item.type || item.message)) {
          setNotifications((prev) => [buildNotificationFromEvent(item), ...prev].slice(0, 12));
        }
      } catch {
        // Ignored: some websocket echo payloads are plain text and are not notification events.
      }
    };

    socket.onclose = () => {
      if (isMounted) {
        setConnected(false);
      }
      if (heartbeat) {
        window.clearInterval(heartbeat);
      }
    };

    socket.onerror = () => {
      if (isMounted) {
        setConnected(false);
      }
    };

    return () => {
      isMounted = false;
      if (heartbeat) {
        window.clearInterval(heartbeat);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

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

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "READ",
            }
          : item
      )
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Notificaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bandeja del usuario autenticado en tiempo real.
          </Typography>
        </Box>

        <Chip
          icon={connected ? <WifiIcon /> : <WifiOffIcon />}
          label={connected ? "Conexión en vivo" : "Sin conexión en vivo"}
          color={connected ? "success" : "warning"}
          variant="filled"
        />
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

      {!connected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          El canal en tiempo real está desconectado. La bandeja sigue funcionando localmente y se volverá a sincronizar cuando la conexión vuelva.
        </Alert>
      )}

      <Paper>
        <List disablePadding>
          {filteredNotifications.length === 0 ? (
            <ListItem sx={{ py: 3, justifyContent: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No hay notificaciones para este filtro.
              </Typography>
            </ListItem>
          ) : (
            filteredNotifications.map((notification) => (
              <ListItem key={notification.id} divider sx={{ alignItems: "flex-start", py: 2.5, px: 2.5 }}>
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
                  <IconButton onClick={() => markAsRead(notification.id)} size="small" sx={{ ml: 1 }} aria-label="Marcar como leída">
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
