import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,

    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/__tests__/**/*.{ts,tsx}',
      'tests/**/*.test.{ts,tsx}'
    ],

    exclude: [
      'node_modules',
      'dist',
      'tests/e2e/**',
      '**/*.e2e.*',
      'playwright/**'
    ],
  },
})
