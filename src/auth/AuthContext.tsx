import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/api/client";
import * as authService from "@/modules/auth/services";
import type { LoginSuccessResponse, UserProfile } from "@/modules/auth/types";
import { AuthContext, type SessionStatus } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<SessionStatus>(() => (getAccessToken() ? "loading" : "unauthenticated"));

  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }

    authService
      .getCurrentUser()
      .then((profile) => {
        setUser(profile);
        setStatus("authenticated");
      })
      .catch(() => {
        clearAccessToken();
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  const setSession = useCallback((response: LoginSuccessResponse) => {
    setAccessToken(response.access_token);
    setUser(response.user);
    setStatus("authenticated");
  }, []);

  const updateUser = useCallback((partial: Partial<UserProfile>) => {
    setUser((current) => (current ? { ...current, ...partial } : current));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Server session is stateless — a failed logout call doesn't block
      // discarding the local token.
    }
    clearAccessToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, setSession, updateUser, logout }),
    [user, status, setSession, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
