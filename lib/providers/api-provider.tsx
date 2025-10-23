'use client'

import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthManager } from '@/lib/api'
import { toast } from 'sonner'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cache time - how long data stays in cache
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 401 (unauthorized) or 403 (forbidden)
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const statusCode = (error as any).statusCode
          if (statusCode === 401 || statusCode === 403) {
            return false
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
})

// Global error handler for queries
queryClient.setMutationDefaults(['*'], {
  onError: (error) => {
    console.error('Mutation error:', error)
    
    // Handle authentication errors globally
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as any).statusCode
      if (statusCode === 401) {
        AuthManager.clearTokens()
        toast.error('Session expired. Please log in again.')
        // Redirect to login page
        window.location.href = '/auth/login'
        return
      }
      
      if (statusCode === 403) {
        toast.error('Access denied. You do not have permission to perform this action.')
        return
      }
    }
  },
})

// Note: Query error handlers should be set up at query level
// Global error handling is managed through QueryCache configuration

interface ApiProviderProps {
  children: React.ReactNode
  // Allow passing initial authentication data
  initialAuth?: {
    accessToken: string
    refreshToken?: string
    expiresIn?: number
  }
}

export function ApiProvider({ children, initialAuth }: ApiProviderProps) {
  // Set up authentication on provider mount
  useEffect(() => {
    if (initialAuth) {
      AuthManager.setTokens(
        initialAuth.accessToken,
        initialAuth.refreshToken,
        initialAuth.expiresIn
      )
    }
  }, [initialAuth])

  // Set up token refresh logic
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'auth') {
        // Token changed in another tab, update our auth state
        if (e.newValue) {
          try {
            const authData = JSON.parse(e.newValue)
            if (authData.accessToken) {
              AuthManager.setTokens(
                authData.accessToken,
                authData.refreshToken,
                authData.expiresIn
              )
            }
          } catch (error) {
            console.error('Failed to parse auth data from storage:', error)
          }
        } else {
          // Token was removed
          AuthManager.clearTokens()
          queryClient.clear()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Custom hook to access query client
export function useQueryClient() {
  const client = queryClient
  
  return {
    client,
    // Helper methods
    invalidateAll: () => client.invalidateQueries(),
    clearAll: () => client.clear(),
    prefetch: client.prefetchQuery.bind(client),
    setQueryData: client.setQueryData.bind(client),
    getQueryData: client.getQueryData.bind(client),
    
    // Authentication helpers
    clearAuthQueries: () => {
      client.removeQueries({ queryKey: ['auth'] })
      client.removeQueries({ queryKey: ['user'] })
    },
    
    // Utility to check if any queries are loading
    isLoading: () => {
      return client.isMutating() > 0 || client.isFetching() > 0
    }
  }
}

// Hook to get query client stats
export function useQueryStats() {
  const client = queryClient
  
  return {
    queriesCount: client.getQueryCache().getAll().length,
    mutationsCount: client.getMutationCache().getAll().length,
    isFetching: client.isFetching(),
    isMutating: client.isMutating(),
  }
}

export { queryClient }