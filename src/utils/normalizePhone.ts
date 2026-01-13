const E164_REGEX = /^\+[1-9]\d{9,14}$/;

export const normalizePhone = (rawInput: string): string => {
  if (!rawInput || !rawInput.trim()) {
    throw new Error("Phone number is required");
  }

  const trimmed = rawInput.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  let normalized = "";

  if (hasPlus) {
    normalized = `+${digits}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    normalized = `+${digits}`;
  } else if (digits.length === 10) {
    normalized = `+1${digits}`;
  } else {
    normalized = `+${digits}`;
  }

  if (!E164_REGEX.test(normalized)) {
    throw new Error("Invalid phone number format");
  }

  return normalized;
};

export default normalizePhone;
