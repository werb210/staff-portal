import type { ButtonHTMLAttributes } from 'react';

type ButtonTone = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

type PortalButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  loading?: boolean;
  fullWidth?: boolean;
};

export function PortalButton({
  tone = 'secondary',
  loading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: PortalButtonProps) {
  const classes = ['btn', `btn--${tone}`];
  if (loading) classes.push('btn--loading');
  if (fullWidth) classes.push('btn--block');
  if (className) classes.push(className);

  return (
    <button
      className={classes.join(' ')}
      aria-busy={loading}
      disabled={loading || disabled}
      {...props}
    >
      <span className="btn__label">{children}</span>
    </button>
  );
}
