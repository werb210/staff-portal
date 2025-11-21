import React from "react";
import ErrorState from "@/components/states/ErrorState";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class GlobalErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Runtime error", error, info);
  }

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 p-6">
          <ErrorState title="Unexpected error" message="Something went wrong in the app.">
            <div className="mt-4">
              <Button onClick={this.handleReset}>Reload</Button>
            </div>
          </ErrorState>
        </div>
      );
    }

    return this.props.children;
  }
}
