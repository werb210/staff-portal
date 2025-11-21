import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (!env.VITE_API_URL) {
    throw new Error("VITE_API_URL is required to run the Staff Portal.");
  }

  if (!env.VITE_API_URL.includes("/api")) {
    throw new Error("VITE_API_URL must include the /api base path.");
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
