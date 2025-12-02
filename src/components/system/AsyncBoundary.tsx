import { ReactNode } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { useGlobalLoading } from "../../state/loadingStore";

export default function AsyncBoundary({
  children,
}: {
  children: ReactNode;
}) {
  const { reset } = useQueryErrorResetBoundary();
  const { hide } = useGlobalLoading();

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="p-10">
          <h1 className="text-xl font-bold mb-3">Failed to load</h1>
          <pre className="text-red-600 mb-4">{String(error)}</pre>
          <button
            className="p-2 bg-blue-600 text-white rounded"
            onClick={() => {
              hide();
              resetErrorBoundary();
            }}
          >
            Retry
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
