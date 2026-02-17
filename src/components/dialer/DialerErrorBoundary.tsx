import React from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { getRequestId } from "@/utils/requestId";
import { useDialerStore } from "@/state/dialer.store";

const DialerFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const safeError = error instanceof Error ? error : new Error(String(error));
  const closeDialer = useDialerStore((state) => state.closeDialer);
  const resetCall = useDialerStore((state) => state.resetCall);

  return (
    <div className="dialer" role="status" aria-live="polite">
      <div className="dialer__panel">
        <div className="dialer__header">
          <div>
            <p className="dialer__eyebrow">Outbound call</p>
            <h2 className="dialer__title">Dialer unavailable</h2>
          </div>
        </div>
        <div className="dialer__body">
          <p className="text-sm text-slate-600">
            We hit an error while rendering the dialer. You can safely continue working in the portal.
          </p>
          <p className="text-xs text-slate-500">Error: {safeError.message}</p>
        </div>
        <div className="dialer__footer">
          <button
            type="button"
            className="dialer__outcome"
            onClick={() => {
              resetCall();
              closeDialer();
              resetErrorBoundary();
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

const DialerErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      FallbackComponent={DialerFallback}
      onError={(error, info) => {
        console.error("Dialer render failure", {
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

export default DialerErrorBoundary;
