import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { getErrorMessage } from "@/api/types";
import { AuthCard } from "../components/AuthCard";
import { useResetPasswordMutation } from "../hooks";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas";

interface RecoveryState {
  challengeId: number;
  maskedDestination: string;
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const recovery = location.state as RecoveryState | null;

  const resetMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { code: "", new_password: "", confirm_password: "" },
  });

  if (!recovery) {
    return <Navigate to="/forgot-password" replace />;
  }

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetMutation.mutate(
      { challenge_id: recovery.challengeId, code: values.code, new_password: values.new_password },
      {
        onSuccess: () => {
          enqueueSnackbar("Contraseña restablecida. Inicia sesión con tu nueva contraseña.", {
            variant: "success",
          });
          navigate("/login", { replace: true });
        },
      },
    );
  };

  return (
    <AuthCard
      title="Restablecer contraseña"
      subtitle={`Ingresa el código enviado a ${recovery.maskedDestination}`}
    >
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        {resetMutation.isError && <Alert severity="error">{getErrorMessage(resetMutation.error)}</Alert>}

        <TextField
          label="Código de recuperación"
          autoComplete="one-time-code"
          autoFocus
          inputProps={{ maxLength: 6, inputMode: "numeric" }}
          error={Boolean(errors.code)}
          helperText={errors.code?.message}
          {...register("code")}
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
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          error={Boolean(errors.confirm_password)}
          helperText={errors.confirm_password?.message}
          {...register("confirm_password")}
        />

        <LoadingButton type="submit" variant="contained" size="large" loading={resetMutation.isPending}>
          Restablecer contraseña
        </LoadingButton>
      </Stack>
    </AuthCard>
  );
}
