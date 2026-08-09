import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Field, FormAlert, SubmitButton } from "@/components/auth/Field";
import { useAuth } from "@/context/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in | Prompt AI Studio" },
      {
        name: "description",
        content: "Sign in to Prompt AI Studio to generate on-brand AI prompts for your team.",
      },
      { property: "og:title", content: "Sign in | Prompt AI Studio" },
      {
        property: "og:description",
        content: "Sign in to Prompt AI Studio to generate on-brand AI prompts for your team.",
      },
    ],
  }),
  component: LoginPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) void router.navigate({ to: "/dashboard" });
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      await router.navigate({ to: "/dashboard" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not sign you in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Enter your credentials to continue."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError ? <FormAlert message={formError} /> : null}
        <Field
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
          placeholder="you@company.com"
          disabled={submitting}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={submitting}
        />
        <SubmitButton loading={submitting}>Sign in</SubmitButton>
      </form>
    </AuthShell>
  );
}