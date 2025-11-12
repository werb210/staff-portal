import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PortalButton } from '../../components/Button/PortalButton';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import type { LoginPayload, ReturningApplication } from '../../types/auth';
import type { Silo } from '../../types/rbac';
import { loadReturningApplications, mergeReturningApplications } from '../../utils/returningApplications';

interface FormState {
  email: string;
  password: string;
  silo: Silo;
  remember: boolean;
  applicationId: string;
}

const initialState: FormState = {
  email: '',
  password: '',
  silo: 'BF',
  remember: true,
  applicationId: '',
};

type LocationState = { from?: string } | null;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAuthStore((state) => state.status);
  const setSession = useAuthStore((state) => state.setSession);
  const setStatus = useAuthStore((state) => state.setStatus);
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [recentApps, setRecentApps] = useState<ReturningApplication[]>([]);
  const passkeySupported = useMemo(
    () => typeof window !== 'undefined' && 'PublicKeyCredential' in window,
    []
  );

  useEffect(() => {
    setRecentApps(loadReturningApplications());
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      const from = (location.state as LocationState)?.from ?? '/';
      navigate(from, { replace: true });
    }
  }, [location.state, navigate, status]);

  const selectedApplication = useMemo(
    () => recentApps.find((app) => app.id === form.applicationId) ?? null,
    [form.applicationId, recentApps]
  );

  const handleFieldChange = (key: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        event.target.type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const recordReturningApplications = (apps?: ReturningApplication[]) => {
    if (apps && apps.length > 0) {
      mergeReturningApplications(apps);
      setRecentApps(loadReturningApplications());
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload: LoginPayload = {
        email: form.email,
        password: form.password,
        silo: form.silo,
        remember: form.remember,
      };
      if (form.applicationId) {
        payload.applicationId = form.applicationId;
      }
      const response = await authService.login(payload);
      setSession({ token: response.token, user: response.user });
      recordReturningApplications(response.returningApplications);
      const from = (location.state as LocationState)?.from ?? '/';
      navigate(from, { replace: true });
    } catch (loginError) {
      console.error('Login attempt failed', loginError);
      setStatus('unauthenticated');
      setError('We could not sign you in. Please verify your credentials and try again.');
    } finally {
      setPending(false);
    }
  };

  const handlePasskeyLogin = async () => {
    if (!passkeySupported) {
      setError('Passkey sign-in is not supported on this device.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await authService.loginWithPasskey({
        credential: 'placeholder-passkey',
        silo: form.silo,
        applicationId: form.applicationId || undefined,
      });
      setSession({ token: response.token, user: response.user });
      recordReturningApplications(response.returningApplications);
      const from = (location.state as LocationState)?.from ?? '/';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Passkey login failed', error);
      setStatus('unauthenticated');
      setError('Passkey authentication is currently unavailable. Please use your password.');
    } finally {
      setPending(false);
    }
  };

  const handleOffice365Login = () => {
    const url = authService.getOffice365OAuthUrl();
    window.location.href = `${url}?redirect=${encodeURIComponent(window.location.origin)}`;
  };

  return (
    <div className="login" data-auth-state={status}>
      <div className="login__brand">
        <h1>Boreal Financial Staff Portal</h1>
        <p>
          Secure access for Boreal Financial (BF), Site Level Financial (SLF), and Business Intelligence (BI)
          teammates.
        </p>
      </div>
      <div className="login__card card" role="region" aria-labelledby="login-heading">
        <header className="login__header">
          <h2 id="login-heading">Sign in to continue</h2>
          <p>Manage applications, documents, pipeline activity, and communications in one place.</p>
        </header>
        {error && (
          <div className="login__error" role="alert">
            {error}
          </div>
        )}
        <form className="login__form" onSubmit={handleLogin}>
          <label>
            Work Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleFieldChange('email')}
              required
              disabled={pending}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleFieldChange('password')}
              required
              disabled={pending}
            />
          </label>
          <label>
            Silo
            <select name="silo" value={form.silo} onChange={handleFieldChange('silo')} disabled={pending}>
              <option value="BF">BF – Boreal Financial</option>
              <option value="SLF">SLF – Site Level Financial</option>
              <option value="BI">BI – Intelligence (preview)</option>
            </select>
          </label>
          <label>
            Returning Application ID
            <input
              name="applicationId"
              placeholder="Optional"
              value={form.applicationId}
              onChange={handleFieldChange('applicationId')}
              disabled={pending}
            />
          </label>
          <label className="login__checkbox">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleFieldChange('remember')}
              disabled={pending}
            />
            Remember this device
          </label>
          {selectedApplication && (
            <div className="login__returning-indicator" role="status">
              <strong>Returning to:</strong> {selectedApplication.businessName || selectedApplication.id}
              <span>
                {selectedApplication.stage ?? 'In progress'} · {selectedApplication.status ?? 'Awaiting update'}
              </span>
            </div>
          )}
          <PortalButton type="submit" tone="primary" fullWidth loading={pending}>
            Sign in
          </PortalButton>
        </form>
        <div className="login__divider" role="presentation">
          <span>or</span>
        </div>
        <div className="login__actions">
          <PortalButton
            type="button"
            tone="ghost"
            fullWidth
            disabled={pending || !passkeySupported}
            onClick={handlePasskeyLogin}
          >
            Use security passkey
          </PortalButton>
          <PortalButton type="button" tone="secondary" fullWidth disabled={pending} onClick={handleOffice365Login}>
            Continue with Office 365
          </PortalButton>
        </div>
        {recentApps.length > 0 && (
          <section className="login__returning" aria-label="Returning applications">
            <h3>Pick up where you left off</h3>
            <ul>
              {recentApps.map((app) => (
                <li key={app.id}>
                  <button
                    type="button"
                    className={`login__returning-button ${form.applicationId === app.id ? 'is-selected' : ''}`}
                    onClick={() => setForm((prev) => ({ ...prev, applicationId: app.id }))}
                    disabled={pending}
                  >
                    <span>{app.businessName || `Application ${app.id}`}</span>
                    <small>
                      {app.stage ?? 'Stage pending'} · {app.status ?? 'Status pending'}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
