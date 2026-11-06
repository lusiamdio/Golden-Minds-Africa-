import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient configured for high performance, aggressive caching,
 * and seamless offline fallback to achieve instant load on return visits.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: 1000 * 60 * 60, // 1 hour memory persistence
      retry: 1,
      refetchOnWindowFocus: false, // Prevents sudden network spikes on tab switch
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});
