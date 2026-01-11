import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

const DEFAULT_COUNTRY: CountryCode = "US";

const stripToDigits = (value: string) => {
  const cleaned = value.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    return `+${cleaned.slice(1).replace(/\D/g, "")}`;
  }
  return cleaned.replace(/\D/g, "");
};

const parsePendingPhone = (pendingPhoneNumber: string | null) => {
  if (!pendingPhoneNumber) return null;
  const parsed = parsePhoneNumberFromString(pendingPhoneNumber);
  if (!parsed) return null;
  return {
    country: (parsed.country ?? DEFAULT_COUNTRY) as CountryCode,
    nationalNumber: parsed.nationalNumber ?? stripToDigits(pendingPhoneNumber),
    e164: parsed.format("E.164")
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { startOtp, verifyOtp, pendingPhoneNumber } = useAuth();
  const parsedPending = parsePendingPhone(pendingPhoneNumber ?? null);
  const [country, setCountry] = useState<CountryCode>(parsedPending?.country ?? DEFAULT_COUNTRY);
  const [nationalNumber, setNationalNumber] = useState(parsedPending?.nationalNumber ?? "");
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState(parsedPending?.e164 ?? "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">(pendingPhoneNumber ? "otp" : "phone");
  const [error, setError] = useState<string | null>(null);

  const countries = useMemo(() => getCountries().sort(), []);

  const e164PhoneNumber = useMemo(() => {
    const digits = stripToDigits(nationalNumber);
    if (!digits) return "";
    const parsed = digits.startsWith("+")
      ? parsePhoneNumberFromString(digits)
      : parsePhoneNumberFromString(digits, country);
    if (!parsed || !parsed.isValid()) return "";
    return parsed.format("E.164");
  }, [country, nationalNumber]);

  const canSubmitPhone = useMemo(() => e164PhoneNumber.length > 0, [e164PhoneNumber]);
  const canSubmitCode = useMemo(() => code.trim().length === 6, [code]);

  const handleStart = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!e164PhoneNumber) {
      setError("Invalid phone format. Please enter a valid phone number.");
      return;
    }

    try {
      await startOtp(e164PhoneNumber);
      setSubmittedPhoneNumber(e164PhoneNumber);
      setStep("otp");
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        setError("OTP send failure. Please try again.");
        return;
      }
      if (status && status >= 500) {
        setError("OTP send failure. Please try again.");
        return;
      }
      if (err instanceof Error && err.message === "Invalid phone format.") {
        setError("Invalid phone format. Please enter a valid phone number.");
        return;
      }
      setError(err instanceof ApiError ? err.message : "OTP send failure. Please try again.");
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await verifyOtp(code, submittedPhoneNumber || e164PhoneNumber);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const errorCode = (err as { code?: string })?.code;
      if (status === 401 || errorCode === "invalid_otp") {
        setError("Invalid code.");
        return;
      }
      if (status && status >= 500) {
        setError("Invalid code.");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Invalid code.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Staff Login</h1>

      {error && (
        <div role="alert" className="text-sm text-red-700">
          {error}
        </div>
      )}

      {step === "phone" ? (
        <form className="space-y-4" onSubmit={handleStart}>
          <div className="flex flex-col space-y-1">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              name="country"
              value={country}
              onChange={(event) => {
                setCountry(event.target.value as CountryCode);
                setError(null);
              }}
              className="border rounded px-3 py-2"
            >
              {countries.map((countryCode) => (
                <option key={countryCode} value={countryCode}>
                  {countryCode} +{getCountryCallingCode(countryCode)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="phoneNumber">Phone number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputMode="numeric"
              value={nationalNumber}
              onChange={(event) => {
                setNationalNumber(stripToDigits(event.target.value));
                setError(null);
              }}
              className="border rounded px-3 py-2"
              placeholder="Enter phone number"
              required
            />
            <p className="text-xs text-slate-500">E.164: {e164PhoneNumber || "—"}</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
            disabled={!canSubmitPhone}
          >
            Send code
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleVerify}>
          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Sending code to <span className="font-semibold">{submittedPhoneNumber}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="otp">Verification code</label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, ""));
                setError(null);
              }}
              className="border rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
            disabled={!canSubmitCode}
          >
            Verify code
          </button>
        </form>
      )}
    </div>
  );
}
