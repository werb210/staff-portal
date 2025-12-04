import { RouterProvider } from "react-router-dom";
import { appRouter } from "@/router/appRouter";
import { useAuthInit } from "@/hooks/useAuthInit";

export default function App() {
  useAuthInit();
  return <RouterProvider router={appRouter} />;
}
