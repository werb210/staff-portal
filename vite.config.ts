import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: "/", // REQUIRED for Azure App Service
  resolve: {
    alias: {
      ...(process.env.VITEST
        ? { "@azure/msal-browser": path.resolve(__dirname, "src/test/msalBrowserMock.ts") }
        : {}),
      "@": path.resolve(__dirname, "./src")
    }
  },
  esbuild: mode === "production" ? { drop: ["console", "debugger"] } : undefined,
  build: {
    sourcemap: false,
    minify: "esbuild",
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        sw: path.resolve(__dirname, "src/sw.ts")
      },
      output: {
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === "sw" ? "sw.js" : "assets/[name]-[hash].js",
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor";
          }
          if (id.includes("node_modules/react-router-dom")) {
            return "router";
          }
          if (id.includes("/src/pages/admin")) {
            return "admin";
          }
        }
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test/setupTests.ts"],
    exclude: ["node_modules/**", "tests/e2e/**"]
  },
  server: {
    proxy: {}
  }
}));
