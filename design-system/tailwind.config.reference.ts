// Reference Tailwind config for TuCierre
// Copy relevant sections into your actual tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Brand tokens
        primary: {
          DEFAULT: "#1a365d",
          light: "#2a4a7f",
          dark: "#122540",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#2d3748",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#38a169",
          light: "#48bb78",
          dark: "#276749",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#d69e2e",
          light: "#f6e05e",
          foreground: "#744210",
        },
        error: {
          DEFAULT: "#e53e3e",
          light: "#fed7d7",
          foreground: "#742a2a",
        },
        // Layout tokens
        background: "#f7fafc",
        surface: "#ffffff",
        border: "#e2e8f0",
        // Text tokens
        "text-primary": "#1a202c",
        "text-secondary": "#718096",
        "text-muted": "#a0aec0",
        // Tier colors
        tier: {
          bronce: "#c05621",
          plata: "#718096",
          oro: "#d69e2e",
        },
        // Status colors for tramites
        status: {
          cotizado: { bg: "#ebf8ff", text: "#2b6cb0", border: "#bee3f8" },
          solicitado: { bg: "#e9d8fd", text: "#553c9a", border: "#d6bcfa" },
          "documentos-pendientes": { bg: "#fefcbf", text: "#744210", border: "#f6e05e" },
          "en-revision": { bg: "#feebc8", text: "#7b341e", border: "#fbd38d" },
          "en-firma": { bg: "#bee3f8", text: "#2c5282", border: "#90cdf4" },
          "en-registro": { bg: "#c6f6d5", text: "#276749", border: "#9ae6b4" },
          completado: { bg: "#f0fff4", text: "#22543d", border: "#9ae6b4" },
          cancelado: { bg: "#fed7d7", text: "#742a2a", border: "#feb2b2" },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        // Custom type scale additions
        "display": ["clamp(2.25rem, 5vw, 3.5rem)", { lineHeight: "1.1", fontWeight: "700" }],
      },
      spacing: {
        // 4px base grid — these augment Tailwind's existing scale
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },
      borderRadius: {
        // Component radius system
        "xl": "0.75rem",   // cards
        "2xl": "1rem",     // modals, sheets
        "3xl": "1.5rem",   // hero cards
      },
      boxShadow: {
        // Elevation system
        "card": "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)",
        "card-hover": "0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 6px -1px rgba(0,0,0,0.06)",
        "modal": "0 20px 60px -10px rgba(0,0,0,0.20)",
      },
      keyframes: {
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "price-flash": {
          "0%": { color: "#38a169" },
          "50%": { color: "#276749", transform: "scale(1.02)" },
          "100%": { color: "#38a169", transform: "scale(1)" },
        },
      },
      animation: {
        "shimmer": "shimmer 2s linear infinite",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "fade-in": "fade-in 150ms ease-out",
        "price-flash": "price-flash 400ms ease-in-out",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        "fast": "150ms",
        "base": "200ms",
        "slow": "300ms",
      },
      zIndex: {
        "sticky": "10",
        "dropdown": "20",
        "modal": "40",
        "toast": "100",
        "overlay": "1000",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
