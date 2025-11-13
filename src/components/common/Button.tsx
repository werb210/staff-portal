// ======================================================================
// src/components/common/Button.tsx
// Unified BF Staff App Button Component
// Fully supports:
// - primary / secondary / ghost variants
// - disabled + aria-disabled
// - fullWidth
// - safe-click-on-disabled prevention
// ======================================================================

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  variant?: Variant;
  loading?: boolean;
}

const variantClass = (variant: Variant) => {
  switch (variant) {
    case "primary":
      return "btn-primary";
    case "secondary":
      return "btn-secondary";
    case "ghost":
      return "btn-ghost";
    default:
      return "btn-primary";
  }
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      children,
      fullWidth = false,
      variant = "primary",
      loading = false,
      disabled,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const classes = [
      "btn",
      variantClass(variant),
      fullWidth ? "btn-full" : "",
      isDisabled ? "btn-disabled" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"] =
      (e) => {
        if (isDisabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        rest.onClick?.(e);
      };

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        onClick={handleClick}
        {...rest}
      >
        {loading ? <span className="spinner-sm" /> : children}
      </button>
    );
  }
);

Button.displayName = "Button";
