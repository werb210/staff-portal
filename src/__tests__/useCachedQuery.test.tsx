import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCachedQuery } from '../hooks/useCachedQuery';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useCachedQuery', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('reads cached value when fetcher fails', async () => {
    window.localStorage.setItem('test-key', JSON.stringify(['cached']));
    const { result } = renderHook(
      () =>
        useCachedQuery(
          ['test'],
          () => Promise.reject(new Error('offline')),
          'test-key'
        ),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(['cached']);
    });
  });
});
