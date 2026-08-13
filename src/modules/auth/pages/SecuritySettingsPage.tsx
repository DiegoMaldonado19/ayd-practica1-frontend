import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/auth/useAuth";
import { getErrorMessage } from "@/api/types";
import { useChangePasswordMutation, useUpdateTwoFactorMutation } from "../hooks";
import { changePasswordSchema, twoFactorSchema, type ChangePasswordFormValues, type TwoFactorFormValues } from "../schemas";

function ChangePasswordSection() {
  const { enqueueSnackbar } = useSnackbar();
  const changePasswordMutation = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(
      { current_password: values.current_password, new_password: values.new_password },
      {
        onSuccess: () => {
          enqueueSnackbar("Contraseña actualizada.", { variant: "success" });
          reset();
        },
      },
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h6">Cambiar contraseña</Typography>

        {changePasswordMutation.isError && (
          <Alert severity="error">{getErrorMessage(changePasswordMutation.error)}</Alert>
        )}

        <TextField
          label="Contraseña actual"
          type="password"
          autoComplete="current-password"
          error={Boolean(errors.current_password)}
          helperText={errors.current_password?.message}
          {...register("current_password")}
        />

        <TextField
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          error={Boolean(errors.new_password)}
          helperText={errors.new_password?.message}
          {...register("new_password")}
        />

        <TextField
          label="Confirmar nueva contraseña"
          type="password"
          autoComplete="new-password"
          error={Boolean(errors.confirm_password)}
          helperText={errors.confirm_password?.message}
          {...register("confirm_password")}
        />

        <LoadingButton
          type="submit"
          variant="contained"
          loading={changePasswordMutation.isPending}
          sx={{ alignSelf: "flex-start" }}
        >
          Guardar contraseña
        </LoadingButton>
      </Stack>
    </Paper>
  );
}

function TwoFactorSection() {
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const twoFactorMutation = useUpdateTwoFactorMutation();

  const { control, handleSubmit } = useForm<TwoFactorFormValues>({
    resolver: yupResolver(twoFactorSchema),
    defaultValues: {
      enabled: user?.two_factor_enabled ?? false,
      channel: user?.two_factor_channel ?? "EMAIL",
    },
  });

  const enabled = useWatch({ control, name: "enabled" });

  const onSubmit = (values: TwoFactorFormValues) => {
    twoFactorMutation.mutate(values, {
      onSuccess: (response) => {
        updateUser({ two_factor_enabled: response.two_factor_enabled, two_factor_channel: response.two_factor_channel });
        enqueueSnackbar(
          response.two_factor_enabled ? "Doble factor activado." : "Doble factor desactivado.",
          { variant: "success" },
        );
      },
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h6">Verificación en dos pasos</Typography>
        <Typography variant="body2" color="text.secondary">
          Al iniciar sesión, se te pedirá además un código temporal enviado por el canal que elijas.
        </Typography>

        {twoFactorMutation.isError && <Alert severity="error">{getErrorMessage(twoFactorMutation.error)}</Alert>}

        <Controller
          name="enabled"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
              label={field.value ? "Activado" : "Desactivado"}
            />
          )}
        />

        <Controller
          name="channel"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Canal" disabled={!enabled} sx={{ maxWidth: 240 }}>
              <MenuItem value="EMAIL">Correo electrónico</MenuItem>
              <MenuItem value="SMS">SMS</MenuItem>
            </TextField>
          )}
        />

        <LoadingButton
          type="submit"
          variant="contained"
          loading={twoFactorMutation.isPending}
          sx={{ alignSelf: "flex-start" }}
        >
          Guardar preferencia
        </LoadingButton>
      </Stack>
    </Paper>
  );
}

export function SecuritySettingsPage() {
  return (
    <Stack spacing={3} maxWidth={480}>
      <Typography variant="h4">Seguridad de la cuenta</Typography>
      <TwoFactorSection />
      <Divider />
      <ChangePasswordSection />
    </Stack>
  );
}
