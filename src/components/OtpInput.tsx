import { useEffect, useMemo, useRef, type ClipboardEvent, type KeyboardEvent } from "react";

type OtpInputProps = {
  value: string;
  length?: number;
  disabled?: boolean;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
};

const OtpInput = ({ value, length = 6, disabled = false, onChange, onComplete }: OtpInputProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const normalizedValue = useMemo(() => value.replace(/\D/g, "").slice(0, length), [length, value]);
  const digits = useMemo(
    () => Array.from({ length }, (_, index) => normalizedValue[index] ?? ""),
    [length, normalizedValue]
  );

  const focusIndex = (index: number) => {
    const input = inputsRef.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  };

  useEffect(() => {
    if (disabled) return;
    const nextIndex = Math.min(digits.findIndex((digit) => !digit), length - 1);
    focusIndex(nextIndex === -1 ? length - 1 : nextIndex);
  }, [digits, disabled, length]);

  useEffect(() => {
    if (disabled) return;
    if (normalizedValue.length === length && onComplete) {
      onComplete(normalizedValue);
    }
  }, [disabled, length, normalizedValue, onComplete]);

  const updateValueAt = (index: number, nextDigit: string) => {
    const normalized = value.replace(/\D/g, "").slice(0, length).split("");
    normalized[index] = nextDigit;
    const nextValue = normalized.join("").slice(0, length);
    onChange(nextValue);
  };

  const handleInputChange = (index: number, nextValue: string) => {
    if (disabled) return;
    if (!nextValue) {
      updateValueAt(index, "");
      return;
    }

    const nextDigits = nextValue.replace(/\D/g, "").split("");
    if (!nextDigits.length) return;

    const normalized = value.replace(/\D/g, "").split("");
    nextDigits.forEach((digit, offset) => {
      const targetIndex = index + offset;
      if (targetIndex < length) {
        normalized[targetIndex] = digit;
      }
    });
    const nextCombined = normalized.join("").slice(0, length);
    onChange(nextCombined);
    const nextFocusIndex = Math.min(index + nextDigits.length, length - 1);
    focusIndex(nextFocusIndex);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === "Backspace") {
      event.preventDefault();
      const normalized = value.replace(/\D/g, "").split("");
      if (normalized[index]) {
        normalized[index] = "";
        onChange(normalized.join("").slice(0, length));
        focusIndex(index);
        return;
      }
      if (index > 0) {
        normalized[index - 1] = "";
        onChange(normalized.join("").slice(0, length));
        focusIndex(index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (index > 0) focusIndex(index - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (index < length - 1) focusIndex(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    const pasted = event.clipboardData.getData("text");
    if (!pasted) return;
    const nextDigits = pasted.replace(/\D/g, "").slice(0, length);
    if (!nextDigits) return;
    onChange(nextDigits);
    focusIndex(Math.min(nextDigits.length, length - 1));
  };

  return (
    <div className="otp-inputs" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={`otp-${index}`}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          className="otp-input"
          value={digit}
          onChange={(event) => handleInputChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1}`}
          maxLength={1}
        />
      ))}
    </div>
  );
};

export default OtpInput;
