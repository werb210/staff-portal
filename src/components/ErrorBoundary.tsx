import { Component, type ErrorInfo, type ReactNode } from "react";
import { getRequestId } from "@/utils/requestId";
import { logger } from "@/utils/logger";

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("UI render failure", {
      requestId: getRequestId(),
      error,
      componentStack: info.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-panel" role="alert">
          <p>Unexpected error. Please refresh.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
