import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Box, Button, Grid, MenuItem, Paper, Snackbar, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import { useCreateGuestPass } from "@/modules/access/hooks";
import type { CreateGuestPassDTO } from "@/modules/access/types";
import type { DocumentType } from "@/modules/members/types";
import { useCreatePayment, usePromotions } from "@/modules/billing/hooks";
import type { CreatePaymentPayload } from "@/modules/billing/types";
import { useMembers } from "@/modules/members/hooks";
import { useMemberships } from "@/modules/membership/hooks";
import type { Member } from "@/modules/members/types";
import type { Membership } from "@/modules/membership/types";
import type { Promotion } from "@/modules/billing/types";
import { paymentFormSchema, type PaymentFormValues } from "@/modules/billing/paymentFormSchema";
import { computeDiscount, fieldInfo } from "@/modules/billing/billingLabels";
import { BillingFormField } from "@/modules/billing/components/BillingFormField";
import { BillingAutocomplete } from "@/modules/billing/components/BillingAutocomplete";
import { GuestPassFields, PriceBreakdown } from "@/modules/billing/components/PaymentFormSections";

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
  } = useForm<PaymentFormValues>({
    resolver: yupResolver(paymentFormSchema),
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

  const onSubmit = async (values: PaymentFormValues) => {
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
              <BillingAutocomplete<Member>
                options={(membersData?.content ?? []) as Member[]}
                loading={isFetchingMembers}
                value={selectedMember}
                onChange={(value) => {
                  setValue("member_id", value?.member_id ?? null, { shouldValidate: true });
                  setValue("membership_id", null, { shouldValidate: true });
                  setValue("concept", "MEMBERSHIP");
                  setValue("amount", undefined as unknown as number, { shouldValidate: true });
                }}
                onInputChange={setMemberSearch}
                getOptionLabel={(option) => `${option.person.full_name} · ${option.member_code}`}
                isOptionEqualToValue={(option, value) => option.member_id === value.member_id}
                label="Socio"
                placeholder="Busca por nombre o código"
                error={errors.member_id?.message}
                info={fieldInfo("Socio que realiza el pago", "Ana López · M-1024")}
                noOptionsText="No se encontraron socios"
                disabled={selectedConcept === "GUEST_PASS"}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <BillingAutocomplete<Membership>
                options={memberMemberships}
                loading={isFetchingMemberships}
                value={selectedMembership}
                onChange={(value) => {
                  setValue("membership_id", value?.membership_id ?? null, { shouldValidate: true });
                  setValue("amount", value ? Number(value.plan.price) : (undefined as unknown as number), { shouldValidate: true });
                }}
                getOptionLabel={(option) => `#${option.membership_id} · ${option.plan?.name ?? "Membresía"}`}
                isOptionEqualToValue={(option, value) => option.membership_id === value.membership_id}
                label="Membresía"
                placeholder={selectedMemberId ? "Selecciona la membresía" : "Primero elige un socio"}
                error={errors.membership_id?.message}
                info={fieldInfo("Membresía asociada al pago", "#12 · Premium")}
                noOptionsText="No hay membresías para este socio"
                disabled={!selectedMemberId || selectedConcept === "GUEST_PASS"}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <BillingAutocomplete<Promotion>
                options={filteredPromotions as Promotion[]}
                loading={isFetchingPromotions}
                value={selectedPromotion}
                onChange={(value) => {
                  setValue("promotion_id", value?.promotion_id ?? null, { shouldValidate: true });
                }}
                onInputChange={setPromotionSearch}
                getOptionLabel={(option) => `${option.code} · ${option.name}`}
                isOptionEqualToValue={(option, value) => option.promotion_id === value.promotion_id}
                filterOptions={(options) => options}
                label="Promoción"
                placeholder="Busca promoción por código o nombre"
                error={errors.promotion_id?.message}
                info={fieldInfo("Promoción aplicada si corresponde", "VERANO10 · Descuento de verano")}
                noOptionsText="No se encontró la promoción"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <BillingFormField
                control={control}
                errors={errors}
                name="concept"
                label="Concepto"
                select
                info={fieldInfo("Tipo de cobro", "MEMBERSHIP")}
                onChange={(v) => {
                  if (v === "GUEST_PASS") {
                    setValue("member_id", null);
                    setValue("membership_id", null);
                    setValue("amount", undefined as unknown as number);
                  }
                  return v;
                }}
              >
                <MenuItem value="MEMBERSHIP">Membresía</MenuItem>
                <MenuItem value="GUEST_PASS">Pase de día</MenuItem>
              </BillingFormField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <BillingFormField
                control={control}
                errors={errors}
                name="payment_method"
                label="Método de pago"
                select
                info={fieldInfo("Medio de cobro registrado", "CASH o DEBIT_CARD")}
              >
                <MenuItem value="CASH">Efectivo</MenuItem>
                <MenuItem value="DEBIT_CARD">Tarjeta débito</MenuItem>
              </BillingFormField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <BillingFormField
                control={control}
                errors={errors}
                name="amount"
                label="Monto"
                type="number"
                value={(v) => v ?? ""}
                onChange={(v) => (v === "" ? undefined : Number(v))}
                disabled={selectedConcept === "MEMBERSHIP"}
                helperText={
                  selectedConcept === "MEMBERSHIP" && selectedMembership
                    ? "Monto del plan: no editable"
                    : "Monto original (antes de descuento)"
                }
                info={fieldInfo("Monto a pagar", "250.00")}
              />
            </Grid>

            {priceBreakdown && <PriceBreakdown {...priceBreakdown} />}

            {selectedConcept === "GUEST_PASS" && <GuestPassFields control={control} errors={errors} />}
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