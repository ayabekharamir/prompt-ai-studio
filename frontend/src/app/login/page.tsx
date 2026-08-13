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
import { classNames } from "@/utils";

type IdentifierTab = "email" | "phone";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [tab, setTab] = useState<IdentifierTab>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(
        tab === "email" ? { email, password } : { phone_number: phone, password }
      );
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || t("auth.login.errorInvalid"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
      <div className="absolute end-6 top-6 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-fg">{t("auth.login.title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("auth.login.subtitle")}</p>

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

          {tab === "email" ? (
            <Field label={t("auth.login.email")} htmlFor="email">
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
            <Field label={t("auth.login.phone")} htmlFor="phone">
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

          <Field label={t("auth.login.password")} htmlFor="password">
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-fg-muted">
          {t("auth.login.noAccount")}{" "}
          <Link href="/register" className="font-medium text-brand hover:underline">
            {t("auth.login.registerLink")}
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
