import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 30,
      retry: (failureCount, error) => {
        if (!navigator.onLine) return false
        return failureCount < 2
      },
    },
  },
})
