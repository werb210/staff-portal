import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLenderAuth } from "./useLenderAuth";

const LenderOtpPage = () => {
  const navigate = useNavigate();
  const { pendingEmail, verifyOtp, triggerOtp } = useLenderAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await verifyOtp({ email: pendingEmail ?? "", code });
      navigate("/lender/dashboard", { replace: true });
    } catch (err) {
      setError("Invalid or expired code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Card title="Enter verification code">
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="text-sm text-slate-600">We sent a one-time code to {pendingEmail || "your email"}.</p>
          <Input
            label="6-digit code"
            name="otp"
            inputMode="numeric"
            pattern="[0-9]{6}"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {error && <div className="auth-form__error">{error}</div>}
          <div className="lender-cta-row">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
            <Button type="button" className="ui-button--ghost" onClick={() => triggerOtp()}>
              Resend code
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LenderOtpPage;
