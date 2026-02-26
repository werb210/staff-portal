import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

export default function LoginPage() {
  const { loginWithOtp, status } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (status === "pending") {
    return <div>Loading...</div>
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await loginWithOtp(phone, code)
      navigate("/dashboard")
    } catch {
      setError("invalid_otp")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Portal Login</h2>
      {error && <div role="alert">{error}</div>}
      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        placeholder="OTP"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button type="submit">Verify</button>
    </form>
  )
}
