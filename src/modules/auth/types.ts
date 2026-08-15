export type Role = "ADMIN" | "RECEPTIONIST" | "TRAINER" | "MEMBER";

export interface CreateUserRequest {
  person_id: number;
  username: string;
  password: string;
  role: Role;
}

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING_ACTIVATION";

export type TwoFactorChannel = "EMAIL" | "SMS";

export interface UserProfile {
  app_user_id: number;
  person_id: number;
  // Requested from the backend team (/auth/me and the login response's `user` object),
  // not yet confirmed shipped: null/undefined for every role except MEMBER. Frontend is
  // built assuming it's present for a MEMBER; screens should still null-check it since
  // the change may not have landed yet.
  member_id?: number | null;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  status: UserStatus;
  two_factor_enabled: boolean;
  two_factor_channel: TwoFactorChannel;
  last_login_at: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginSuccessResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: UserProfile;
}

export interface LoginChallengeResponse {
  challenge_id: number;
  channel: TwoFactorChannel;
  masked_destination: string;
  expires_at: string;
}

export type LoginResponse = LoginSuccessResponse | LoginChallengeResponse;

export function isLoginChallenge(response: LoginResponse): response is LoginChallengeResponse {
  return "challenge_id" in response;
}

export interface VerificationRequest {
  code: string;
}

export interface PasswordRecoveryRequest {
  username: string;
}

export type PasswordRecoveryResponse = LoginChallengeResponse;

export interface PasswordResetRequest {
  challenge_id: number;
  code: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface TwoFactorPreferenceRequest {
  enabled: boolean;
  channel: TwoFactorChannel;
}

export interface TwoFactorPreferenceResponse {
  two_factor_enabled: boolean;
  two_factor_channel: TwoFactorChannel;
}
