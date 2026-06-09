import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", lg: "1.5rem" },
      screens: { "2xl": "1320px" },
    },
    extend: {
      fontFamily: {
        mono: ["monospace"],
      },
      colors: {
        bg: "hsl(var(--bg) / <alpha-value>)",
        ink: "hsl(var(--ink) / <alpha-value>)",
        soft: "hsl(var(--soft) / <alpha-value>)",
        hair: "hsl(var(--hair) / <alpha-value>)",
        rule: "hsl(var(--rule) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        panel: "hsl(var(--panel) / <alpha-value>)",
      },
      borderRadius: { none: "0", sm: "0", DEFAULT: "0", md: "0", lg: "0", full: "0" },
    },
  },
  plugins: [],
};

export default config;
