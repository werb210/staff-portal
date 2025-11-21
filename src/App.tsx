import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { AppRouter } from "./router/AppRouter";

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}
