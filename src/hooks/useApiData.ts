import { useEffect, useRef, useState } from 'react';

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

const API_BASE_URL = 'http://localhost:5000';

export function useApiData<T = unknown>(endpoint: string, initialData: T | null = null) {
  const [state, setState] = useState<FetchState<T>>({
    data: initialData,
    loading: true,
    error: null,
  });
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const json = (await response.json()) as T;
        if (!isCancelled) {
          setState({ data: json, loading: false, error: null });
        }
      } catch (err) {
        if (!isCancelled) {
          setState({ data: initialDataRef.current, loading: false, error: (err as Error).message });
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [endpoint]);

  return state;
}
