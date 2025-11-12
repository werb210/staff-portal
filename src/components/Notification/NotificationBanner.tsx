interface NotificationBannerProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function NotificationBanner({ tone = 'info', message, actionLabel, onAction }: NotificationBannerProps) {
  return (
    <div className={`notification notification--${tone}`} role="status">
      <span>{message}</span>
      {actionLabel && (
        <button className="notification__action" onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
