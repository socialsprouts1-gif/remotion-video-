import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080b",
          900: "#0b0d12",
          850: "#0f1218",
          800: "#13161d",
          750: "#181c25",
          700: "#1e232e",
          600: "#2a303d",
          500: "#3a4252",
          400: "#5b6478",
          300: "#8a93a6",
          200: "#b8bfcc",
          100: "#e4e7ee",
        },
        accent: {
          DEFAULT: "#8b7bff",
          soft: "#a99dff",
          deep: "#5d4de0",
        },
        glow: { cyan: "#5ee1ff", amber: "#ffb65e", rose: "#ff6b9a", mint: "#5effb1" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
        glow: "0 0 0 1px rgba(139,123,255,0.35), 0 8px 30px -8px rgba(139,123,255,0.45)",
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: { shimmer: "shimmer 2.2s linear infinite" },
    },
  },
  plugins: [],
} satisfies Config;
