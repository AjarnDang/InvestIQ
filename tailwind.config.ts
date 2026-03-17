import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 0.25rem)",
        "2xl": "calc(var(--radius) + 0.5rem)",
      },
      fontFamily: {
        sans: [
          "var(--font-thai)",
          "var(--font-display)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
        display: ["var(--font-display)", "var(--font-thai)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      fontWeight: {
        heading: "500",
      },
    },
  },
};

export default config;

