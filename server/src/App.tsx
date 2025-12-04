// server/src/App.tsx
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { appRouter } from "@/router/appRouter";
import { queryClient } from "@/core/queryClient";
import { useAuthInit } from "@/hooks/useAuthInit";

export default function App() {
  useAuthInit();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={appRouter} />
    </QueryClientProvider>
  );
}
