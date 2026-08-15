import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm, type Control, type FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSnackbar } from "notistack";
import { ArrowBack, Autorenew, Save, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert, Box, Button, CircularProgress, Divider, Grid, IconButton,
  InputAdornment, MenuItem, Paper, TextField, Typography,
} from "@mui/material";
import { AppDatePicker } from "@/components/AppDatePicker";
import { useAuth } from "@/auth/useAuth";
import { getErrorMessage } from "@/api/types";
import { createUser } from "@/modules/auth/services";
import { useUsers } from "@/modules/auth/hooks";
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

/** Genera una contraseña alfanumérica que siempre contiene letras y números. */
const generateAlphanumericPassword = (length = 12): string => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const all = upper + lower + numbers;
  let password = upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  for (let index = 3; index < length; index += 1) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password.split("").sort(() => Math.random() - 0.5).join("");
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
  email: yup.string().email("Correo inválido").test(
    "email-required-for-access",
    "El correo es requerido para crear una cuenta de acceso",
    function (value) {
      const username = this.parent.username as string | undefined;
      return !username || Boolean(value);
    },
  ),
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
  username: yup
    .string()
    .matches(/^[a-zA-Z0-9._-]{3,30}$/, "Entre 3 y 30 caracteres: letras, números, puntos y guiones"),
  password: yup.string().test("password-for-access", "Contraseña inválida", function (value) {
    const username = this.parent.username as string | undefined;
    if (!username) return true;
    if (!value) return this.createError({ message: "La contraseña es requerida" });
    if (value.length < 8) return this.createError({ message: "La contraseña debe tener al menos 8 caracteres" });
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return this.createError({ message: "La contraseña debe ser alfanumérica (solo letras y números)" });
    }
    if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
      return this.createError({ message: "Debe contener al menos una letra y un número" });
    }
    return true;
  }),
  confirm_password: yup.string().test("confirm-for-access", "Las contraseñas no coinciden", function (value) {
    const username = this.parent.username as string | undefined;
    if (!username) return true;
    if (!value) return this.createError({ message: "Confirma la contraseña" });
    return value === this.parent.password;
  }),
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
      render={({ field }) =>
        type === "date" ? (
          <AppDatePicker
            label={label}
            value={String(field.value ?? "")}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={!!errors[name]}
            helperText={errors[name]?.message || helperText}
            fullWidth
          />
        ) : (
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
        )
      }
    />
  );
}

export function MemberFormPage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const isEdit = Boolean(memberId);
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const { data: member, isLoading } = useMember(isEdit ? Number(memberId) : undefined);
  const createMut = useCreateMember();
  const updateMut = useUpdateMember(Number(memberId));

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const personId = member?.person.person_id;

  const { data: usersData } = useUsers({ page: 0, size: 100 }, isEdit && isAdmin && Boolean(personId));
  const existingAccount = usersData?.content.find((u) => u.person_id === personId);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      document_type: "DPI", document_number: "", first_name: "", last_name: "",
      gender: "M", birth_date: "", email: "", phone: "", address: "",
      emergency_contact_name: "", emergency_contact_phone: "", notes: "",
      username: "", password: "", confirm_password: "",
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
      username: "",
      password: "",
      confirm_password: "",
    });
  }, [member, reset]);

  const handleGeneratePassword = () => {
    const password = generateAlphanumericPassword();
    setValue("password", password, { shouldValidate: true });
    setValue("confirm_password", password, { shouldValidate: true });
    setShowPassword(true);
  };

  const onSubmit = async (values: FormValues) => {
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
      try {
        const updatedMember = await updateMut.mutateAsync(p);

        if (!existingAccount && values.username && values.password) {
          setIsSubmittingAccount(true);
          try {
            await createUser({
              person_id: updatedMember.person.person_id,
              username: values.username,
              password: values.password,
              role: "MEMBER",
            });
            enqueueSnackbar("Cuenta de usuario creada exitosamente", { variant: "success" });
          } catch (userError: unknown) {
            enqueueSnackbar(
              `Datos actualizados, pero ocurrió un problema al crear la cuenta: ${getErrorMessage(userError)}`,
              { variant: "warning", persist: true },
            );
          } finally {
            setIsSubmittingAccount(false);
          }
        }

        navigate(`/members/${memberId}`);
      } catch {
        // El error de actualización ya es mostrado por la mutación.
      }
    } else {
      const p: CreateMemberDTO = { person, ...extra };
      try {
        const createdMember = await createMut.mutateAsync(p);

        if (values.username && values.password) {
          setIsSubmittingAccount(true);
          try {
            await createUser({
              person_id: createdMember.person.person_id,
              username: values.username,
              password: values.password,
              role: "MEMBER",
            });
            enqueueSnackbar("Cuenta de usuario creada exitosamente", { variant: "success" });
          } catch (userError: unknown) {
            enqueueSnackbar(
              `Socio creado, pero ocurrió un problema al crear la cuenta: ${getErrorMessage(userError)}`,
              { variant: "warning", persist: true },
            );
          } finally {
            setIsSubmittingAccount(false);
          }
        }

        navigate(`/members/${createdMember.member_id}`);
      } catch {
        // La mutación muestra el error del backend mediante su callback configurado.
      }
    }
  };

  if (isEdit && isLoading) {
    return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;
  }

  const saving = createMut.isPending || updateMut.isPending || isSubmittingAccount;
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
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1 }}>
              <Box>
                <Typography variant="h6" sx={secTitle}>Acceso al sistema (Cuenta de usuario)</Typography>
                <Typography variant="body2" sx={secDesc}>
                  {isEdit && existingAccount
                    ? "Esta persona ya tiene una cuenta de acceso."
                    : "Asignar credenciales para que la persona pueda iniciar sesión."}
                </Typography>
              </Box>
            </Box>
            {isEdit && existingAccount ? (
              <Alert severity="info" sx={{ mb: 1 }}>
                Usuario: <strong>{existingAccount.username}</strong> · Rol: {existingAccount.role}.
                {" "}Las credenciales existentes no se pueden modificar desde este formulario.
              </Alert>
            ) : (
              <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "grey.50", mb: 1 }}>
                <Grid container spacing={2.5} alignItems="flex-start">
                  <Grid item xs={12} sm={6}>
                    <F {...fProps} name="username" label="Nombre de usuario" helperText="Mínimo 3 caracteres alfanuméricos" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button variant="outlined" startIcon={<Autorenew />} onClick={handleGeneratePassword} sx={{ height: 56 }} fullWidth>
                      Generar contraseña alfanumérica
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ""}
                          type={showPassword ? "text" : "password"}
                          label="Contraseña"
                          fullWidth
                          error={!!errors.password}
                          helperText={errors.password?.message || "Alfanumérica, mín. 8 caracteres (letras y números)"}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton aria-label="mostrar u ocultar contraseña" onClick={() => setShowPassword((visible) => !visible)} edge="end">
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="confirm_password"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ""}
                          type={showPassword ? "text" : "password"}
                          label="Confirmar contraseña"
                          fullWidth
                          error={!!errors.confirm_password}
                          helperText={errors.confirm_password?.message || "Debe coincidir exactamente con la contraseña"}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

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
