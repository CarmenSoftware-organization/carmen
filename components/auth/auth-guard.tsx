'use client'

/**
 * Authentication Guard Component
 * 
 * Protects routes by checking Keycloak authentication status and redirecting
 * unauthenticated users to the sign-in page.
 * 
 * @author Carmen ERP Team
 */

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useKeycloakUser } from '@/lib/context/keycloak-user-context'
import { Loader2, Shield, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
  requireRoles?: string[]
  requirePermissions?: string[]
}

export function AuthGuard({ 
  children, 
  fallback,
  redirectTo = '/auth/signin',
  requireRoles = [],
  requirePermissions = []
}: AuthGuardProps) {
  const { data: session, status } = useSession()
  const { user, signIn } = useKeycloakUser()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(redirectTo)
    }
  }, [status, router, redirectTo])

  // Show loading state
  if (status === 'loading') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
            <p className="text-gray-600">Checking authentication status</p>
          </div>
        </div>
      </div>
    )
  }

  // Handle authentication errors
  if (session?.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Error</h3>
            <p className="text-gray-600">There was a problem with your session</p>
          </div>
          
          <Alert variant="destructive">
            <AlertDescription>
              {session.error === 'RefreshTokenError' 
                ? 'Your session has expired. Please sign in again.'
                : 'Authentication failed. Please try signing in again.'
              }
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => signIn()}
            className="w-full"
          >
            <Shield className="mr-2 h-4 w-4" />
            Sign In Again
          </Button>
        </div>
      </div>
    )
  }

  // User not authenticated
  if (!session) {
    return fallback || null
  }

  // If we have a session but user is still loading, allow access (user context will load in background)
  if (session && !user) {
    // For development, proceed with session-only authentication
    console.log('Proceeding with session-only auth while user context loads')
    // We'll allow the app to render and let user context load in background
  }

  // Check role requirements
  if (requireRoles.length > 0) {
    const hasRequiredRole = requireRoles.some(role => 
      user.keycloakRoles?.includes(role) || user.role === role
    )
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
              <p className="text-gray-600">
                You don't have the required permissions to access this page.
              </p>
            </div>
            <Alert>
              <AlertDescription>
                Required roles: {requireRoles.join(', ')}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )
    }
  }

  // Check permission requirements
  if (requirePermissions.length > 0) {
    const hasRequiredPermissions = requirePermissions.every(permission => 
      user.permissions?.includes(permission) || user.permissions?.includes('*')
    )
    
    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Insufficient Permissions</h3>
              <p className="text-gray-600">
                You don't have the required permissions to access this feature.
              </p>
            </div>
            <Alert>
              <AlertDescription>
                Required permissions: {requirePermissions.join(', ')}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )
    }
  }

  // User is authenticated and authorized
  return <>{children}</>
}

// Higher-order component for protecting pages
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}