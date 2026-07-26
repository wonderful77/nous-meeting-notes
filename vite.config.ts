import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" 使用相對路徑，讓 GitHub Pages（專案頁子路徑）也能正確載入資產。
export default defineConfig({
  base: "./",
  plugins: [react()],
});
