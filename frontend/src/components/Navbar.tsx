"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold text-brand">
          Prompt AI Studio
        </Link>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-gray-600">{user.full_name}</span>}
          <Button variant="ghost" onClick={logout}>
            خروج
          </Button>
        </div>
      </div>
    </header>
  );
}
