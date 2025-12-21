import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    headless: true,
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    viewport: { width: 1280, height: 800 }
  }
});
