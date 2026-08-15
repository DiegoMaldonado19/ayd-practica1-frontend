import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm, type Control, type FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowBack, Save } from "@mui/icons-material";
import {
  Box, Button, CircularProgress, Divider, Grid, MenuItem,
  Paper, TextField, Typography,
} from "@mui/material";
import { useCreateMember, useMember, useUpdateMember } from "@/modules/members/hooks";
import type { CreateMemberDTO, UpdateMemberDTO, DocumentType, Gender } from "@/modules/members/types";

const todayISO = () => new Date().toISOString().split("T")[0];
const yearsAgo = (n: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d.toISOString().split("T")[0];
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

const schema = yup.object({
  document_type: yup.mixed<DocumentType>().oneOf(["DPI", "PASSPORT", "NIT"]).required("Selecciona el tipo de documento"),
  document_number: yup.string().required("El número de documento es requerido")
    .when("document_type", {
      is: "DPI",
      then: (s) => s.matches(/^\d{13}$/, "El DPI debe tener exactamente 13 dígitos"),
      otherwise: (s) =>
        s.when("document_type", {
          is: "PASSPORT",
          then: (s2) => s2.matches(/^\d{6}$|^\d{9}$/, "El pasaporte debe tener 6 o 9 dígitos"),
          otherwise: (s2) =>
            s2.when("document_type", {
              is: "NIT",
              then: (s3) => s3.matches(/^\d{8}$|^\d{9}$/, "El NIT debe tener 8 o 9 dígitos"),
            }),
        }),
    }),
  first_name: yup.string().required("El nombre es requerido"),
  last_name: yup.string().required("El apellido es requerido"),
  gender: yup.mixed<Gender>().oneOf(["M", "F", "OTHER"]).required("Selecciona el género"),
  birth_date: yup
    .string()
    .required("La fecha de nacimiento es requerida")
    .test("not-future", "La fecha no puede ser futura", (v) => !v || v <= todayISO())
    .test("min-age", "El socio debe tener al menos 14 años", (v) => !v || v <= yearsAgo(14))
    .test("max-age", "La fecha de nacimiento no es válida", (v) => !v || v >= yearsAgo(120)),
  email: yup.string().email("Correo inválido").optional(),
  phone: yup
    .string()
    .transform((val) => val?.replace(/\D/g, "") || "")
    .matches(/^\d{8}$/, "El teléfono debe tener exactamente 8 dígitos")
    .optional(),
  address: yup.string().optional(),
  emergency_contact_name: yup.string().optional(),
  emergency_contact_phone: yup
    .string()
    .transform((val) => val?.replace(/\D/g, "") || "")
    .matches(/^\d{8}$/, "El teléfono debe tener exactamente 8 dígitos")
    .optional(),
  notes: yup.string().optional(),
});

type FormValues = yup.InferType<typeof schema>;
const secTitle = { fontWeight: 600, mb: 0.5 };
const secDesc = { color: "text.secondary", mb: 2.5 };

type FProps = {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  name: keyof FormValues;
  label: string;
  type?: string;
  select?: boolean;
  multiline?: boolean;
  rows?: number;
  children?: React.ReactNode;
  onChange?: (value: string) => string;
  helperText?: string;
};

function F({ control, errors, name, label, type = "text", select, multiline, rows, children, onChange, helperText }: FProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type={type}
          select={select}
          multiline={multiline}
          rows={rows}
          label={label}
          fullWidth
          error={!!errors[name]}
          helperText={errors[name]?.message || helperText}
          InputLabelProps={type === "date" ? { shrink: true } : undefined}
          onChange={(e) => {
            const value = onChange ? onChange(e.target.value) : e.target.value;
            field.onChange(value);
          }}
        >
          {children}
        </TextField>
      )}
    />
  );
}

