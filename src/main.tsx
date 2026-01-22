import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { SiloProvider } from "./context/SiloContext";
import { AuthProvider } from "./auth/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { enforceRequestIdOnConsoleError } from "./utils/consoleGuard";
import { startUiHeartbeat } from "./utils/uiHeartbeat";

const rootElement = document.getElementById("root") as HTMLElement;
enforceRequestIdOnConsoleError();
startUiHeartbeat(rootElement);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <SiloProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </SiloProvider>
    </AuthProvider>
  </React.StrictMode>
);
