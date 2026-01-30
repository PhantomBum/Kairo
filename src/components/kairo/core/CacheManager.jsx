import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

// Advanced cache management and prefetching
export function useCacheOptimization() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Configure global cache settings
    queryClient.setDefaultOptions({
      queries: {
        staleTime: 5000, // Data fresh for 5 seconds
        cacheTime: 30 * 60 * 1000, // Cache for 30 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
      }
    });

    // Prefetch common data on mount
    const prefetchCommonData = async () => {
      try {
        // Prefetch user profile
        queryClient.prefetchQuery({
          queryKey: ['userProfile'],
          staleTime: 30000
        });

        // Prefetch notifications
        queryClient.prefetchQuery({
          queryKey: ['notifications'],
          staleTime: 30000
        });
      } catch (error) {
        console.error('Prefetch failed:', error);
      }
    };

    prefetchCommonData();

    // Periodic cache cleanup
    const cleanupInterval = setInterval(() => {
      queryClient.clear(); // Clear stale cache
    }, 10 * 60 * 1000); // Every 10 minutes

    return () => clearInterval(cleanupInterval);
  }, [queryClient]);

  return queryClient;
}

// Smart prefetching based on user navigation
export function usePrefetchStrategies(activeServer, activeChannel) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (activeServer) {
      // Prefetch server data
      queryClient.prefetchQuery({
        queryKey: ['channels', activeServer.id],
        staleTime: 10000
      });

      queryClient.prefetchQuery({
        queryKey: ['members', activeServer.id],
        staleTime: 30000
      });

      queryClient.prefetchQuery({
        queryKey: ['roles', activeServer.id],
        staleTime: 60000
      });
    }

    if (activeChannel) {
      // Prefetch messages
      queryClient.prefetchQuery({
        queryKey: ['messages', activeChannel.id],
        staleTime: 5000
      });
    }
  }, [activeServer, activeChannel, queryClient]);
}