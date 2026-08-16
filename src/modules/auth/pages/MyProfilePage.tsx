import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/auth/useAuth";
import { ROLE_LABEL } from "@/auth/permissions";
import { useMemberMembershipHistory } from "@/modules/membership/hooks";
import type { MembershipStatus } from "@/modules/membership/types";

const MEMBERSHIP_STATUS_LABEL: Record<MembershipStatus, string> = {
  ACTIVE: "Activa",
  FROZEN: "Congelada",
  EXPIRED: "Vencida",
  CANCELLED: "Cancelada",
};

const MEMBERSHIP_STATUS_COLOR: Record<MembershipStatus, "success" | "warning" | "error" | "default"> = {
  ACTIVE: "success",
  FROZEN: "warning",
  EXPIRED: "error",
  CANCELLED: "default",
};

const billingPeriodLabel: Record<string, string> = {
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  ANNUAL: "Anual",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export function MyProfilePage() {
  const { user } = useAuth();

  const memberId = user?.role === "MEMBER" ? (user.member_id ?? undefined) : undefined;
  const { data: history, isLoading: loadingMembership } = useMemberMembershipHistory(memberId);

  if (!user) return null;

  const currentMembership =
    history?.content.find((m) => m.status === "ACTIVE" || m.status === "FROZEN") ?? history?.content[0];

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Mi perfil
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {user.full_name}
          </Typography>
          <Chip size="small" label={ROLE_LABEL[user.role]} color="primary" variant="outlined" />
        </Stack>

        <Stack spacing={2.5}>
          <Field label="Usuario" value={user.username} />
          <Field label="Correo electrónico" value={user.email} />
          <Field label="Estado de la cuenta" value={user.status} />
          <Field
            label="Último inicio de sesión"
            value={user.last_login_at ? new Date(user.last_login_at).toLocaleString("es-GT") : ""}
          />
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        {user.role === "MEMBER" ? (
          <>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Mi membresía
              </Typography>
              {currentMembership && (
                <Chip
                  size="small"
                  label={MEMBERSHIP_STATUS_LABEL[currentMembership.status]}
                  color={MEMBERSHIP_STATUS_COLOR[currentMembership.status]}
                />
              )}
            </Stack>

            {!memberId ? (
              <Typography variant="body2" color="text.secondary">
                Aún no se pudo identificar tu expediente de socio. Vuelve a intentarlo más tarde.
              </Typography>
            ) : loadingMembership ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  Cargando membresía...
                </Typography>
              </Stack>
            ) : currentMembership ? (
              <Stack spacing={1.5}>
                <Field
                  label="Plan contratado"
                  value={`${currentMembership.plan.name} (${currentMembership.plan.code})`}
                />
                <Field
                  label="Período de facturación"
                  value={billingPeriodLabel[currentMembership.plan.billing_period] ?? currentMembership.plan.billing_period}
                />
                <Field
                  label="Precio"
                  value={`Q ${(Number(currentMembership.paid_price) || Number(currentMembership.plan.price)).toFixed(2)}`}
                />
                <Field label="Fecha de fin" value={currentMembership.end_date} />
                <Field label="Días restantes" value={String(currentMembership.days_remaining)} />
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No tienes una membresía registrada todavía.
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            El sistema todavía no permite que el personal ({ROLE_LABEL[user.role]}) edite sus propios datos
            de contacto — esa gestión la realiza un administrador desde el módulo de personal.
          </Typography>
        )}

        <Typography variant="body2" sx={{ mt: 1.5 }}>
          ¿Buscas cambiar tu contraseña o el doble factor?{" "}
          <Link component={RouterLink} to="/account/security">
            Ir a Seguridad
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
