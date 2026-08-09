"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Alert, Card } from "@/components/ui/Card";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "ایمیل یا رمز عبور اشتباه است."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900">ورود</h1>
        <p className="mt-1 text-sm text-gray-500">
          وارد حساب Prompt AI Studio خود شوید.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <Field label="ایمیل" htmlFor="email">
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="رمز عبور" htmlFor="password">
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
            ورود
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          حساب ندارید؟{" "}
          <Link href="/register" className="font-medium text-brand hover:underline">
            ثبت‌نام کنید
          </Link>
        </p>
      </Card>
    </main>
  );
}
