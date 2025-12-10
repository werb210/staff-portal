import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppRouter from "@/router";
import { AuthProvider } from "@/context/AuthContext";
import { SiloProvider } from "@/context/SiloContext";
import AppErrorBoundary from "@/components/layout/AppErrorBoundary";
import AppLoading from "@/components/layout/AppLoading";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />
    <AuthProvider>
      <SiloProvider>
        <AppErrorBoundary>
          <Suspense fallback={<AppLoading />}>
            <AppRouter />
          </Suspense>
        </AppErrorBoundary>
      </SiloProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
