import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt AI Studio | استودیو پرامپت هوشمند",
  description: "Build Your Brand's AI Brain — Brand Intelligence & Prompt Management SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
