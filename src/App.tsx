import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider as LegacyAuthProvider } from "./providers/AuthProvider";
import { AuthProvider as SessionAuthProvider } from "./context/AuthContext";
import { AppRouter } from "./router/AppRouter";

export default function App() {
  return (
    <QueryProvider>
      <LegacyAuthProvider>
        <BrowserRouter>
          <SessionAuthProvider>
            <AppRouter />
          </SessionAuthProvider>
        </BrowserRouter>
      </LegacyAuthProvider>
    </QueryProvider>
  );
}
