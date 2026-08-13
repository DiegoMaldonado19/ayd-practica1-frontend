import { createContext } from "react";
import type { LoginSuccessResponse, UserProfile } from "@/modules/auth/types";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: UserProfile | null;
  status: SessionStatus;
  setSession: (response: LoginSuccessResponse) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
