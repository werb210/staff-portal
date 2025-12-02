import { useGlobalError } from "../hooks/useGlobalError";
import { useGlobalLoading } from "../hooks/useGlobalLoading";

export function withError<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const setError = useGlobalError.getState().setError;
  const setLoading = useGlobalLoading.getState().setLoading;

  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    try {
      setLoading(true);
      return await fn(...args);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      return null;
    } finally {
      setLoading(false);
    }
  };
}