export function MemberFormPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const isEdit = Boolean(memberId);
  const { data: member, isLoading } = useMember(isEdit ? Number(memberId) : undefined);
  const createMut = useCreateMember();
  const updateMut = useUpdateMember(Number(memberId));

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      document_type: "DPI", document_number: "", first_name: "", last_name: "",
      gender: "M", birth_date: "", email: "", phone: "", address: "",
      emergency_contact_name: "", emergency_contact_phone: "", notes: "",
    },
  });

  useEffect(() => {
    if (!member) return;
    reset({
      document_type: member.person.document_type,
      document_number: member.person.document_number,
      first_name: member.person.first_name,
      last_name: member.person.last_name,
      gender: member.person.gender,
      birth_date: member.person.birth_date ?? "",
      email: member.person.email ?? "",
      phone: formatPhone(member.person.phone ?? ""),
      address: member.person.address ?? "",
      emergency_contact_name: member.emergency_contact_name ?? "",
      emergency_contact_phone: formatPhone(member.emergency_contact_phone ?? ""),
      notes: member.notes ?? "",
    });
  }, [member, reset]);

  const onSubmit = (values: FormValues) => {
    const person = {
      document_type: values.document_type,
      document_number: values.document_number,
      first_name: values.first_name,
      last_name: values.last_name,
      gender: values.gender,
      birth_date: values.birth_date,
      email: values.email || undefined,
      phone: values.phone?.replace(/\D/g, "") || undefined,
      address: values.address || undefined,
    };
    const extra = {
      emergency_contact_name: values.emergency_contact_name || undefined,
      emergency_contact_phone: values.emergency_contact_phone?.replace(/\D/g, "") || undefined,
      notes: values.notes || undefined,
    };
    if (isEdit) {
      const p: UpdateMemberDTO = { person, ...extra };
      updateMut.mutate(p, { onSuccess: () => navigate(`/members/${memberId}`) });
    } else {
      const p: CreateMemberDTO = { person, ...extra };
      createMut.mutate(p, { onSuccess: (c) => navigate(`/members/${c.member_id}`) });
    }
  };

  if (isEdit && isLoading) {
    return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;
  }

  const saving = createMut.isPending || updateMut.isPending;
  const cancel = () => navigate(isEdit ? `/members/${memberId}` : "/members");
  const fProps = { control, errors };

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <Button startIcon={<ArrowBack />} onClick={cancel} sx={{ mb: 1 }}>Volver</Button>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? "Editar socio" : "Registrar nuevo socio"}
      </Typography>

      <Paper elevation={0} variant="outlined" sx={{ overflow: "hidden" }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography variant="h6" sx={secTitle}>Identificación</Typography>
            <Typography variant="body2" sx={secDesc}>Datos necesarios para identificar al socio.</Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <F {...fProps} name="document_type" label="Tipo de documento" select>
                  <MenuItem value="DPI">DPI</MenuItem>
                  <MenuItem value="PASSPORT">Pasaporte</MenuItem>
                  <MenuItem value="NIT">NIT</MenuItem>
                </F>
              </Grid>
              <Grid item xs={12} sm={8}>
                <F {...fProps} name="document_number" label="Número de documento" helperText="DPI: 13 dígitos · Pasaporte: 6 o 9 · NIT: 8 o 9" />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={secTitle}>Información personal</Typography>
            <Typography variant="body2" sx={secDesc}>Datos de contacto y nacimiento.</Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}><F {...fProps} name="first_name" label="Nombre" /></Grid>
              <Grid item xs={12} sm={6}><F {...fProps} name="last_name" label="Apellido" /></Grid>
              <Grid item xs={12} sm={5}>
                <F {...fProps} name="gender" label="Género" select>
                  <MenuItem value="M">Masculino</MenuItem>
                  <MenuItem value="F">Femenino</MenuItem>
                  <MenuItem value="OTHER">Otro</MenuItem>
                </F>
              </Grid>
              <Grid item xs={12} sm={7}>
                <F {...fProps} name="birth_date" label="Fecha de nacimiento" type="date" />
              </Grid>
              <Grid item xs={12} sm={6}><F {...fProps} name="email" label="Correo electrónico" type="email" /></Grid>
              <Grid item xs={12} sm={6}>
                <F {...fProps} name="phone" label="Teléfono" onChange={formatPhone} helperText="Formato: ####-####" />
              </Grid>
              <Grid item xs={12}><F {...fProps} name="address" label="Dirección" /></Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={secTitle}>Contacto de emergencia</Typography>
            <Typography variant="body2" sx={secDesc}>Persona a contactar en caso de emergencia.</Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}><F {...fProps} name="emergency_contact_name" label="Nombre completo" /></Grid>
              <Grid item xs={12} sm={6}>
                <F {...fProps} name="emergency_contact_phone" label="Teléfono" onChange={formatPhone} helperText="Formato: ####-####" />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={secTitle}>Notas adicionales</Typography>
            <Typography variant="body2" sx={secDesc}>Información adicional relevante sobre el socio.</Typography>
            <F {...fProps} name="notes" label="Notas" multiline rows={4} />
          </Box>

          <Box
            sx={{
              display: "flex", justifyContent: "flex-end", gap: 1.5,
              p: { xs: 2, sm: 3 }, bgcolor: "grey.50", borderTop: 1, borderColor: "divider",
            }}
          >
            <Button onClick={cancel} disabled={saving}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving} startIcon={<Save />}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}