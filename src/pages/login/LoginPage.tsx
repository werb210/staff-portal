import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { otp } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const navigate = useNavigate();
  const { setAuthenticated } = useAuth();

  const startOtp = async () => {
    await otp.post("/start", { phone });
    setStep("code");
  };

  const verifyOtp = async () => {
    await otp.post("/verify", { phone, code });
    setAuthenticated(true);
    navigate("/");
  };

  return (
    <div>
      {step === "phone" && (
        <>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
          />
          <button onClick={startOtp}>Submit code</button>
        </>
      )}

      {step === "code" && (
        <>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Verification code"
          />
          <button onClick={verifyOtp}>Verify code</button>
        </>
      )}
    </div>
  );
}
