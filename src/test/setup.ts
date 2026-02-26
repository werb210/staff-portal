import '@testing-library/jest-dom'
import { vi } from 'vitest'

const mockUser = {
  id: '1',
  role: 'Admin',
  email: 'admin@test.com'
}

vi.mock('@/auth/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('@/auth/AuthContext')>('@/auth/AuthContext')

  return {
    ...actual,
    useAuth: () => ({
      ...actual.useAuth(),
      user: mockUser,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      setAuth: vi.fn(),
      verifyOtp: vi.fn().mockResolvedValue({ success: true }),
      verifyOtp2: vi.fn().mockResolvedValue({ success: true }),
    }),
  }
})

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        status: 'authenticated',
        submissions: [],
      }),
  } as Response)
)
