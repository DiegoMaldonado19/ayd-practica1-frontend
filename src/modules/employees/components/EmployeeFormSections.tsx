import { useState } from "react";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Autorenew, Visibility, VisibilityOff } from "@mui/icons-material";
import { EmployeeFormField } from "./EmployeeFormField";
import { formatPhone } from "@/modules/employees/employeeFormSchema";
import type { EmployeeFormValues } from "@/modules/employees/employeeFormSchema";

type SectionProps = {
  control: Control<EmployeeFormValues>;
  errors: FieldErrors<EmployeeFormValues>;
};

export function FormSectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>
        {description}
      </Typography>
    </>
  );
}

export function IdentificationSection({ control, errors }: SectionProps) {
  return (
    <>
      <FormSectionHeader title="Identificación" description="Datos necesarios para identificar al empleado." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <EmployeeFormField control={control} errors={errors} name="document_type" label="Tipo de documento" select>
            <MenuItem value="DPI">DPI</MenuItem>
            <MenuItem value="PASSPORT">Pasaporte</MenuItem>
            <MenuItem value="NIT">NIT</MenuItem>
          </EmployeeFormField>
        </Grid>
        <Grid item xs={12} sm={8}>
          <EmployeeFormField
            control={control}
            errors={errors}
            name="document_number"
            label="Número de documento"
            helperText="DPI: 13 dígitos · Pasaporte: 6 o 9 · NIT: 8 o 9"
          />
        </Grid>
      </Grid>
    </>
  );
}

export function PersonalInfoSection({ control, errors }: SectionProps) {
  return (
    <>
      <FormSectionHeader title="Información personal" description="Datos de contacto y nacimiento." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <EmployeeFormField control={control} errors={errors} name="first_name" label="Nombre" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <EmployeeFormField control={control} errors={errors} name="last_name" label="Apellido" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <EmployeeFormField control={control} errors={errors} name="gender" label="Género" select>
            <MenuItem value="M">Masculino</MenuItem>
            <MenuItem value="F">Femenino</MenuItem>
            <MenuItem value="OTHER">Otro</MenuItem>
          </EmployeeFormField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <EmployeeFormField control={control} errors={errors} name="birth_date" label="Fecha de nacimiento" type="date" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <EmployeeFormField control={control} errors={errors} name="email" label="Correo electrónico" type="email" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <EmployeeFormField control={control} errors={errors} name="phone" label="Teléfono" onChange={formatPhone} helperText="Formato: ####-####" />
        </Grid>
        <Grid item xs={12}>
          <EmployeeFormField control={control} errors={errors} name="address" label="Dirección" />
        </Grid>
      </Grid>
    </>
  );
}

export function LaboralSection({ control, errors, isTrainer, isEdit }: SectionProps & { isTrainer: boolean; isEdit: boolean }) {
  return (
    <>
      <FormSectionHeader title="Información laboral" description="Datos del puesto y fecha de contratación." />
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <EmployeeFormField control={control} errors={errors} name="position" label="Puesto" select disabled={isEdit}>
            <MenuItem value="ADMIN">Administrador</MenuItem>
            <MenuItem value="RECEPTIONIST">Recepcionista</MenuItem>
            <MenuItem value="TRAINER">Entrenador</MenuItem>
          </EmployeeFormField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <EmployeeFormField control={control} errors={errors} name="hired_on" label="Fecha de contratación" type="date" />
        </Grid>

        {isTrainer && (
          <>
            <Grid item xs={12} sm={6}>
              <EmployeeFormField control={control} errors={errors} name="max_member_load" label="Carga máxima de socios" type="number" />
            </Grid>
            <Grid item xs={12}>
              <EmployeeFormField
                control={control}
                errors={errors}
                name="bio"
                label="Biografía / especialidad general"
                multiline
                rows={3}
                helperText="Máximo 500 caracteres"
              />
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
}

export function EmployeeAccountAccessFields({
  control,
  errors,
  isEdit,
  existingAccount,
  onGeneratePassword,
}: SectionProps & {
  isEdit: boolean;
  existingAccount?: { username: string; role: string } | null;
  onGeneratePassword: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleGenerate = () => {
    onGeneratePassword();
    setShowPassword(true);
  };

  return (
    <>
      <Box sx={{ mb: 1 }}>
        <FormSectionHeader
          title="Acceso al sistema (Cuenta de usuario)"
          description={
            isEdit && existingAccount
              ? "Esta persona ya tiene una cuenta de acceso."
              : "Asignar credenciales para que la persona pueda iniciar sesión."
          }
        />
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
              <EmployeeFormField
                control={control}
                errors={errors}
                name="username"
                label="Nombre de usuario"
                helperText="Mínimo 3 caracteres alfanuméricos"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                startIcon={<Autorenew />}
                onClick={handleGenerate}
                sx={{ height: 56 }}
                fullWidth
              >
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
                          <IconButton aria-label="mostrar/ocultar contraseña" onClick={() => setShowPassword(!showPassword)} edge="end">
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
    </>
  );
}