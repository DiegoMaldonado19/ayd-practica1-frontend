import { useMutation } from "@tanstack/react-query";
import * as authService from "./services";
import type { LoginRequest, PasswordRecoveryRequest, PasswordResetRequest, VerificationRequest } from "./types";

export function useLoginMutation() {
  return useMutation({
    mutationFn: (request: LoginRequest) => authService.login(request),
  });
}

export function useVerifyChallengeMutation(challengeId: number) {
  return useMutation({
    mutationFn: (request: VerificationRequest) => authService.verifyChallenge(challengeId, request),
  });
}

export function useRecoverPasswordMutation() {
  return useMutation({
    mutationFn: (request: PasswordRecoveryRequest) => authService.recoverPassword(request),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (request: PasswordResetRequest) => authService.resetPassword(request),
  });
}
