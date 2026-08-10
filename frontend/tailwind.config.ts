import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4F46E5",
          dark: "#3730A3",
          light: "#818CF8",
        },
        // Semantic, theme-aware tokens. Their actual values come from CSS
        // variables defined in globals.css (:root for light, .dark for dark).
        // Using these instead of literal gray-* utilities means components
        // automatically support dark mode without per-class `dark:` prefixes.
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-hover": "var(--color-surface-hover)",
        "surface-muted": "var(--color-surface-muted)",
        fg: "var(--color-fg)",
        "fg-muted": "var(--color-fg-muted)",
        "fg-subtle": "var(--color-fg-subtle)",
        border: "var(--color-border)",
      },
      fontFamily: {
        fa: ["var(--font-fa)", "Tahoma", "system-ui", "sans-serif"],
        en: ["var(--font-en)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
