import { QueryClient } from "@tanstack/react-query";
import { useGlobalLoading } from "../state/loadingStore";

const loader = useGlobalLoading.getState();

export const queryClient = new QueryClient({
  defaultOptions: {
    // Casted to satisfy current react-query types while allowing lifecycle callbacks
    // for showing/hiding the global loader.
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onSettled: () => loader.hide(),
      onSuccess: () => loader.hide(),
      onError: () => loader.hide(),
    } as any,
    mutations: {
      onMutate: () => loader.show(),
      onSettled: () => loader.hide(),
    },
  },
});
