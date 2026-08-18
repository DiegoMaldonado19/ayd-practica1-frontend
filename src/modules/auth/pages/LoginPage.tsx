import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link as RouterLink, useLocation, useNavigate, type Location } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);

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
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register("password")}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword((current) => !current)}
                  onMouseDown={(event) => event.preventDefault()}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
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
