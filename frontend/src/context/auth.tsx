import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";

import {
  api,
  clearTokens,
  getAccessToken,
  setSessionExpiredHandler,
  setTokens,
  type LoginPayload,
  type RegisterPayload,
  type User,
} from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      setUser(await api.me());
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Bootstrap session on mount (client-only: tokens live in localStorage).
  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  // When a silent refresh fails, drop the session and go to /login.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      void router.navigate({ to: "/login" });
    });
    return () => setSessionExpiredHandler(null);
  }, [router]);

  const login = useCallback(async (payload: LoginPayload) => {
    setTokens(await api.login(payload));
    setUser(await api.me());
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await api.register(payload);
      // Auto-login with the same credentials.
      const credentials: LoginPayload = { password: payload.password };
      if (payload.email) credentials.email = payload.email;
      else if (payload.phone_number) credentials.phone_number = payload.phone_number;
      await login(credentials);
    },
    [login],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    void router.navigate({ to: "/login" });
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser: loadUser,
    }),
    [user, isLoading, login, register, logout, loadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}