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

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorId: createErrorId() };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const errorRequestId = (error as { requestId?: string }).requestId;
    const requestId = errorRequestId ?? getRequestId();
    console.error("UI render failure", {
      requestId,
      error,
      errorRequestId,
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
      const requestId = (this.state.error as { requestId?: string } | undefined)?.requestId ?? getRequestId();
      return (
        <div className="error-panel" role="alert">
          <div>
            <h1>Unexpected error</h1>
            <p>We hit an unexpected error while rendering this page. Please try again or contact support.</p>
          </div>
          <div className="error-panel__meta">
            <span>
              <strong>Error ID:</strong> {this.state.errorId}
            </span>
            <span>
              <strong>Request ID:</strong> {requestId}
            </span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
