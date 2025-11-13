// ======================================================================
// src/pages/Login.tsx
// Canonical Staff Portal Login
// - Redirects authenticated users
// - Uses AuthContext login()
// - Matches Staff UI layout conventions
// ======================================================================

import { useState, type FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Spinner } from "../components/common/Spinner";

const Login = () => {
  const { login, loading, user } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Already authenticated → skip login screen
  // -------------------------------------------------------------
  if (user) {
    return <Navigate to="/" replace />;
  }

  // -------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      setError("Unable to sign in with the provided credentials.");
    }
  };

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Staff Portal Login</h1>

        <label>
          Email
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <Button type="submit" disabled={loading} fullWidth>
          {loading ? <Spinner size="sm" /> : "Sign in"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
