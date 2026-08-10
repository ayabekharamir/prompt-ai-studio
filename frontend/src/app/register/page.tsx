"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Alert, Card } from "@/components/ui/Card";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { requestPhoneOtp, verifyPhoneOtp } from "@/services/auth.service";
import { classNames } from "@/utils";

type IdentifierTab = "email" | "phone";
type Step = "form" | "otp";

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [tab, setTab] = useState<IdentifierTab>("email");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP step state
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register(
        tab === "email"
          ? { full_name: fullName, email, password }
          : { full_name: fullName, phone_number: phone, password }
      );
      if (tab === "phone") {
        setStep("otp");
        await sendOtp();
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || t("auth.register.errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  }

  async function sendOtp() {
    setOtpBusy(true);
    setOtpError(null);
    try {
      await requestPhoneOtp(phone);
      setOtpSent(true);
    } catch {
      setOtpError(t("auth.otp.requestError"));
    } finally {
      setOtpBusy(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpBusy(true);
    setOtpError(null);
    try {
      await verifyPhoneOtp(phone, otpCode);
      setOtpVerified(true);
      setTimeout(() => router.push("/dashboard"), 900);
    } catch {
      setOtpError(t("auth.otp.invalidCode"));
    } finally {
      setOtpBusy(false);
    }
  }

  if (step === "otp") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
        <div className="absolute end-6 top-6 flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-sm">
          <h1 className="text-xl font-bold text-fg">{t("auth.otp.title")}</h1>
          <p className="mt-1 text-sm text-fg-muted">{t("auth.otp.description")}</p>
          {otpSent && (
            <p className="mt-2 text-sm text-fg-muted">
              {t("auth.otp.codeSentTo", { phone })}
            </p>
          )}
          <p className="mt-1 text-xs text-fg-subtle">{t("auth.otp.mockNotice")}</p>

          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            {otpError && <Alert variant="error">{otpError}</Alert>}
            {otpVerified && <Alert variant="success">{t("auth.otp.verified")}</Alert>}

            <Field label={t("auth.otp.codeLabel")} htmlFor="otp_code">
              <Input
                id="otp_code"
                required
                dir="ltr"
                className="text-left tracking-widest"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </Field>

            <Button type="submit" isLoading={otpBusy} className="w-full">
              {otpBusy ? t("auth.otp.verifying") : t("auth.otp.verify")}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={sendOtp}
                className="font-medium text-brand hover:underline"
              >
                {t("auth.otp.resend")}
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="text-fg-muted hover:underline"
              >
                {t("auth.otp.skip")}
              </button>
            </div>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
      <div className="absolute end-6 top-6 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-fg">{t("auth.register.title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("auth.register.subtitle")}</p>

        <div className="mt-5">
          <GoogleLoginButton
            onSuccess={() => router.push("/dashboard")}
            onError={(message) => setError(message)}
          />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-fg-subtle">
          <div className="h-px flex-1 bg-border" />
          {t("common.or")}
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mb-4 flex rounded-lg border border-border p-0.5 text-sm">
          <TabButton active={tab === "email"} onClick={() => setTab("email")}>
            {t("auth.emailTab")}
          </TabButton>
          <TabButton active={tab === "phone"} onClick={() => setTab("phone")}>
            {t("auth.phoneTab")}
          </TabButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <Field label={t("auth.register.fullName")} htmlFor="full_name">
            <Input
              id="full_name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>

          {tab === "email" ? (
            <Field label={t("auth.register.email")} htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          ) : (
            <Field label={t("auth.register.phone")} htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                required
                dir="ltr"
                className="text-left"
                placeholder="09xxxxxxxxx"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
          )}

          <Field label={t("auth.register.password")} htmlFor="password">
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? t("auth.register.submitting") : t("auth.register.submit")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-fg-muted">
          {t("auth.register.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            {t("auth.register.loginLink")}
          </Link>
        </p>
      </Card>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "flex-1 rounded-md px-3 py-1.5 font-medium transition-colors",
        active ? "bg-brand text-white" : "text-fg-muted hover:text-fg"
      )}
    >
      {children}
    </button>
  );
}
