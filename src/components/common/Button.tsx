import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  variant?: Variant;
}

const buildClassName = (variant: Variant, fullWidth?: boolean, className?: string) =>
  ['btn', `btn-${variant}`, fullWidth ? 'btn-block' : null, className]
    .filter(Boolean)
    .join(' ');

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, fullWidth, variant = 'primary', ...rest }, ref) => {
    return (
      <button ref={ref} className={buildClassName(variant, fullWidth, className)} {...rest}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
