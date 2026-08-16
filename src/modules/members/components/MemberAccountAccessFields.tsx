import { useState } from "react";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { Autorenew, Visibility, VisibilityOff } from "@mui/icons-material";
import { MemberFormField } from "./MemberFormField";
import { FormSectionHeader } from "./MemberFormSections";
import type { MemberFormValues } from "@/modules/members/memberFormSchema";

export function MemberAccountAccessFields({
  control,
  errors,
  isEdit,
  existingAccount,
  onGeneratePassword,
}: {
  control: Control<MemberFormValues>;
  errors: FieldErrors<MemberFormValues>;
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
              <MemberFormField
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
                          <IconButton
                            aria-label="mostrar u ocultar contraseña"
                            onClick={() => setShowPassword((visible) => !visible)}
                            edge="end"
                          >
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