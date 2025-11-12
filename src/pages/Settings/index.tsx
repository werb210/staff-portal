import { useState } from 'react';
import { Button } from '../../components/common/Button';
import { useAuthContext } from '../../context/AuthContext';

const SettingsPage = () => {
  const { user } = useAuthContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');

  const handlePasswordChange = () => {
    if (password !== confirmPassword) {
      setStatus('Passwords do not match.');
      return;
    }
    setStatus('Password updated successfully (placeholder).');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <section className="page">
      <header className="page-header">
        <h2>Settings</h2>
        <p>Manage your user profile and connected accounts.</p>
      </header>
      <div className="grid two-columns">
        <div className="card">
          <h3>Profile</h3>
          <dl>
            <dt>Name</dt>
            <dd>{user?.name}</dd>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
            <dt>Role</dt>
            <dd>{user?.role}</dd>
          </dl>
        </div>
        <div className="card">
          <h3>Change Password</h3>
          <label>
            New Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label>
            Confirm Password
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </label>
          <Button onClick={handlePasswordChange}>Update Password</Button>
          {status && <p>{status}</p>}
        </div>
      </div>
      <div className="card">
        <h3>Connected Accounts</h3>
        <p>Integrations with third-party services will appear here.</p>
      </div>
    </section>
  );
};

export default SettingsPage;
