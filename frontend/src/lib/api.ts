/**
 * Typed API client for the Prompt AI Studio backend.
 *
 * TOKEN STORAGE CHOICE:
 * Access + refresh tokens are kept in module memory and mirrored to
 * localStorage so a page reload keeps the session. TRADEOFF: localStorage is
 * readable by any script on the origin, so a successful XSS lets an attacker
 * steal both tokens. The XSS-safe option is httpOnly cookies set by the
 * backend, which the current API does not do (it returns tokens in the body).
 * Revisit once the backend can set cookies.
 */

const ACCESS_KEY = "pas.access_token";
const REFRESH_KEY = "pas.refresh_token";

export const API_URL: string = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  accessToken = window.localStorage.getItem(ACCESS_KEY);
  refreshToken = window.localStorage.getItem(REFRESH_KEY);
  hydrated = true;
}

export function getAccessToken(): string | null {
  hydrate();
  return accessToken;
}

export function setTokens(tokens: TokenResponse) {
  accessToken = tokens.access_token;
  refreshToken = tokens.refresh_token;
  hydrated = true;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCESS_KEY, tokens.access_token);
    window.localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  hydrated = true;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  }
}

/* ---------------------------------- types --------------------------------- */

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type User = {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_active: boolean;
  created_at: string;
};

export type RegisterPayload = {
  full_name: string;
  email?: string;
  phone_number?: string;
  password: string;
};

export type LoginPayload = {
  email?: string;
  phone_number?: string;
  password: string;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/* --------------------------------- request -------------------------------- */

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  /** internal: prevents refresh loops */
  _retried?: boolean;
};

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown; message?: string };
    const detail = data.detail ?? data.message;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const first = detail[0] as { msg?: string } | undefined;
      if (first?.msg) return first.msg;
    }
  } catch {
    /* non-JSON body */
  }
  return res.statusText || `Request failed (${res.status})`;
}

let refreshInFlight: Promise<boolean> | null = null;

/** Silent refresh, deduplicated across concurrent 401s. */
async function tryRefresh(): Promise<boolean> {
  hydrate();
  if (!refreshToken) return false;
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) return false;
        setTokens((await res.json()) as TokenResponse);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/** Called when refresh fails — the AuthProvider hooks into this. */
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(fn: (() => void) | null) {
  onSessionExpired = fn;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_URL) {
    throw new ApiError(0, "VITE_API_URL is not configured. Add it to your .env file.");
  }

  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? null : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Network error — could not reach the server.");
  }

  if (res.status === 401 && auth && !options._retried) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _retried: true });
    }
    clearTokens();
    onSessionExpired?.();
    throw new ApiError(401, await parseError(res));
  }

  if (!res.ok) throw new ApiError(res.status, await parseError(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ---------------------------------- api ----------------------------------- */

export const api = {
  register: (payload: RegisterPayload) =>
    apiFetch<User>("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload: LoginPayload) =>
    apiFetch<TokenResponse>("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => apiFetch<User>("/users/me"),
};