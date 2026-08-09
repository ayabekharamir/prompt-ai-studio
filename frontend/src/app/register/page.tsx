"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Alert, Card } from "@/components/ui/Card";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register({ full_name: fullName, email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "ثبت‌نام ناموفق بود. شاید این ایمیل قبلاً استفاده شده."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900">ساخت حساب کاربری</h1>
        <p className="mt-1 text-sm text-gray-500">
          چند ثانیه طول می‌کشد و بعد می‌تونید Workspace اولتون رو بسازید.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <Field label="نام کامل" htmlFor="full_name">
            <Input
              id="full_name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Field>

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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button type="submit" isLoading={isLoading} className="w-full">
            ثبت‌نام
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          قبلاً حساب دارید؟{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            وارد شوید
          </Link>
        </p>
      </Card>
    </main>
  );
}
