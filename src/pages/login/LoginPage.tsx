import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { isAuthenticated, user, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.requiresOtp) {
        navigate("/otp", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleSubmit = async (email: string, password: string) => {
    await login(email, password);
  };

  return (
    <div className="login-page">
      {/* existing login form remains unchanged */}
    </div>
  );
}
