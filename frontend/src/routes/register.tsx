import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Field, FormAlert, SubmitButton } from "@/components/auth/Field";
import { useAuth } from "@/context/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account | Prompt AI Studio" },
      {
        name: "description",
        content:
          "Create a Prompt AI Studio account and start generating on-brand AI prompts with your team.",
      },
      { property: "og:title", content: "Create account | Prompt AI Studio" },
      {
        property: "og:description",
        content:
          "Create a Prompt AI Studio account and start generating on-brand AI prompts with your team.",
      },
    ],
  }),
  component: RegisterPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) void router.navigate({ to: "/dashboard" });
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const next: Errors = {};
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await register({ full_name: fullName.trim(), email: email.trim(), password });
      await router.navigate({ to: "/dashboard" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up access for your brand and marketing team."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError ? <FormAlert message={formError} /> : null}
        <Field
          id="full_name"
          label="Full name"
          value={fullName}
          onChange={setFullName}
          error={errors.fullName}
          autoComplete="name"
          placeholder="Ada Lovelace"
          disabled={submitting}
        />
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          disabled={submitting}
        />
        <Field
          id="confirm_password"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          disabled={submitting}
        />
        <SubmitButton loading={submitting}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}