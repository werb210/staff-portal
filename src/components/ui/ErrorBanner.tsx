type ErrorBannerProps = {
  message: string;
};

const ErrorBanner = ({ message }: ErrorBannerProps) => (
  <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
    {message}
  </div>
);

export default ErrorBanner;
