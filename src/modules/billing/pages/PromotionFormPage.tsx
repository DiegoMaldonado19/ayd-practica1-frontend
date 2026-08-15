import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, InfoOutlined as InfoOutlinedIcon, Save as SaveIcon } from "@mui/icons-material";
import { useCreatePromotion, usePromotion, useUpdatePromotion } from "@/modules/billing/hooks";
import type { CreatePromotionPayload, PromotionDiscountType } from "@/modules/billing/types";

const todayISO = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getDayDiff = (from: string, to: string): number => {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 86400000);
};

const schema = yup.object({
  code: yup.string().trim().required("El código es requerido"),
  name: yup.string().trim().required("El nombre es requerido"),
  description: yup.string().trim().optional(),
  discount_type: yup
    .mixed<PromotionDiscountType>()
    .oneOf(["PERCENTAGE", "FIXED_AMOUNT"])
    .required("Selecciona el tipo de descuento"),
  discount_value: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("El valor del descuento es requerido"),
  valid_from: yup
    .string()
    .required("La fecha de inicio es requerida")
    .test("not-past", "La fecha de inicio no puede ser anterior a hoy", (value) => {
      if (!value) return true;
      return new Date(`${value}T00:00:00`) >= new Date(`${todayISO()}T00:00:00`);
    }),
  valid_to: yup
    .string()
    .required("La fecha de fin es requerida")
    .test("valid-range", "La fecha de fin no puede ser anterior a la fecha de inicio", function (value) {
      if (!value || !this.parent.valid_from) return true;
      return getDayDiff(this.parent.valid_from, value) >= 0;
    })
    .test("min-duration", "La promoción debe durar al menos 1 día", function (value) {
      if (!value || !this.parent.valid_from) return true;
      return getDayDiff(this.parent.valid_from, value) >= 1;
    }),
  max_uses: yup.number().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
  max_uses_per_member: yup.number().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
});

type FormValues = yup.InferType<typeof schema>;

const fieldInfo = (title: string, example: string) => ({
  title,
  example,
});

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
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
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

  const onSubmit = (values: FormValues) => {
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

  const infoIcon = (info: ReturnType<typeof fieldInfo>) => (
    <Tooltip title={`${info.title}. Ejemplo: ${info.example}`} arrow>
      <IconButton size="small" edge="end" sx={{ mr: 0.5 }}>
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

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
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Código"
                    fullWidth
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    InputProps={{
                      endAdornment: infoIcon(fieldInfo("Identificador único de la promoción", "VERANO10")),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
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
                    InputProps={{
                      endAdornment: infoIcon(fieldInfo("Nombre visible de la promoción", "Descuento de verano")),
                    }}
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
                    minRows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    InputProps={{
                      endAdornment: infoIcon(fieldInfo("Texto adicional para clientes y personal", "10% para membresías activas durante julio")),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="discount_type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Tipo de descuento"
                    fullWidth
                    error={!!errors.discount_type}
                    helperText={errors.discount_type?.message}
                    InputProps={{
                      endAdornment: infoIcon(fieldInfo("Regla sobre cómo se calcula el descuento", "Porcentaje")),
                    }}
                  >
                    <MenuItem value="PERCENTAGE">Porcentaje</MenuItem>
                    <MenuItem value="FIXED_AMOUNT">Monto fijo</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="discount_value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Valor del descuento"
                    fullWidth
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    error={!!errors.discount_value}
                    helperText={errors.discount_value?.message}
                    InputProps={{
                      endAdornment: infoIcon(fieldInfo("Monto o porcentaje del descuento", "10 para 10% o 75 para Q75.00")),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="max_uses"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Máx. usos"
                    fullWidth
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                    error={!!errors.max_uses}
                    helperText={errors.max_uses?.message}
                    InputProps={{
                      endAdornment: infoIcon(fieldInfo("Límite total de veces que puede usarse", "50")),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="valid_from"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Válida desde"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: todayISO() }}
                    error={!!errors.valid_from}
                    helperText={errors.valid_from?.message}
                    InputProps={{
                      endAdornment: infoIcon(fieldInfo("Fecha en la que empieza la promoción", "2026-08-15")),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="valid_to"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Válida hasta"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: validFrom || todayISO() }}
                    error={!!errors.valid_to}
                    helperText={errors.valid_to?.message}
                    InputProps={{
                      endAdornment: infoIcon(fieldInfo("Fecha final de vigencia", "2026-09-15")),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="max_uses_per_member"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Máx. por socio"
                    fullWidth
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                    error={!!errors.max_uses_per_member}
                    helperText={errors.max_uses_per_member?.message}
                    InputProps={{
                      endAdornment: infoIcon(fieldInfo("Límite por cada socio", "1")),
                    }}
                  />
                )}
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