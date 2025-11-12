import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import clsx from 'clsx';

const variants = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  ghost: 'btn btn--ghost',
  danger: 'btn btn--danger'
} as const;

type ButtonVariant = keyof typeof variants;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ children, className, variant = 'primary', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button className={clsx(variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export default Button;
