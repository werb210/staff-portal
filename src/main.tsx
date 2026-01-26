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

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.info("Service worker registered", { scope: registration.scope });
        if (registration.waiting) {
          window.dispatchEvent(new CustomEvent("sw:update", { detail: { registration } }));
        }
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.info("Service worker update ready");
                window.dispatchEvent(new CustomEvent("sw:update", { detail: { registration } }));
              } else {
                console.info("Service worker installed");
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error("Service worker registration failed", error);
      });
  });
}

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
