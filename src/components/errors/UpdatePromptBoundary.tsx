import type React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { getRequestId } from "@/utils/requestId";

const UpdatePromptFallback = () => (
  <div className="update-banner" role="status" aria-live="polite">
    <span>Update temporarily unavailable. Please refresh later.</span>
  </div>
);

const UpdatePromptBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      FallbackComponent={UpdatePromptFallback}
      onError={(error, info) => {
        console.error("Update prompt failed to render.", {
          requestId: getRequestId(),
          error,
          componentStack: info.componentStack
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default UpdatePromptBoundary;
