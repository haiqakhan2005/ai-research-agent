import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0D10",
          50: "#F4F5F5",
          900: "#0B0D10",
        },
        surface: {
          DEFAULT: "#14171B",
          raised: "#1B1F24",
          hover: "#20252B",
        },
        border: {
          DEFAULT: "#262B31",
          soft: "#1D2126",
        },
        ivory: {
          DEFAULT: "#ECEAE4",
          muted: "#9096A0",
          faint: "#5B6169",
        },
        facet: {
          teal: "#4FA793",
          "teal-soft": "#4FA79322",
          gold: "#D8A857",
          "gold-soft": "#D8A85722",
        },
        danger: "#D8756A",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "message-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.99)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "dot-pulse": {
          "0%, 80%, 100%": { opacity: "0.25", transform: "scale(0.85)" },
          "40%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "facet-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "facet-breathe": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "rise-in": "rise-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "message-in": "message-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "dot-pulse": "dot-pulse 1.4s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "facet-spin": "facet-spin 8s linear infinite",
        "facet-breathe": "facet-breathe 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
