import type { Metadata } from "next";
import "./globals.css";

import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Prompt AI Studio",
  description: "Build Your Brand's AI Brain",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}