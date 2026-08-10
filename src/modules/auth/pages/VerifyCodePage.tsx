import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/auth/useAuth";
import { getErrorMessage } from "@/api/types";
import { AuthCard } from "../components/AuthCard";
import { useVerifyChallengeMutation } from "../hooks";
import { verificationSchema, type VerificationFormValues } from "../schemas";

interface ChallengeState {
  challengeId: number;
  channel: "EMAIL" | "SMS";
  maskedDestination: string;
}

export function VerifyCodePage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const challenge = location.state as ChallengeState | null;

  const verifyMutation = useVerifyChallengeMutation(challenge?.challengeId ?? 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormValues>({
    resolver: yupResolver(verificationSchema),
    defaultValues: { code: "" },
  });

  if (!challenge) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = (values: VerificationFormValues) => {
    verifyMutation.mutate(values, {
      onSuccess: (response) => {
        setSession(response);
        navigate("/", { replace: true });
      },
    });
  };

  return (
    <AuthCard
      title="Verificación en dos pasos"
      subtitle={`Enviamos un código a ${challenge.maskedDestination}`}
    >
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        {verifyMutation.isError && <Alert severity="error">{getErrorMessage(verifyMutation.error)}</Alert>}

        <TextField
          label="Código de verificación"
          autoComplete="one-time-code"
          autoFocus
          inputProps={{ maxLength: 6, inputMode: "numeric" }}
          error={Boolean(errors.code)}
          helperText={errors.code?.message}
          {...register("code")}
        />

        <LoadingButton type="submit" variant="contained" size="large" loading={verifyMutation.isPending}>
          Verificar
        </LoadingButton>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          ¿No recibiste el código?{" "}
          <Link component="button" type="button" onClick={() => navigate("/login")}>
            Vuelve a iniciar sesión
          </Link>{" "}
          para solicitar uno nuevo.
        </Typography>
      </Stack>
    </AuthCard>
  );
}
