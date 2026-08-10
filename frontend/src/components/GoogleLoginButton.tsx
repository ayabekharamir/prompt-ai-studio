"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAuth } from "@/lib/auth-context";

/**
 * Google Sign-In button, built on Google Identity Services (GIS).
 *
 * Frontend-only integration: on success this posts the Google ID token to
 * `POST /api/v1/auth/google` (see auth.service.ts). That backend endpoint
 * does not exist yet in Phase 1 — the User model already has
 * `oauth_provider` / `oauth_provider_id` columns reserved for it, but the
 * route itself still needs to be implemented (verify the ID token with
 * Google, find-or-create the user, return the normal TokenResponse).
 * Once that endpoint exists, this button works with no frontend changes.
 *
 * Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be set (see frontend/.env.example).
 */

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleLoginButtonProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const { lang, t } = useLanguage();
  const { loginWithGoogleToken } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!scriptLoaded || !clientId || !buttonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        try {
          await loginWithGoogleToken(response.credential);
          onSuccess();
        } catch (err: any) {
          onError(err?.response?.data?.detail || t("common.comingSoon"));
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      locale: lang === "fa" ? "fa" : "en",
      text: "continue_with",
    });
  }, [scriptLoaded, clientId, lang, onSuccess, onError, t, loginWithGoogleToken]);

  if (!clientId) {
    // Not configured yet — render a disabled-looking placeholder instead of
    // silently hiding the option, so it's obvious this just needs an env var.
    return (
      <button
        type="button"
        disabled
        title="NEXT_PUBLIC_GOOGLE_CLIENT_ID تنظیم نشده است"
        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-fg-subtle"
      >
        <GoogleIcon />
        {t("auth.login.googleButton")}
      </button>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={buttonRef} className="flex w-full justify-center [&>div]:w-full" />
    </>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.24 1.4-1.68 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.09.79 3.8 1.47l2.6-2.5C16.86 3.53 14.7 2.6 12 2.6 6.98 2.6 2.9 6.68 2.9 11.7S6.98 20.8 12 20.8c6.93 0 8.9-4.86 8.9-7.4 0-.5-.05-.87-.12-1.2H12z"
      />
    </svg>
  );
}
