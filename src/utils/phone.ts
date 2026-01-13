export function normalizeToE164(input: string, defaultCountry = "US"): string {
  const digits = input.replace(/\D/g, "");

  if (defaultCountry === "US") {
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  }

  if (input.startsWith("+") && digits.length >= 10) return `+${digits}`;

  throw new Error("Invalid phone number");
}
