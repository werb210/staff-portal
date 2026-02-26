import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.ts',
    exclude: [
      ...configDefaults.exclude,
      'tests/e2e/**',
      '**/*.e2e.*',
      'playwright/**'
    ],
  },
})
