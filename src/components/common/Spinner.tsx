// ======================================================================
// src/components/common/Spinner.tsx
// Unified BF Spinner Component
// - Accessible
// - Size variants
// - Pure visual loader (no visible text)
// ======================================================================

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

export const Spinner = ({ size = "md" }: SpinnerProps) => {
  return (
    <span
      className={`spinner spinner-${size}`}
      role="status"
      aria-live="assertive"
      aria-busy="true"
    >
      <span className="sr-only">Loading…</span>
    </span>
  );
};
