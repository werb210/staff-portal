import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import "./theme";
import { SiloProvider } from "./context/SiloContext";
import { AuthProvider } from "./auth/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./context/ToastContext";
import { validateEnv } from "./config/env";
import { enforceRequestIdOnConsoleError } from "./utils/consoleGuard";
import { logger } from "./utils/logger";
import { startUiHeartbeat } from "./utils/uiHeartbeat";

const rootElement = document.getElementById("root") as HTMLElement;
enforceRequestIdOnConsoleError();
startUiHeartbeat(rootElement);
validateEnv();

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
    <AuthProvider>
      <SiloProvider>
        <ErrorBoundary>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ErrorBoundary>
      </SiloProvider>
    </AuthProvider>
  </React.StrictMode>
);
