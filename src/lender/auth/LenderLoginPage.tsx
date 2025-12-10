import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLenderAuth } from "./useLenderAuth";

const LenderLoginPage = () => {
  const navigate = useNavigate();
  const { login, triggerOtp } = useLenderAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      await triggerOtp(email);
      navigate("/lender/otp");
    } catch (err) {
      setError("Unable to login with those credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Card title="Lender Login">
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="auth-form__error">{error}</div>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending code..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LenderLoginPage;
