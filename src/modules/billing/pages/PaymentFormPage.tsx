import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreateGuestPass } from "@/modules/access/hooks";
import type { CreateGuestPassDTO } from "@/modules/access/types";
import type { DocumentType } from "@/modules/members/types";
import {
  Alert,
  Autocomplete,
  Snackbar,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, InfoOutlined as InfoOutlinedIcon, Save as SaveIcon } from "@mui/icons-material";
import { useCreatePayment } from "@/modules/billing/hooks";
import { useMembers } from "@/modules/members/hooks";
import { useMemberships } from "@/modules/membership/hooks";
import { usePromotions } from "@/modules/billing/hooks";
import type { Member } from "@/modules/members/types";
import type { Membership } from "@/modules/membership/types";
import type { Promotion } from "@/modules/billing/types";
import type { CreatePaymentPayload } from "@/modules/billing/types";

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

const schema = yup.object({
  member_id: yup.number().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
  membership_id: yup.number().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
  concept: yup.string().oneOf(["MEMBERSHIP", "GUEST_PASS"]).required("Selecciona un concepto"),
  payment_method: yup.string().oneOf(["CASH", "DEBIT_CARD"]).required("Selecciona un método"),
  promotion_id: yup.number().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
  amount: yup.number().typeError("Debe ser un número").min(0, "No puede ser negativo").required("El monto es requerido"),
  // Guest fields: required only when concept = GUEST_PASS
  guest_first_name: yup.string().when('concept', {
    is: 'GUEST_PASS',
    then: (s) => s.required('Nombre del invitado requerido'),
    otherwise: (s) => s.notRequired(),
  }),
  guest_last_name: yup.string().when('concept', {
    is: 'GUEST_PASS',
    then: (s) => s.required('Apellido del invitado requerido'),
    otherwise: (s) => s.notRequired(),
  }),
  guest_document_type: yup.mixed<DocumentType>().oneOf(["DPI", "PASSPORT", "NIT"]).when('concept', {
    is: 'GUEST_PASS',
    then: (s) => s.required('Selecciona el tipo de documento'),
    otherwise: (s) => s.notRequired(),
  }),
  guest_document_number: yup
    .string()
    .test('guest-doc-number', 'Documento inválido o requerido', function (value) {
      const parent = this.parent as Record<string, unknown> | undefined;
      const concept = parent?.concept as string | undefined;
      const docType = parent?.guest_document_type as string | undefined;
      if (concept !== 'GUEST_PASS') return true;
      if (!value) return this.createError({ message: 'Documento requerido' });
      if (docType === 'DPI' && !/^\d{13}$/.test(value)) return this.createError({ message: 'El DPI debe tener exactamente 13 dígitos' });
      if (docType === 'PASSPORT' && !/^\d{6}$|^\d{9}$/.test(value)) return this.createError({ message: 'El pasaporte debe tener 6 o 9 dígitos' });
      if (docType === 'NIT' && !/^\d{8}$|^\d{9}$/.test(value)) return this.createError({ message: 'El NIT debe tener 8 o 9 dígitos' });
      return true;
    }),
  guest_email: yup.string().email('Email inválido').nullable().notRequired(),
  guest_phone: yup.string().when('concept', {
    is: 'GUEST_PASS',
    then: (s) => s
      .transform((val) => (val ? String(val).replace(/\D/g, "") : ""))
      .nullable()
      .notRequired()
      .matches(/^$|^\d{8}$/, 'El teléfono debe tener exactamente 8 dígitos'),
    otherwise: (s) => s.notRequired(),
  }),
});

type FormValues = yup.InferType<typeof schema>;

const fieldInfo = (title: string, example: string) => ({ title, example });

/** Calcula el descuento y el total (neto) aplicando la promoción sobre el monto original. */
const computeDiscount = (
  gross: number,
  promotion: Promotion | null,
): { discount: number; net: number } => {
  if (!promotion) return { discount: 0, net: gross };
  if (promotion.discount_type === "PERCENTAGE") {
    const discount = (gross * Number(promotion.discount_value)) / 100;
    return { discount, net: Math.max(gross - discount, 0) };
  }
  const discount = Math.min(Number(promotion.discount_value), gross);
  return { discount, net: Math.max(gross - discount, 0) };
};

