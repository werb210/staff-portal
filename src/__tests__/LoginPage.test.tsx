import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '../pages/Auth/Login';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    loginWithPasskey: vi.fn(),
    getOffice365OAuthUrl: vi.fn(() => '/api/auth/oauth/office365'),
    logout: vi.fn(),
    fetchProfile: vi.fn(),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ status: 'unauthenticated', user: null, token: null, hydrated: true });
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders returning applications from cache', () => {
    window.localStorage.setItem(
      'bf_staff_portal_recent_apps',
      JSON.stringify([
        { id: 'app-100', businessName: 'Northwind', stage: 'Review', status: 'Pending', updatedAt: new Date().toISOString() },
      ])
    );

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Northwind/)).toBeInTheDocument();
  });

  it('submits credentials and stores session', async () => {
    const loginMock = authService.login as unknown as ReturnType<typeof vi.fn>;
    loginMock.mockResolvedValue({
      token: 'test-token',
      user: {
        id: 'user-1',
        name: 'Ops Manager',
        email: 'ops@example.com',
        role: 'manager',
        silo: 'BF',
        permissions: ['applications:create', 'pipeline:view'],
      },
      returningApplications: [],
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Work Email/i), { target: { value: 'ops@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secure-pass' } });
    fireEvent.change(screen.getByLabelText(/Returning Application ID/i), { target: { value: 'app-100' } });

    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalled();
    });

    expect(loginMock).toHaveBeenCalledWith({
      email: 'ops@example.com',
      password: 'secure-pass',
      silo: 'BF',
      remember: true,
      applicationId: 'app-100',
    });

    expect(useAuthStore.getState().status).toBe('authenticated');
  });
});
