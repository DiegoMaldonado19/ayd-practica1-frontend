import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link as RouterLink, useLocation, useNavigate, type Location } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useAuth } from "@/auth/useAuth";
import { getErrorMessage } from "@/api/types";
import { AuthCard } from "../components/AuthCard";
import { useLoginMutation } from "../hooks";
import { loginSchema, type LoginFormValues } from "../schemas";
import { isLoginChallenge } from "../types";

export function LoginPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: (response) => {
        if (isLoginChallenge(response)) {
          navigate("/verify-code", {
            state: {
              challengeId: response.challenge_id,
              channel: response.channel,
              maskedDestination: response.masked_destination,
            },
          });
        } else {
          setSession(response);
          navigate(from, { replace: true });
        }
      },
    });
  };

  return (
    <AuthCard title="Iniciar sesión" subtitle="Sistema de Gestión de Gimnasio">
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        {loginMutation.isError && <Alert severity="error">{getErrorMessage(loginMutation.error)}</Alert>}

        <TextField
          label="Usuario"
          autoComplete="username"
          autoFocus
          error={Boolean(errors.username)}
          helperText={errors.username?.message}
          {...register("username")}
        />

        <TextField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register("password")}
        />

        <LoadingButton type="submit" variant="contained" size="large" loading={loginMutation.isPending}>
          Ingresar
        </LoadingButton>

        <Link component={RouterLink} to="/forgot-password" variant="body2" textAlign="center">
          ¿Olvidaste tu contraseña?
        </Link>
      </Stack>
    </AuthCard>
  );
}
