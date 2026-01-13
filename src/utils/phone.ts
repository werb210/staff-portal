export function normalizeToE164(
  rawInput: string,
  defaultCountryCode = "1" // Canada + US
): string {
  if (!rawInput) {
    throw new Error("Phone number is required");
  }

  // Remove all non-digits except leading +
  let cleaned = rawInput.trim();

  // If starts with +, keep it and strip other junk
  if (cleaned.startsWith("+")) {
    cleaned = "+" + cleaned.slice(1).replace(/\D/g, "");
  } else {
    // Strip everything non-digit
    cleaned = cleaned.replace(/\D/g, "");
  }

  // Handle common cases
  if (cleaned.length === 10) {
    // Local number, assume default country
    return `+${defaultCountryCode}${cleaned}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith(defaultCountryCode)) {
    // Country code included but missing +
    return `+${cleaned}`;
  }

  if (cleaned.length > 11 && cleaned.startsWith(defaultCountryCode)) {
    return `+${cleaned}`;
  }

  if (cleaned.startsWith("+") && cleaned.length >= 11) {
    return cleaned;
  }

  throw new Error("Invalid phone number format");
}