export function PaymentFormPage() {
  const navigate = useNavigate();
  const { mutateAsync: createPaymentAsync, isPending } = useCreatePayment();
  const { mutateAsync: createGuestAsync } = useCreateGuestPass();
  const [submitted, setSubmitted] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [promotionSearch, setPromotionSearch] = useState("");
  const { data: membersData, isFetching: isFetchingMembers } = useMembers({ page: 0, size: 8, search: memberSearch || undefined });
  const { data: promotionsData, isFetching: isFetchingPromotions } = usePromotions({ page: 0, size: 50 });

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      member_id: null,
      membership_id: null,
      concept: "MEMBERSHIP",
      payment_method: "CASH",
      promotion_id: null,
      amount: undefined as unknown as number,
    },
  });

  const selectedMemberId = useWatch({ control, name: "member_id" });
  const selectedMembershipId = useWatch({ control, name: "membership_id" });
  const selectedPromotionId = useWatch({ control, name: "promotion_id" });
  const selectedConcept = useWatch({ control, name: "concept" });
  const amount = useWatch({ control, name: "amount" });

  const { data: membershipData, isFetching: isFetchingMemberships } = useMemberships({ page: 0, size: 100 });
  const memberMemberships = useMemo(() => {
    if (!selectedMemberId) return [] as Membership[];
    return (membershipData?.content ?? []).filter((membership) => membership.member_id === selectedMemberId);
  }, [membershipData, selectedMemberId]);

  const selectedMembership = useMemo(
    () => memberMemberships.find((membership) => membership.membership_id === selectedMembershipId) ?? null,
    [memberMemberships, selectedMembershipId],
  );

  const selectedMember = useMemo(
    () => (membersData?.content ?? []).find((member) => member.member_id === selectedMemberId) ?? null,
    [membersData, selectedMemberId],
  );

  const selectedPromotion = useMemo(
    () => (promotionsData?.content ?? []).find((promo) => promo.promotion_id === selectedPromotionId) ?? null,
    [promotionsData, selectedPromotionId],
  );

  const grossAmount = useMemo(() => {
    if (selectedConcept === "MEMBERSHIP") {
      return selectedMembership ? Number(selectedMembership.plan.price) : 0;
    }
    return typeof amount === "number" && Number.isFinite(amount) && amount > 0 ? amount : 0;
  }, [selectedConcept, selectedMembership, amount]);

  const priceBreakdown = useMemo(() => {
    if (grossAmount <= 0) return null;
    const { discount, net } = computeDiscount(grossAmount, selectedPromotion);
    return { gross: grossAmount, discount, net, promotion: selectedPromotion };
  }, [grossAmount, selectedPromotion]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const filteredPromotions = useMemo(() => {
    const list = promotionsData?.content ?? [];
    if (!promotionSearch) return list;
    const needle = promotionSearch.toLowerCase();
    return list.filter((promotion) => `${promotion.name} ${promotion.code}`.toLowerCase().includes(needle));
  }, [promotionSearch, promotionsData]);

  const onSubmit = async (values: FormValues) => {
    if (values.amount === undefined || Number(values.amount) <= 0) {
      setSubmitted(false);
      return;
    }

    setSubmitted(true);

    try {
      const payload: CreatePaymentPayload = {
        member_id: values.member_id ?? null,
        guest_pass_id: null,
        membership_id: values.membership_id ?? null,
        concept: values.concept,
        payment_method: values.payment_method,
        promotion_id: values.promotion_id ?? null,
        amount: Number(values.amount),
      };

      if (values.concept === "GUEST_PASS") {
        const guestPayload: CreateGuestPassDTO = {
          person: {
            document_type: values.guest_document_type as DocumentType,
            document_number: values.guest_document_number as string,
            first_name: values.guest_first_name as string,
            last_name: values.guest_last_name as string,
            email: (values.guest_email ?? "") as string,
            phone: (values.guest_phone ?? "") as string,
          },
          pass_type: "PAID_DAY_PASS",
        };

        const guest = await createGuestAsync(guestPayload);
        if (guest && typeof guest.guest_pass_id === "number") {
          payload.guest_pass_id = guest.guest_pass_id;
          payload.member_id = null;
          payload.membership_id = null;
        }
      }

      await createPaymentAsync(payload);
      navigate(values.concept === "GUEST_PASS" ? "/access/guest-passes" : "/payments");
    } catch (error) {
      setSubmitted(false);
      const err = error as unknown as { response?: { data?: { message?: string } }; message?: string };
      const msg = err?.response?.data?.message ?? err?.message ?? String(error);
      setErrorMessage(msg || "Error al crear el pago");
      setSnackbarOpen(true);
    }
  };

  const infoIcon = (info: ReturnType<typeof fieldInfo>) => (
    <Tooltip title={`${info.title}. Ejemplo: ${info.example}`} arrow>
      <IconButton size="small" edge="end" sx={{ mr: 0.5 }}>
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/payments")} sx={{ mb: 2 }}>
        Volver
      </Button>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Registrar pago
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay pasarela de pago para el metodo de pago tarjeta
        </Alert>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={(membersData?.content ?? []) as Member[]}
                loading={isFetchingMembers}
                value={selectedMember}
                onChange={(_, value) => {
                  setValue("member_id", value?.member_id ?? null, { shouldValidate: true });
                  setValue("membership_id", null, { shouldValidate: true });
                  setValue("concept", "MEMBERSHIP");
                  setValue("amount", undefined as unknown as number, { shouldValidate: true });
                }}
                onInputChange={(_, newValue, reason) => {
                  if (reason === "input") {
                    setMemberSearch(newValue);
                  }
                }}
                getOptionLabel={(option) => `${option.person.full_name} · ${option.member_code}`}
                isOptionEqualToValue={(option, value) => option.member_id === value.member_id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Socio"
                    placeholder="Busca por nombre o código"
                    error={!!errors.member_id}
                    helperText={errors.member_id?.message}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: <>{infoIcon(fieldInfo("Socio que realiza el pago", "Ana López · M-1024"))}{params.InputProps.endAdornment}</>,
                    }}
                  />
                )}
                noOptionsText="No se encontraron socios"
                disabled={selectedConcept === 'GUEST_PASS'}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={memberMemberships}
                loading={isFetchingMemberships}
                value={selectedMembership}
                onChange={(_, value) => {
                  setValue("membership_id", value?.membership_id ?? null, { shouldValidate: true });
                  setValue("amount", value ? Number(value.plan.price) : (undefined as unknown as number), { shouldValidate: true });
                }}
                getOptionLabel={(option) => `#${option.membership_id} · ${option.plan?.name ?? "Membresía"}`}
                isOptionEqualToValue={(option, value) => option.membership_id === value.membership_id}
                disabled={!selectedMemberId || selectedConcept === 'GUEST_PASS'}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Membresía"
                    placeholder={selectedMemberId ? "Selecciona la membresía" : "Primero elige un socio"}
                    error={!!errors.membership_id}
                    helperText={errors.membership_id?.message}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: <>{infoIcon(fieldInfo("Membresía asociada al pago", "#12 · Premium"))}{params.InputProps.endAdornment}</>,
                    }}
                  />
                )}
                noOptionsText="No hay membresías para este socio"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={filteredPromotions as Promotion[]}
                loading={isFetchingPromotions}
                value={selectedPromotion}
                onChange={(_, value) => {
                  setValue("promotion_id", value?.promotion_id ?? null, { shouldValidate: true });
                }}
                onInputChange={(_, newValue, reason) => {
                  if (reason === "input") {
                    setPromotionSearch(newValue);
                  }
                }}
                getOptionLabel={(option) => `${option.code} · ${option.name}`}
                isOptionEqualToValue={(option, value) => option.promotion_id === value.promotion_id}
                filterOptions={(options) => options}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Promoción"
                    placeholder="Busca promoción por código o nombre"
                    helperText={errors.promotion_id?.message}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: <>{infoIcon(fieldInfo("Promoción aplicada si corresponde", "VERANO10 · Descuento de verano"))}{params.InputProps.endAdornment}</>,
                    }}
                  />
                )}
                noOptionsText="No se encontró la promoción"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="concept"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Concepto"
                    fullWidth
                    error={!!errors.concept}
                    helperText={errors.concept?.message}
                    InputProps={{
                      endAdornment: infoIcon(fieldInfo("Tipo de cobro", "MEMBERSHIP")),
                    }}
                    onChange={(e) => {
                      field.onChange(e);
                      if (e.target.value === 'GUEST_PASS') {
                        setValue('member_id', null);
                        setValue('membership_id', null);
                        setValue('amount', undefined as unknown as number);
                      }
                    }}
                  >
                    <MenuItem value="MEMBERSHIP">Membresía</MenuItem>
                    <MenuItem value="GUEST_PASS">Pase de día</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="payment_method"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Método de pago"
                    fullWidth
                    error={!!errors.payment_method}
                    helperText={errors.payment_method?.message}
                    InputProps={{
                      endAdornment: infoIcon(fieldInfo("Medio de cobro registrado", "CASH o DEBIT_CARD")),
                    }}
                  >
                    <MenuItem value="CASH">Efectivo</MenuItem>
                    <MenuItem value="DEBIT_CARD">Tarjeta débito</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Monto"
                    fullWidth
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    error={!!errors.amount}
                    helperText={
                      errors.amount?.message ??
                      (selectedConcept === "MEMBERSHIP" && selectedMembership
                        ? "Monto del plan: no editable"
                        : "Monto original (antes de descuento)")
                    }
                    disabled={selectedConcept === "MEMBERSHIP"}
                    InputProps={{ endAdornment: infoIcon(fieldInfo("Monto a pagar", "250.00")) }}
                  />
                )}
              />
            </Grid>
            {priceBreakdown && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">Monto original</Typography>
                      <Typography variant="body2">Q {priceBreakdown.gross.toFixed(2)}</Typography>
                    </Box>
                    {priceBreakdown.discount > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          Descuento ({priceBreakdown.promotion?.code ?? "promoción"})
                        </Typography>
                        <Typography variant="body2" color="success.main">-Q {priceBreakdown.discount.toFixed(2)}</Typography>
                      </Box>
                    )}
                    <Divider />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total a pagar</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Q {priceBreakdown.net.toFixed(2)}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            )}
            {selectedConcept === 'GUEST_PASS' && (
              <>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="guest_first_name"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Nombre del invitado" fullWidth error={!!errors.guest_first_name} helperText={errors.guest_first_name?.message} />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller
                    name="guest_last_name"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Apellido del invitado" fullWidth error={!!errors.guest_last_name} helperText={errors.guest_last_name?.message} />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller
                    name="guest_document_type"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Tipo de documento" fullWidth error={!!errors.guest_document_type} helperText={errors.guest_document_type?.message}>
                        <MenuItem value="DPI">DPI</MenuItem>
                        <MenuItem value="PASSPORT">Pasaporte</MenuItem>
                        <MenuItem value="NIT">NIT</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller
                    name="guest_document_number"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Número de documento" fullWidth error={!!errors.guest_document_number} helperText={errors.guest_document_number?.message} />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller
                    name="guest_email"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Email (opcional)" fullWidth error={!!errors.guest_email} helperText={errors.guest_email?.message} />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller
                    name="guest_phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Teléfono (opcional)"
                        fullWidth
                        error={!!errors.guest_phone}
                        helperText={errors.guest_phone?.message}
                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                        value={field.value ?? ""}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate("/payments")}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={isPending || submitted}>
              {isPending ? "Guardando..." : "Guardar pago"}
            </Button>
          </Box>
        </Box>
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}