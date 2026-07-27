/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 淺灰編輯風：ink = 由淺到深的表面色
        ink: {
          950: "#d4d5d7", // 頁面背景
          900: "#e6e7e9", // 卡片 / 導覽列
          800: "#eff0f2", // 輸入框 / 提升表面
          700: "#e3e4e6",
          600: "#d9dadd",
        },
        // silver = 文字與線條（由深到淺）
        silver: {
          100: "#16181d", // 標題（最強）／深色填色
          200: "#262931", // 內文
          300: "#3b3f47",
          400: "#5f6570", // 次要
          500: "#868b95", // 弱化標籤
        },
        accent: {
          DEFAULT: "#4a4f59",
          glow: "#16181d",
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
