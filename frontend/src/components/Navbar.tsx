import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-black"
        >
          Prompt AI Studio
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-black"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
