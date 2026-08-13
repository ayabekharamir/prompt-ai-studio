/**
 * Central Axios instance for Prompt AI Studio backend.
 * Handles base URL + JWT (supports both legacy and current token keys).
 */

import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL.replace(/\/$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
});

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  // کلیدهای رایج در پروژه (هر کدام که موجود باشد)
  return (
    window.localStorage.getItem("pas_access_token") ||
    window.localStorage.getItem("access_token") ||
    null
  );
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      window.localStorage.removeItem("pas_access_token");
      window.localStorage.removeItem("pas_refresh_token");
      window.localStorage.removeItem("access_token");
      window.localStorage.removeItem("refresh_token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
