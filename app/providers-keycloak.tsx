/**
 * Keycloak-enabled Providers for Carmen ERP
 * 
 * This file provides the provider setup for Keycloak authentication integration.
 * It can be used to replace the existing providers.tsx file when migrating to Keycloak.
 * 
 * @author Carmen ERP Team
 */

'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { UserProvider } from '@/lib/context/user-context'
import { ThemeProvider } from 'next-themes'

// Create a client for React Query
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
          // Don't retry on authentication errors
          if ((error as any)?.status === 401 || (error as any)?.status === 403) {
            return false
          }
          return failureCount < 3
        },
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider
        // Refetch session every 5 minutes when tab is focused
        refetchInterval={5 * 60}
        // Refetch session when window gains focus
        refetchOnWindowFocus={true}
      >
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </UserProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}

/**
 * Providers for pages that don't need authentication
 * (e.g., public pages, auth pages)
 */
export function PublicProviders({ children }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}

/**
 * Legacy providers for backward compatibility
 * Use this during migration period to maintain compatibility
 */
export function HybridProviders({ children }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider
        refetchInterval={5 * 60}
        refetchOnWindowFocus={true}
      >
        {/* Use UserProvider but maintain backward compatibility */}
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </UserProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}