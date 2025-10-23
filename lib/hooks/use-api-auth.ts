'use client'

import { useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { AuthManager } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Hook to integrate NextAuth session with API authentication
 * Automatically manages JWT tokens for API calls
 */
export function useApiAuth() {
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()

  // Update API auth tokens when session changes
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Set tokens in API client
      const accessToken = (session as any).accessToken as string | undefined
      const refreshToken = (session as any).refreshToken as string | undefined
      const expiresAt = (session as any).expiresAt as number | undefined

      if (accessToken) {
        AuthManager.setTokens(
          accessToken,
          refreshToken || '',
          expiresAt ? Math.floor((expiresAt - Date.now()) / 1000) : undefined
        )
      }
    } else if (status === 'unauthenticated') {
      // Clear tokens when unauthenticated
      AuthManager.clearTokens()
      // Clear all cached data
      queryClient.clear()
    }
  }, [session, status, queryClient])

  // Handle token refresh
  const refreshTokens = useCallback(async () => {
    try {
      // This would typically call your token refresh endpoint
      // For now, we'll rely on NextAuth's built-in refresh
      const refreshToken = session ? (session as any).refreshToken : undefined
      if (refreshToken) {
        // NextAuth will handle refresh automatically
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to refresh tokens:', error)
      AuthManager.clearTokens()
      queryClient.clear()
      toast.error('Session expired. Please log in again.')
      return false
    }
  }, [session, queryClient])

  // Check if user has specific permissions
  const hasPermission = useCallback((resource: string, action: string) => {
    // This would check against user permissions from session
    // For now, return true - implement based on your permission system
    return session?.user ? true : false
  }, [session])

  // Get current user info
  const currentUser = session?.user || null

  // Authentication state
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  // Logout helper
  const logout = useCallback(async () => {
    AuthManager.clearTokens()
    queryClient.clear()
    // NextAuth signOut would be called by the component
  }, [queryClient])

  return {
    // Auth state
    isAuthenticated,
    isLoading,
    currentUser,
    session,
    
    // Token management
    refreshTokens,
    
    // Permissions
    hasPermission,
    
    // Actions
    logout,
    
    // Utilities
    getAuthHeaders: () => {
      const token = AuthManager.getToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    
    isTokenValid: AuthManager.isTokenValid,
  }
}

/**
 * Hook to provide authentication state for API calls
 * Can be used in components that need to know auth status
 */
export function useAuthState() {
  const { data: session, status } = useSession()
  
  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    user: session?.user || null,
    token: AuthManager.getToken(),
    isTokenValid: AuthManager.isTokenValid(),
  }
}

/**
 * Higher-order hook that provides authentication-aware query options
 */
export function useAuthenticatedQuery() {
  const { isAuthenticated, isLoading } = useAuthState()
  
  return {
    // Default query options that respect auth state
    getQueryOptions: (enabled: boolean = true) => ({
      enabled: enabled && isAuthenticated && !isLoading,
      retry: (failureCount: number, error: any) => {
        // Don't retry on auth errors
        if (error?.statusCode === 401 || error?.statusCode === 403) {
          return false
        }
        return failureCount < 3
      },
    }),
    
    // Mutation options with auth error handling
    getMutationOptions: () => ({
      onError: (error: any) => {
        if (error?.statusCode === 401) {
          toast.error('Session expired. Please log in again.')
          AuthManager.clearTokens()
        } else if (error?.statusCode === 403) {
          toast.error('Access denied. You do not have permission to perform this action.')
        }
      },
    }),
    
    isAuthenticated,
    isLoading,
  }
}