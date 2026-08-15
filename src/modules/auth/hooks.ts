import { useMutation, useQuery } from "@tanstack/react-query";
import * as authService from "./services";
import type {
  ChangePasswordRequest,
  LoginRequest,
  PasswordRecoveryRequest,
  PasswordResetRequest,
  TwoFactorPreferenceRequest,
  VerificationRequest,
} from "./types";

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

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (request: ChangePasswordRequest) => authService.changePassword(request),
  });
}

export function useUpdateTwoFactorMutation() {
  return useMutation({
    mutationFn: (request: TwoFactorPreferenceRequest) => authService.updateTwoFactorPreference(request),
  });
}

export function useUsers(params: { page?: number; size?: number } = {}, enabled = true) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => authService.listUsers(params),
    enabled,
  });
}
