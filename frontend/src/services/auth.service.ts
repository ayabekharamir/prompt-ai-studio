/**
 * Auth-related API calls: register, login, refresh, phone OTP, Google.
 *
 * Status:
 * - Email/password register + login: fully active on the backend.
 * - Phone number + password register/login: active (same endpoints,
 *   `phone_number` instead of `email`).
 * - Phone OTP verification (`requestOtp` / `verifyOtp`): the backend
 *   endpoints exist but currently only mock-send the SMS (see
 *   backend/app/services/sms/sms_ir.py) — the calls below will still
 *   succeed against that mock, and need no changes once a real SMS
 *   provider is wired up.
 * - `loginWithGoogle`: posts to `/auth/google`, which does not exist on
 *   the backend yet — see GoogleLoginButton.tsx for the expected contract.
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

export async function requestPhoneOtp(phoneNumber: string): Promise<void> {
  await api.post("/auth/otp/request", { phone_number: phoneNumber });
}

export async function verifyPhoneOtp(phoneNumber: string, code: string): Promise<void> {
  await api.post("/auth/otp/verify", { phone_number: phoneNumber, code });
}

/**
 * NOTE: `/auth/google` is not implemented on the backend yet (Phase 1).
 * Expected contract once it exists:
 *   POST /api/v1/auth/google  { id_token: string }  -> TokenResponse
 * The backend should verify `id_token` with Google, find-or-create a User
 * (using the existing `oauth_provider` / `oauth_provider_id` columns), and
 * return the same { access_token, refresh_token } shape as /auth/login.
 */
export async function loginWithGoogle(idToken: string): Promise<AuthTokens> {
  const res = await api.post<AuthTokens>("/auth/google", { id_token: idToken });
  return res.data;
}
