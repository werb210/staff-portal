import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';

function readStorage<T>(storageKey: string): T | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn('Failed to read from localStorage', error);
    return undefined;
  }
}

function writeStorage<T>(storageKey: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to write to localStorage', error);
  }
}

export function useCachedQuery<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  storageKey: string,
  options: Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'> = {}
) {
  const cached = readStorage<TData>(storageKey);

  return useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      try {
        const data = await queryFn();
        writeStorage(storageKey, data);
        return data;
      } catch (error) {
        if (cached !== undefined) {
          return cached;
        }
        throw error;
      }
    },
    initialData: cached,
    staleTime: options.staleTime ?? 60_000,
    gcTime: options.gcTime ?? 5 * 60_000,
    ...options
  });
}
