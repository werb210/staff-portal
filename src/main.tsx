import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { SiloProvider } from "./context/SiloContext";
import { AuthProvider } from "./auth/AuthContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SiloProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SiloProvider>
  </React.StrictMode>
);
