import Button from "@/components/ui/Button";

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

const ErrorBanner = ({ message, onRetry }: ErrorBannerProps) => (
  <div
    role="alert"
    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"
  >
    <span>{message}</span>
    {onRetry && (
      <Button type="button" variant="ghost" onClick={onRetry}>
        Retry
      </Button>
    )}
  </div>
);

export default ErrorBanner;
