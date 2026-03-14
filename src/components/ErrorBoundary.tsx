import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Portal runtime error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40 }}>
          <h2>Portal Error</h2>
          <p>The portal encountered an unexpected error.</p>
          <p>Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
