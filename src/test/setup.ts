import '@testing-library/jest-dom'
import { vi } from 'vitest'

const authState = {
  user: null as null | { id: string; email: string; role: string },
  status: 'unauthenticated',
  location: '/login',
}

const setAuth = vi.fn((newUser) => {
  authState.user = newUser
  authState.status = 'authenticated:resolved'
  authState.location = '/dashboard'
})

const verifyOtp = vi.fn(async () => {
  setAuth({
    id: '1',
    email: 'restored@example.com',
    role: 'admin',
  })
  return { success: true }
})

const verifyOtp2 = verifyOtp

const logout = vi.fn(() => {
  authState.user = null
  authState.status = 'unauthenticated'
  authState.location = '/login'
})

vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    ...authState,
    loading: authState.status === 'loading',
    login: vi.fn(),
    logout,
    setAuth,
    verifyOtp,
    verifyOtp2,
  }),
}))

global.fetch = vi.fn(async (url: string) => {
  if (url.includes('/api/auth/me')) {
    return {
      ok: true,
      json: async () => ({
        id: '1',
        email: 'restored@example.com',
        role: 'admin',
      }),
    } as Response
  }

  return {
    ok: true,
    json: async () => ({
      status: 'ok',
      submissions: [],
    }),
  } as Response
})
