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
import { validateEnv } from "./config/env";
import { validateEnv as validateRuntimeEnv } from "./lib/envCheck";
import { enforceRequestIdOnConsoleError } from "./utils/consoleGuard";
import { logger } from "./utils/logger";
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

if (import.meta.env.PROD) {
  validateEnv();
}

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        logger.info("Service worker registered", { scope: registration.scope });
        if (registration.waiting) {
          window.dispatchEvent(new CustomEvent("sw:update", { detail: { registration } }));
        }
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                logger.info("Service worker update ready");
                window.dispatchEvent(new CustomEvent("sw:update", { detail: { registration } }));
              } else {
                logger.info("Service worker installed");
              }
            }
          });
        });
      })
      .catch((error) => {
        logger.error("Service worker registration failed", { error });
      });
  });
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
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
