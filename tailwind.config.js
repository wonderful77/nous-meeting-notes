/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08090c",
          900: "#0c0e13",
          800: "#14161d",
          700: "#1c1f28",
          600: "#272b36",
        },
        silver: {
          100: "#f4f5f7",
          200: "#dfe2e8",
          300: "#c3c8d2",
          400: "#9aa1b0",
          500: "#727a8b",
        },
        accent: {
          DEFAULT: "#c9ccd4",
          glow: "#e9ebf0",
        },
      },
      fontFamily: {
        sans: [
          "PingFang TC",
          "Noto Sans TC",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        serif: ["Noto Serif TC", "Songti TC", "Georgia", "serif"],
        mono: ["SF Mono", "JetBrains Mono", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 24px 60px -24px rgba(0,0,0,0.7)",
        glow: "0 0 0 1px rgba(201,204,212,0.08), 0 12px 40px -12px rgba(0,0,0,0.8)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 2.2s linear infinite",
        "pulse-ring": "pulse-ring 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};
