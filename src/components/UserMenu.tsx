import { useEffect, useState } from 'react';
import { getToken, clearToken } from '../services/auth';

interface UserProfile {
  name: string;
  role: string;
  email: string;
}

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Staff Member',
    role: 'Advisor',
    email: 'user@borealbank.com'
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // Example default profile; in a real app we'd fetch the profile with the token
      setProfile((prev) => ({ ...prev, name: 'Guest User', role: 'Viewer' }));
    }
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 600
          }}
        >
          {profile.name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()}
        </div>
        <div style={{ textAlign: 'left' }}>
          <span style={{ display: 'block', fontWeight: 600 }}>{profile.name}</span>
          <small style={{ color: 'var(--color-muted)' }}>{profile.role}</small>
        </div>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '3.25rem',
            right: 0,
            background: 'var(--color-surface)',
            borderRadius: '12px',
            padding: '1rem',
            minWidth: '220px',
            boxShadow: '0 18px 40px -22px rgba(15, 23, 42, 0.45)'
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <strong>{profile.name}</strong>
            <p style={{ margin: '0.25rem 0', color: 'var(--color-muted)', fontSize: '0.9rem' }}>{profile.email}</p>
            <span className="status-pill">{profile.role}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              clearToken();
              setProfile({ name: 'Guest User', role: 'Viewer', email: 'guest@borealbank.com' });
            }}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid rgba(148, 163, 184, 0.4)',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
