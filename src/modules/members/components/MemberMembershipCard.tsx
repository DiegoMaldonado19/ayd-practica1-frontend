import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { WorkspacePremium as WorkspacePremiumIcon } from "@mui/icons-material";
import { useMemberMembershipHistory } from "@/modules/membership/hooks";
import type { MembershipStatus } from "@/modules/membership/types";

const membershipStatusLabel: Record<MembershipStatus, string> = {
  ACTIVE: "Activa",
  FROZEN: "Congelada",
  EXPIRED: "Vencida",
  CANCELLED: "Cancelada",
};

const membershipStatusColor: Record<MembershipStatus, "success" | "warning" | "error" | "default"> = {
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

function MembershipTile({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string | null | undefined;
  valueColor?: string;
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: "rgba(255, 255, 255, 0.65)",
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, color: valueColor }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export function MemberMembershipCard({ memberId }: { memberId: number }) {
  const { data: membershipHistory, isLoading: loadingMembership } = useMemberMembershipHistory(memberId);

  const currentMembership =
    membershipHistory?.content.find((m) => m.status === "ACTIVE" || m.status === "FROZEN") ??
    membershipHistory?.content[0];

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: "rgba(37, 99, 235, 0.06)",
        borderLeft: "4px solid",
        borderLeftColor: "primary.main",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <WorkspacePremiumIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Membresía contratada
        </Typography>
        {currentMembership && (
          <Chip
            label={membershipStatusLabel[currentMembership.status]}
            color={membershipStatusColor[currentMembership.status]}
            size="small"
          />
        )}
      </Stack>

      {loadingMembership ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Cargando membresía...
          </Typography>
        </Box>
      ) : currentMembership ? (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <MembershipTile
                label="Plan"
                value={`${currentMembership.plan.name} (${currentMembership.plan.code})`}
                valueColor="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MembershipTile
                label="Período de facturación"
                value={billingPeriodLabel[currentMembership.plan.billing_period] ?? currentMembership.plan.billing_period}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MembershipTile
                label="Precio"
                value={`Q ${(Number(currentMembership.paid_price) || Number(currentMembership.plan.price)).toFixed(2)}`}
                valueColor="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MembershipTile label="Fecha de inicio" value={currentMembership.start_date} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MembershipTile label="Fecha de fin" value={currentMembership.end_date} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MembershipTile label="Días restantes" value={String(currentMembership.days_remaining)} />
            </Grid>
          </Grid>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Beneficios:
            </Typography>
            {[
              currentMembership.plan.includes_group_classes
                ? `Clases grupales${currentMembership.plan.weekly_class_limit != null ? ` (hasta ${currentMembership.plan.weekly_class_limit}/semana)` : ""}`
                : "",
              currentMembership.plan.includes_personal_trainer ? "Entrenador personal" : "",
            ]
              .filter(Boolean)
              .map((benefit) => (
                <Chip key={benefit} label={benefit} size="small" variant="outlined" color="info" />
              ))}
            {!currentMembership.plan.includes_group_classes &&
              !currentMembership.plan.includes_personal_trainer && (
                <Typography variant="body2" color="text.secondary">
                  Sin beneficios adicionales
                </Typography>
              )}
          </Stack>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Este socio no tiene una membresía registrada.
        </Typography>
      )}
    </Paper>
  );
}