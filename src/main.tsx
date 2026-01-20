import React, { type PropsWithChildren } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { SiloProvider } from "./context/SiloContext";
import { AuthProvider } from "./auth/AuthContext";

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<PropsWithChildren<{}>, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App render error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-slate-600">Please refresh the page or try again later.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SiloProvider>
      <AuthProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AuthProvider>
    </SiloProvider>
  </React.StrictMode>
);
