import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global auth mock for protected routes
vi.mock('@/auth/AuthContext', async () => {
  const actual = await vi.importActual<any>('@/auth/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      user: { id: '1', role: 'admin', email: 'admin@test.com' },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    }),
  }
})
