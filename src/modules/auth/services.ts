import { apiClient } from "@/api/client";
import type { Page } from "@/api/types";
import type {
  ChangePasswordRequest,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  LoginSuccessResponse,
  PasswordRecoveryRequest,
  PasswordRecoveryResponse,
  PasswordResetRequest,
  TwoFactorPreferenceRequest,
  TwoFactorPreferenceResponse,
  UserProfile,
  VerificationRequest,
} from "./types";

export interface ListUsersParams {
  page?: number;
  size?: number;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", request);
  return response.data;
}

export async function verifyChallenge(
  challengeId: number,
  request: VerificationRequest,
): Promise<LoginSuccessResponse> {
  const response = await apiClient.post<LoginSuccessResponse>(
    `/auth/challenges/${challengeId}/verifications`,
    request,
  );
  return response.data;
}

export async function recoverPassword(request: PasswordRecoveryRequest): Promise<PasswordRecoveryResponse> {
  const response = await apiClient.post<PasswordRecoveryResponse>("/auth/password-recoveries", request);
  return response.data;
}

export async function resetPassword(request: PasswordResetRequest): Promise<void> {
  await apiClient.post("/auth/password-resets", request);
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getCurrentUser(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>("/auth/me");
  return response.data;
}

export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  await apiClient.put("/users/me/password", request);
}

export async function updateTwoFactorPreference(
  request: TwoFactorPreferenceRequest,
): Promise<TwoFactorPreferenceResponse> {
  const response = await apiClient.patch<TwoFactorPreferenceResponse>("/users/me/two-factor", request);
  return response.data;
}

export async function createUser(request: CreateUserRequest): Promise<void> {
  await apiClient.post("/users", request);
}

export async function listUsers(params: ListUsersParams): Promise<Page<UserProfile>> {
  const response = await apiClient.get<Page<UserProfile>>("/users", { params });
  return response.data;
}
