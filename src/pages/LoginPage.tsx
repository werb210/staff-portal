import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import './login.css';

export default function LoginPage() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Errors handled by login
    }
  }

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={onSubmit}>
        <h1>Boreal Staff Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={loading} type="submit">
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </div>
  );
}
