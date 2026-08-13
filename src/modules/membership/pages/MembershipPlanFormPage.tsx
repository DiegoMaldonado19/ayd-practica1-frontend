import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import {
  useCreateMembershipPlan,
  useMembershipPlan,
  useUpdateMembershipPlan,
  useUpdateMembershipPlanStatus,
} from "@/modules/membership/hooks";
import { billingPeriodLabel } from "@/modules/membership/labels";
import type { BillingPeriod } from "@/modules/membership/types";

const schema = yup.object({
  code: yup.string().required("El código es requerido"),
  name: yup.string().required("El nombre es requerido"),
  description: yup.string().optional(),
  billing_period: yup
    .mixed<BillingPeriod>()
    .oneOf(["MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL"])
    .required("Selecciona la periodicidad"),
  price: yup
    .number()
    .typeError("Debe ser un número")
    .positive("Debe ser mayor que cero")
    .required("El precio es requerido"),
  tier: yup
    .number()
    .typeError("Debe ser un número")
    .integer("Debe ser entero")
    .positive("Debe ser mayor que cero")
    .required("El tier es requerido"),
  includes_group_classes: yup.boolean().required(),
  weekly_class_limit: yup
    .number()
    .typeError("Debe ser un número")
    .integer("Debe ser entero")
    .positive("Debe ser mayor que cero")
    .nullable()
    .test(
      "limit-requires-classes",
      "Un plan sin clases grupales no puede tener límite semanal",
      (value, ctx) => {
        if (value == null) return true;
        return ctx.parent.includes_group_classes === true;
      }
    ),
  includes_personal_trainer: yup.boolean().required(),
});

type FormValues = yup.InferType<typeof schema>;

const sectionTitleSx = { fontWeight: 600, mb: 0.5 };
const sectionDescriptionSx = { color: "text.secondary", mb: 2.5 };

export function MembershipPlanFormPage() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const isEdit = Boolean(planId);

  const { data: plan, isLoading: isLoadingPlan } = useMembershipPlan(
    isEdit ? Number(planId) : undefined
  );
  const createMutation = useCreateMembershipPlan();
  const updateMutation = useUpdateMembershipPlan(Number(planId));
  const statusMutation = useUpdateMembershipPlanStatus(Number(planId));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      billing_period: "MONTHLY",
      price: undefined,
      tier: undefined,
      includes_group_classes: false,
      weekly_class_limit: null,
      includes_personal_trainer: false,
    },
  });

  useEffect(() => {
    if (!plan) return;
    reset({
      code: plan.code,
      name: plan.name,
      description: plan.description ?? "",
      billing_period: plan.billing_period,
      price: Number(plan.price),
      tier: plan.tier,
      includes_group_classes: plan.includes_group_classes,
      weekly_class_limit: plan.weekly_class_limit,
      includes_personal_trainer: plan.includes_personal_trainer,
    });
  }, [plan, reset]);

  const onSubmit = (values: FormValues) => {
    const common = {
      name: values.name,
      description: values.description || undefined,
      billing_period: values.billing_period,
      price: values.price as number,
      includes_group_classes: values.includes_group_classes,
      weekly_class_limit: values.includes_group_classes
        ? values.weekly_class_limit ?? null
        : null,
      includes_personal_trainer: values.includes_personal_trainer,
    };

    if (isEdit) {
      updateMutation.mutate(common, {
        onSuccess: () => navigate("/membership-plans"),
      });
    } else {
      createMutation.mutate(
        { ...common, code: values.code, tier: values.tier as number },
        { onSuccess: () => navigate("/membership-plans") }
      );
    }
  };

  if (isEdit && isLoadingPlan) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const cancel = () => navigate("/membership-plans");

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={cancel} sx={{ mb: 1 }}>
        Volver
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h4" component="h1">
          {isEdit ? "Editar plan" : "Nuevo plan"}
        </Typography>
        {isEdit && plan && (
          <Button
            variant="outlined"
            color={plan.active ? "error" : "success"}
            disabled={statusMutation.isPending}
            onClick={() => statusMutation.mutate({ active: !plan.active })}
          >
            {plan.active ? "Desactivar plan" : "Activar plan"}
          </Button>
        )}
      </Box>

      <Paper elevation={0} variant="outlined" sx={{ overflow: "hidden" }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography variant="h6" sx={sectionTitleSx}>
              Identidad del plan
            </Typography>
            <Typography variant="body2" sx={sectionDescriptionSx}>
              El código y el tier son únicos y no se pueden cambiar después de
              crear el plan.
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Código"
                      fullWidth
                      disabled={isEdit}
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      placeholder="BASIC, PREMIUM, ELITE..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="tier"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Tier"
                      fullWidth
                      disabled={isEdit}
                      error={!!errors.tier}
                      helperText={errors.tier?.message ?? "Define upgrades y prioridad en lista de espera"}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value)
                        )
                      }
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller   name="billing_period" control={control} render={({ field }) => (
                <TextField {...field} select label="Periodicidad" fullWidth error={!!errors.billing_period} helperText={errors.billing_period?.message} >
                      {(Object.keys(billingPeriodLabel) as BillingPeriod[]).map(
                        (period) => (
                          <MenuItem key={period} value={period}>
                            {billingPeriodLabel[period]}
                          </MenuItem>
                        )
                      )}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Precio (Q)"
                      fullWidth
                      error={!!errors.price}
                      helperText={errors.price?.message}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value)
                        )
                      }
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descripción"
                      fullWidth
                      multiline
                      rows={2}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={sectionTitleSx}>
              Beneficios
            </Typography>
            <Typography variant="body2" sx={sectionDescriptionSx}>
              Sin clases grupales no puede haber límite semanal; con límite
              vacío y clases activas, el plan queda con clases ilimitadas.
            </Typography>
            <Grid container spacing={2.5} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Controller
                  name="includes_group_classes"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <Typography>Incluye clases grupales</Typography>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="weekly_class_limit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Clases por semana"
                      fullWidth
                      error={!!errors.weekly_class_limit}
                      helperText={
                        errors.weekly_class_limit?.message ??
                        "Vacío = ilimitadas"
                      }
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="includes_personal_trainer"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <Typography>Incluye entrenador personal</Typography>
                    </Box>
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              p: { xs: 2, sm: 3 },
              bgcolor: "grey.50",
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Button onClick={cancel} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSaving}
              startIcon={<SaveIcon />}
            >
              {isSaving ? "Guardando..." : "Guardar plan"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}