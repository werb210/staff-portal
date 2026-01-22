import { Component, type ErrorInfo, type ReactNode } from "react";
import { getRequestId } from "@/utils/requestId";
import { setUiFailure } from "@/utils/uiFailureStore";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  errorId?: string;
};

const createErrorId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `err_${Math.random().toString(36).slice(2, 10)}`;
};

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorId: createErrorId() };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const requestId = getRequestId();
    console.error("UI render failure", {
      requestId,
      error,
      componentStack: info.componentStack
    });
    setUiFailure({
      message: "A critical error occurred while rendering this page.",
      details: `Request ID: ${requestId}`,
      timestamp: Date.now()
    });
  }

  render() {
    if (this.state.hasError) {
      const requestId = getRequestId();
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-3">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-slate-600">
              The application ran into an error. Please try again or contact support.
            </p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>
                <strong>Error ID:</strong> {this.state.errorId}
              </p>
              <p>
                <strong>Request ID:</strong> {requestId}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
