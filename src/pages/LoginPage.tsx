import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

export default function LoginPage() {
  const { loginWithOtp, status, authenticated } = useAuth()
  const navigate = useNavigate()

  const [phone, setPhone] = useState("")
  const [otpRequested, setOtpRequested] = useState(false)
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState<string | null>(null)

  if (status === "pending") {
    return <div>Loading...</div>
  }

  if (authenticated) {
    navigate("/dashboard", { replace: true })
  }

  async function handleRequestOtp() {
    setError(null)

    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })

    if (!res.ok) {
      setError("Failed to send code")
      return
    }

    setOtpRequested(true)
  }

  async function handleVerify() {
    setError(null)

    const code = digits.join("")

    try {
      await loginWithOtp(phone, code)
      navigate("/dashboard", { replace: true })
    } catch {
      setError("invalid_otp")
    }
  }

  function updateDigit(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const copy = [...digits]
    copy[index] = value
    setDigits(copy)
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-header">
          <h1>Staff Login</h1>
          <p>Sign in with your phone number or Microsoft 365 account.</p>
        </div>

        {error && <div role="alert">{error}</div>}

        <div className="login-body">
          {!otpRequested ? (
            <>
              <label>
                Phone number
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <button type="button" onClick={handleRequestOtp}>
                Send code
              </button>
            </>
          ) : (
            <>
              <div>
                {digits.map((digit, i) => (
                  <label key={i}>
                    OTP digit {i + 1}
                    <input
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => updateDigit(i, e.target.value)}
                    />
                  </label>
                ))}
              </div>

              <button type="button" onClick={handleVerify}>
                Verify
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
