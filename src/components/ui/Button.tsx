import { clsx } from "clsx";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }>) => {
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
