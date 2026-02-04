import { clsx } from "clsx";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }
>) => {
  return (
    <button
      className={clsx(
        "ui-button",
        {
          "ui-button--secondary": variant === "secondary",
          "ui-button--ghost": variant === "ghost"
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
