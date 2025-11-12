interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner = ({ size = 'md' }: SpinnerProps) => (
  <span className={`spinner spinner-${size}`} role="status" aria-live="polite" aria-busy="true">
    Loading...
  </span>
);
