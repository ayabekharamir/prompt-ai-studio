/**
 * Central Axios instance for talking to the Prompt AI Studio backend.
 * Handles base URL + attaching the JWT access token to requests.
 */

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("pas_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// If the access token is missing/expired, the backend returns 401.
// Phase 1 doesn't implement silent refresh yet — clear the session and
// send the user back to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      window.localStorage.removeItem("pas_access_token");
      window.localStorage.removeItem("pas_refresh_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
