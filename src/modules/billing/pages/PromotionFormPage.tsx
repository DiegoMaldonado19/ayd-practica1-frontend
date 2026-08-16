import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, CircularProgress, Grid, MenuItem, Paper, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useCreatePromotion, usePromotion, useUpdatePromotion } from "@/modules/billing/hooks";
import type { CreatePromotionPayload } from "@/modules/billing/types";
import { promotionFormSchema, todayISO, type PromotionFormValues } from "@/modules/billing/promotionFormSchema";
import { fieldInfo } from "@/modules/billing/billingLabels";
import { BillingFormField } from "@/modules/billing/components/BillingFormField";

export function PromotionFormPage() {
  const navigate = useNavigate();
  const { promotionId } = useParams();
  const isEdit = Boolean(promotionId);

  const { data: promotion, isLoading: loadingPromotion } = usePromotion(
    isEdit ? Number(promotionId) : undefined,
  );
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion(Number(promotionId));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: yupResolver(promotionFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      discount_type: "PERCENTAGE",
      discount_value: 0,
      valid_from: "",
      valid_to: "",
      max_uses: null,
      max_uses_per_member: null,
    },
  });

  const validFrom = useWatch({ control, name: "valid_from" });

  useEffect(() => {
    if (!promotion) return;
    reset({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description ?? "",
      discount_type: promotion.discount_type,
      discount_value: Number(promotion.discount_value),
      valid_from: promotion.valid_from,
      valid_to: promotion.valid_to,
      max_uses: promotion.max_uses ?? null,
      max_uses_per_member: promotion.max_uses_per_member ?? null,
    });
  }, [promotion, reset]);

  const onSubmit = (values: PromotionFormValues) => {
    const payload: CreatePromotionPayload = {
      code: values.code,
      name: values.name,
      description: values.description || undefined,
      discount_type: values.discount_type,
      discount_value: Number(values.discount_value),
      valid_from: values.valid_from,
      valid_to: values.valid_to,
      max_uses: values.max_uses ?? null,
      max_uses_per_member: values.max_uses_per_member ?? null,
    };

    if (isEdit) {
      updateMutation.mutate(payload, {
        onSuccess: () => navigate("/promotions"),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate("/promotions"),
      });
    }
  };

  if (isEdit && loadingPromotion) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/promotions")} sx={{ mb: 2 }}>
        Volver
      </Button>

      <Typography variant="h4" sx={{ mb: 3 }}>
        {isEdit ? "Editar promoción" : "Nueva promoción"}
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <BillingFormField
                control={control}
                errors={errors}
                name="code"
                label="Código"
                info={fieldInfo("Identificador único de la promoción", "VERANO10")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <BillingFormField
                control={control}
                errors={errors}
                name="name"
                label="Nombre"
                info={fieldInfo("Nombre visible de la promoción", "Descuento de verano")}
              />
            </Grid>

            <Grid item xs={12}>
              <BillingFormField
                control={control}
                errors={errors}
                name="description"
                label="Descripción"
                multiline
                minRows={3}
                info={fieldInfo("Texto adicional para clientes y personal", "10% para membresías activas durante julio")}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <BillingFormField
                control={control}
                errors={errors}
                name="discount_type"
                label="Tipo de descuento"
                select
                info={fieldInfo("Regla sobre cómo se calcula el descuento", "Porcentaje")}
              >
                <MenuItem value="PERCENTAGE">Porcentaje</MenuItem>
                <MenuItem value="FIXED_AMOUNT">Monto fijo</MenuItem>
              </BillingFormField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <BillingFormField
                control={control}
                errors={errors}
                name="discount_value"
                label="Valor del descuento"
                type="number"
                value={(v) => v ?? ""}
                onChange={(v) => (v === "" ? 0 : Number(v))}
                info={fieldInfo("Monto o porcentaje del descuento", "10 para 10% o 75 para Q75.00")}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <BillingFormField
                control={control}
                errors={errors}
                name="max_uses"
                label="Máx. usos"
                type="number"
                value={(v) => v ?? ""}
                onChange={(v) => (v === "" ? null : Number(v))}
                info={fieldInfo("Límite total de veces que puede usarse", "50")}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <BillingFormField
                control={control}
                errors={errors}
                name="valid_from"
                label="Válida desde"
                type="date"
                minDate={todayISO()}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <BillingFormField
                control={control}
                errors={errors}
                name="valid_to"
                label="Válida hasta"
                type="date"
                minDate={validFrom || todayISO()}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <BillingFormField
                control={control}
                errors={errors}
                name="max_uses_per_member"
                label="Máx. por socio"
                type="number"
                value={(v) => v ?? ""}
                onChange={(v) => (v === "" ? null : Number(v))}
                info={fieldInfo("Límite por cada socio", "1")}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate("/promotions")}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={isSaving}>
              {isSaving ? "Guardando..." : isEdit ? "Actualizar" : "Guardar"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}