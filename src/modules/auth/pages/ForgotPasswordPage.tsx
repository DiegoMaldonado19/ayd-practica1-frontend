import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { getErrorMessage } from "@/api/types";
import { AuthCard } from "../components/AuthCard";
import { useRecoverPasswordMutation } from "../hooks";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const recoverMutation = useRecoverPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { username: "" },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    recoverMutation.mutate(values, {
      onSuccess: (response) => {
        navigate("/reset-password", {
          state: { challengeId: response.challenge_id, maskedDestination: response.masked_destination },
        });
      },
    });
  };

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Te enviaremos un código temporal para restablecerla"
    >
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        {recoverMutation.isError && <Alert severity="error">{getErrorMessage(recoverMutation.error)}</Alert>}

        <TextField
          label="Usuario"
          autoComplete="username"
          autoFocus
          error={Boolean(errors.username)}
          helperText={errors.username?.message}
          {...register("username")}
        />

        <LoadingButton type="submit" variant="contained" size="large" loading={recoverMutation.isPending}>
          Enviar código
        </LoadingButton>

        <Link component={RouterLink} to="/login" variant="body2" textAlign="center">
          Volver a iniciar sesión
        </Link>
      </Stack>
    </AuthCard>
  );
}
