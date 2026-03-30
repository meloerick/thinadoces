import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f7f8",
        foreground: "#121316",
        card: "#ffffff",
        muted: "#f0f1f5",
        border: "#d8dbe5",
        brand: {
          50: "#fff5f9",
          100: "#ffe4f0",
          200: "#ffc5de",
          300: "#ff9fc9",
          400: "#ff70ad",
          500: "#fb3b8d",
          600: "#df1f74",
          700: "#bc115d",
          800: "#9b124f",
          900: "#821347"
        }
      },
      boxShadow: {
        card: "0 10px 40px rgba(15, 18, 30, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up .35s ease-out"
      }
    },
  },
  plugins: [],
};

export default config;
