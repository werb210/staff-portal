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

  const digits = useMemo(() => {
    const normalized = value.replace(/\D/g, "").slice(0, length);
    return Array.from({ length }, (_, index) => normalized[index] ?? "");
  }, [length, value]);

  const focusIndex = (index: number) => {
    const input = inputsRef.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  };

  useEffect(() => {
    if (disabled) return;
    focusIndex(0);
  }, [disabled]);

  useEffect(() => {
    const normalized = value.replace(/\D/g, "").slice(0, length);
    if (normalized.length === length && onComplete) {
      onComplete(normalized);
    }
  }, [length, onComplete, value]);

  const updateValueAt = (index: number, nextDigit: string) => {
    const normalized = value.replace(/\D/g, "").slice(0, length).split("");
    normalized[index] = nextDigit;
    const nextValue = normalized.join("").slice(0, length);
    onChange(nextValue);
  };

  const handleInputChange = (index: number, nextValue: string) => {
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
