import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
export { trackPortalEvent } from "./lib/portalTracking";
import App from "./App";
import "./styles/globals.css";
import "./index.css";
import "./theme";
import { SiloProvider } from "./context/SiloContext";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./context/ToastContext";
import { validateEnv as validateRuntimeEnv } from "./lib/envCheck";
import { enforceRequestIdOnConsoleError } from "./utils/consoleGuard";
import { startUiHeartbeat } from "./utils/uiHeartbeat";
import { clearAuth, getAccessToken, isTokenExpired } from "./lib/authStorage";

const rootElement = document.getElementById("root") as HTMLElement;
enforceRequestIdOnConsoleError();
startUiHeartbeat(rootElement);
validateRuntimeEnv();

const token = getAccessToken();
if (token && isTokenExpired(token)) {
  clearAuth();
  window.location.href = "/login";
}

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SiloProvider>
          <ErrorBoundary>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ErrorBoundary>
        </SiloProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
