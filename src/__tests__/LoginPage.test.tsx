import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(async () => {
    throw new Error('not authenticated');
  }),
  logout: vi.fn(),
}));

const { login } = await import('../api/auth');

describe('Login page', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route path="/login" element={<Login />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );
  };

  it('submits credentials via the auth API', async () => {
    (login as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      token: 'test-token',
      user: { id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'Staff' },
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'secret' });
    });
  });
});
