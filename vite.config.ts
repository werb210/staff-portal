import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite runs on port 5173 by default.
// We force host: true so Codespaces exposes it publicly.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 5173,
  },
});
