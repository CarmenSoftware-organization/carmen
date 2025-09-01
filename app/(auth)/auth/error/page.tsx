/**
 * Authentication Error Page
 * 
 * Displays user-friendly error messages for various authentication failures
 * and provides appropriate recovery options.
 * 
 * @author Carmen ERP Team
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  RefreshCw, 
  ArrowLeft, 
  Building2, 
  Shield, 
  Clock,
  XCircle
} from 'lucide-react'

interface ErrorInfo {
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  actions: Array<{
    label: string
    action: () => void
    variant?: 'default' | 'outline' | 'destructive'
  }>
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)

  const errorType = searchParams?.get('error')

  useEffect(() => {
    const getErrorInfo = (): ErrorInfo => {
      switch (errorType) {
        case 'Configuration':
          return {
            title: 'Configuration Error',
            description: 'The authentication service is not properly configured. This is likely a server-side issue that requires administrator attention.',
            icon: Shield,
            color: 'text-red-600',
            actions: [
              {
                label: 'Contact Administrator',
                action: () => {
                  // Could open a support ticket or email
                  window.location.href = 'mailto:admin@carmen-erp.com?subject=Authentication Configuration Error'
                }
              },
              {
                label: 'Go Back',
                action: () => router.back(),
                variant: 'outline' as const
              }
            ]
          }

        case 'AccessDenied':
          return {
            title: 'Access Denied',
            description: 'You do not have permission to access this application. Please contact your administrator if you believe this is an error.',
            icon: XCircle,
            color: 'text-red-600',
            actions: [
              {
                label: 'Request Access',
                action: () => {
                  window.location.href = 'mailto:admin@carmen-erp.com?subject=Access Request for Carmen ERP'
                }
              },
              {
                label: 'Try Again',
                action: () => router.push('/auth/signin'),
                variant: 'outline' as const
              }
            ]
          }

        case 'Verification':
          return {
            title: 'Verification Failed',
            description: 'Unable to verify your authentication. This could be due to network issues or an expired session.',
            icon: AlertTriangle,
            color: 'text-yellow-600',
            actions: [
              {
                label: 'Try Again',
                action: () => router.push('/auth/signin')
              },
              {
                label: 'Clear Session',
                action: () => {
                  // Clear any stored session data
                  localStorage.clear()
                  sessionStorage.clear()
                  router.push('/auth/signin')
                },
                variant: 'outline' as const
              }
            ]
          }

        case 'Callback':
          return {
            title: 'Callback Error',
            description: 'An error occurred while processing the authentication response from your identity provider.',
            icon: RefreshCw,
            color: 'text-yellow-600',
            actions: [
              {
                label: 'Retry Authentication',
                action: () => router.push('/auth/signin')
              },
              {
                label: 'Report Issue',
                action: () => {
                  window.location.href = 'mailto:admin@carmen-erp.com?subject=Authentication Callback Error'
                },
                variant: 'outline' as const
              }
            ]
          }

        case 'RefreshTokenError':
          return {
            title: 'Session Expired',
            description: 'Your session has expired and could not be automatically renewed. Please sign in again.',
            icon: Clock,
            color: 'text-blue-600',
            actions: [
              {
                label: 'Sign In Again',
                action: () => router.push('/auth/signin')
              }
            ]
          }

        case 'SessionRequired':
          return {
            title: 'Authentication Required',
            description: 'You must be signed in to access this page. Please authenticate to continue.',
            icon: Shield,
            color: 'text-blue-600',
            actions: [
              {
                label: 'Sign In',
                action: () => router.push('/auth/signin')
              }
            ]
          }

        case 'Default':
        default:
          return {
            title: 'Authentication Error',
            description: 'An unexpected error occurred during authentication. Please try again or contact support if the problem persists.',
            icon: AlertTriangle,
            color: 'text-red-600',
            actions: [
              {
                label: 'Try Again',
                action: () => router.push('/auth/signin')
              },
              {
                label: 'Contact Support',
                action: () => {
                  window.location.href = 'mailto:support@carmen-erp.com?subject=Authentication Error'
                },
                variant: 'outline' as const
              }
            ]
          }
      }
    }

    setErrorInfo(getErrorInfo())
  }, [errorType, router])

  if (!errorInfo) {
    return null
  }

  const Icon = errorInfo.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Carmen ERP</h1>
          <p className="text-gray-600 mt-2">Authentication Error</p>
        </div>

        {/* Error Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-8">
            <div className="flex items-center justify-center mb-4">
              <Icon className={`h-12 w-12 ${errorInfo.color}`} />
            </div>
            <CardTitle className="text-2xl text-center">{errorInfo.title}</CardTitle>
            <CardDescription className="text-center">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                If this error persists, please contact your system administrator with the error code: {errorType || 'UNKNOWN'}
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="space-y-3">
              {errorInfo.actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  variant={action.variant || 'default'}
                  className="w-full"
                  size="lg"
                >
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Technical Details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer font-medium">Technical Details</summary>
                <div className="mt-2 p-3 bg-gray-50 rounded font-mono">
                  <p>Error Type: {errorType || 'Unknown'}</p>
                  <p>User Agent: {navigator.userAgent}</p>
                  <p>Timestamp: {new Date().toISOString()}</p>
                  <p>URL: {window.location.href}</p>
                </div>
              </details>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>For immediate assistance, contact your system administrator</p>
          <p className="font-mono text-xs mt-1">Error: {errorType || 'UNKNOWN'}</p>
        </div>
      </div>
    </div>
  )
}