import type { Metadata } from "next";
import { Vazirmatn, Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { ThemeProvider } from "@/lib/theme-context";
import QueryProvider from "@/providers/QueryProvider";


const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-fa",
  display: "swap",
});


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-en",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Prompt AI Studio | استودیو پرامپت هوشمند",
  description: "Build Your Brand's AI Brain | مغز هوشمند ساخت محتوای برندها",
  icons: {
    icon: "/logo.png",
  },
};


const bootstrapScript = `
(function () {
  try {
    var lang = localStorage.getItem("pas_lang") || "fa";
    var theme = localStorage.getItem("pas_theme");

    if (!theme) {
      theme =
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

  } catch (e) {}
})();
`;


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className={`${vazirmatn.variable} ${inter.variable}`}
    >

      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: bootstrapScript,
          }}
        />
      </head>


      <body suppressHydrationWarning>

        <QueryProvider>

          <ThemeProvider>

            <LanguageProvider>

              <AuthProvider>

                {children}

              </AuthProvider>

            </LanguageProvider>

          </ThemeProvider>

        </QueryProvider>

      </body>

    </html>
  );
}
