import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

const DEFAULT_COUNTRY: CountryCode = "US";

const parsePendingPhone = (pendingPhoneNumber: string | null) => {
  if (!pendingPhoneNumber) return null;
  const parsed = parsePhoneNumberFromString(pendingPhoneNumber);
  if (!parsed) return null;
  return {
    country: (parsed.country ?? DEFAULT_COUNTRY) as CountryCode,
    nationalNumber: parsed.nationalNumber ?? pendingPhoneNumber,
    e164: parsed.format("E.164")
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { startOtp, verifyOtp, pendingPhoneNumber } = useAuth();
  const parsedPending = parsePendingPhone(pendingPhoneNumber ?? null);
  const [country, setCountry] = useState<CountryCode>(parsedPending?.country ?? DEFAULT_COUNTRY);
  const [phoneInput, setPhoneInput] = useState(parsedPending?.nationalNumber ?? pendingPhoneNumber ?? "");
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState(parsedPending?.e164 ?? pendingPhoneNumber ?? "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">(pendingPhoneNumber ? "otp" : "phone");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const countries = useMemo(() => getCountries().sort(), []);

  const e164PhoneNumber = useMemo(() => {
    if (!phoneInput.trim()) return "";
    const parsed = phoneInput.trim().startsWith("+")
      ? parsePhoneNumberFromString(phoneInput.trim())
      : parsePhoneNumberFromString(phoneInput.trim(), country);
    if (!parsed || !parsed.isValid()) return "";
    return parsed.format("E.164");
  }, [country, phoneInput]);

  const canSubmitCode = useMemo(() => code.trim().length === 6, [code]);

  const handleStart = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const rawPhone = phoneInput;
    if (!rawPhone.trim()) {
      setError("Please enter a phone number.");
      return;
    }

    try {
      setIsSending(true);
      await startOtp(rawPhone);
      setSubmittedPhoneNumber(rawPhone);
      setStep("otp");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || "Unable to send code. Please try again.");
      } else if (err instanceof Error) {
        setError(err.message || "Unable to send code. Please try again.");
      } else {
        setError("Unable to send code. Please try again.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      setIsVerifying(true);
      await verifyOtp(code, submittedPhoneNumber || phoneInput);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || "Invalid code.");
      } else if (err instanceof Error) {
        setError(err.message || "Invalid code.");
      } else {
        setError("Invalid code.");
      }
    } finally {
      setIsVerifying(false);
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
              inputMode="tel"
              value={phoneInput}
              onChange={(event) => {
                setPhoneInput(event.target.value);
                setError(null);
              }}
              className="border rounded px-3 py-2"
              placeholder="Enter phone number"
            />
            <p className="text-xs text-slate-500">E.164: {e164PhoneNumber || "—"}</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send code"}
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
            disabled={!canSubmitCode || isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify code"}
          </button>
        </form>
      )}
    </div>
  );
}
