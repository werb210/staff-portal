import React from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import Button from "../ui/Button";

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const safeError = error instanceof Error ? error : new Error(String(error));

  return (
    <div className="error-fallback">
      <h2>Application Error</h2>
      <pre>{safeError.message}</pre>
      <Button onClick={resetErrorBoundary}>Reload</Button>
    </div>
  );
};

const AppErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>;
};

export default AppErrorBoundary;
