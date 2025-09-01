/**
 * Keycloak Sign-Out Page
 * 
 * Provides a clean sign-out confirmation and handles the sign-out process
 * with proper cleanup and user feedback.
 * 
 * @author Carmen ERP Team
 */

'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, LogOut, CheckCircle, Building2 } from 'lucide-react'

export default function SignOutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signedOut, setSignedOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      
      await signOut({
        redirect: false, // Handle redirect manually
      })
      
      setSignedOut(true)
      
      // Redirect after a short delay to show confirmation
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
      
    } catch (error) {
      console.error('Sign-out error:', error)
      setIsSigningOut(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  // Auto-redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, router])

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Carmen ERP</h1>
          <p className="text-gray-600 mt-2">Hospitality Management System</p>
        </div>

        {/* Sign-out Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-2xl text-center">
              {signedOut ? 'Signed Out Successfully' : 'Sign Out'}
            </CardTitle>
            <CardDescription className="text-center">
              {signedOut 
                ? 'You have been successfully signed out of Carmen ERP'
                : 'Are you sure you want to sign out of your Carmen ERP session?'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {signedOut ? (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have been signed out successfully. Redirecting to sign-in page...
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <>
                {/* User Info */}
                {session.user && (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        {session.user.name?.[0] || session.user.email?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.user.name || 'User'}
                        </p>
                        <p className="text-gray-600">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-900 mb-1">Security Notice:</p>
                  <p>Signing out will end your current session and log you out of all connected services.</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSigningOut}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isSigningOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing Out...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact your system administrator.</p>
        </div>
      </div>
    </div>
  )
}