/**
 * Auth-related API calls: register, login, refresh.
 * Note: SMS OTP and OAuth are not wired up in the UI yet — the backend
 * exposes the endpoints, but Phase 1 frontend focuses on email/password.
 */

import { api } from "./api";
import type { AuthTokens, User } from "@/types";

export async function registerUser(data: {
  full_name: string;
  email?: string;
  phone_number?: string;
  password: string;
}): Promise<User> {
  const res = await api.post<User>("/auth/register", data);
  return res.data;
}

export async function loginUser(data: {
  email?: string;
  phone_number?: string;
  password: string;
}): Promise<AuthTokens> {
  const res = await api.post<AuthTokens>("/auth/login", data);
  return res.data;
}

export async function getCurrentUser(): Promise<User> {
  const res = await api.get<User>("/users/me");
  return res.data;
}
