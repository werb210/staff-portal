import type React from "react";
import { ErrorBoundary } from "react-error-boundary";
import Button from "../ui/Button";

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="error-fallback">
    <h2>Unexpected error</h2>
    <p>{error.message}</p>
    <Button onClick={resetErrorBoundary}>Retry</Button>
  </div>
);

const AppErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default AppErrorBoundary;
