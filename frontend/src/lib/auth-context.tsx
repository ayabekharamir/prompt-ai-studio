"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { getCurrentUser, loginUser, registerUser } from "@/services/auth.service";
import { getAccessToken, storeTokens, clearTokens } from "@/lib/token-storage";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (data: { email?: string; phone_number?: string; password: string }) => Promise<void>;
  register: (data: {
    full_name: string;
    email?: string;
    phone_number?: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await getCurrentUser();
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (data: { email?: string; phone_number?: string; password: string }) => {
      const tokens = await loginUser(data);
      storeTokens(tokens.access_token, tokens.refresh_token);
      const me = await getCurrentUser();
      setUser(me);
    },
    []
  );

  const register = useCallback(
    async (data: {
      full_name: string;
      email?: string;
      phone_number?: string;
      password: string;
    }) => {
      await registerUser(data);
      // Backend register doesn't return tokens — log the user in right after.
      await login({ email: data.email, phone_number: data.phone_number, password: data.password });
    },
    [login]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refreshUser: loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
