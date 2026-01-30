import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

// Advanced cache management - MINIMAL overhead
export function useCacheOptimization() {
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Configure global cache settings - aggressive caching
    queryClient.setDefaultOptions({
      queries: {
        staleTime: 60000, // Data fresh for 60 seconds
        cacheTime: 60 * 60 * 1000, // Cache for 1 hour
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: 1,
        retryDelay: 1000
      }
    });
  }, [queryClient]);

  return queryClient;
}

// Smart prefetching - disabled to reduce API calls
export function usePrefetchStrategies(activeServer, activeChannel) {
  // Disabled - let queries load on demand with caching
  return null;
}