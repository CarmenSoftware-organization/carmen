/**
 * Keycloak Sign-In Page
 * 
 * Provides a clean sign-in interface that integrates with Keycloak authentication
 * while maintaining Carmen ERP branding and user experience.
 * 
 * @author Carmen ERP Team
 */

'use client'

import { useEffect, useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, LogIn, Shield, Users, Building2, Code } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devEmail, setDevEmail] = useState('')
  const [devRole, setDevRole] = useState('admin')

  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
  const errorType = searchParams?.get('error')
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    // Check if user is already authenticated
    getSession().then((session) => {
      if (session && !session.error) {
        router.push(callbackUrl)
      }
    })
  }, [callbackUrl, router])

  useEffect(() => {
    // Handle authentication errors
    if (errorType) {
      switch (errorType) {
        case 'Configuration':
          setError('Authentication service is misconfigured. Please contact your system administrator.')
          break
        case 'AccessDenied':
          setError('Access denied. You may not have permission to access this application.')
          break
        case 'Verification':
          setError('Verification failed. Please try signing in again.')
          break
        case 'Default':
          setError('An authentication error occurred. Please try again.')
          break
        case 'RefreshTokenError':
          setError('Your session has expired. Please sign in again.')
          break
        default:
          setError('An unexpected error occurred. Please try again.')
      }
    }
  }, [errorType])

  const handleSSO = async () => {
    try {
      setIsLoading(true)
      setError(null)

      await signIn('keycloak', {
        callbackUrl,
        redirect: true,
      })
    } catch (error) {
      console.error('SSO sign-in error:', error)
      setError('Failed to initiate SSO sign-in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDevelopmentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!devEmail) {
      setError('Please enter an email address')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn('development', {
        email: devEmail,
        role: devRole,
        callbackUrl,
        redirect: true,
      })

      if (result?.error) {
        setError('Development login failed. Please try again.')
      }
    } catch (error) {
      console.error('Development login error:', error)
      setError('Development login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Carmen ERP</h1>
          <p className="text-gray-600 mt-2">Hospitality Management System</p>
        </div>

        {/* Sign-in Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your Carmen ERP account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="sso" className="w-full">
              <TabsList className={`grid w-full ${isDevelopment ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <TabsTrigger value="sso">SSO Login</TabsTrigger>
                {isDevelopment && (
                  <TabsTrigger value="dev">Development</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="sso" className="space-y-4">
                {/* Features Overview */}
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Secure authentication with Keycloak</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>Role-based access control</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <span>Multi-department support</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSSO}
                  disabled={isLoading}
                  className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in with SSO
                    </>
                  )}
                </Button>
              </TabsContent>

              {isDevelopment && (
                <TabsContent value="dev" className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                    <Code className="h-4 w-4" />
                    <span>Development mode - Local testing only</span>
                  </div>
                  
                  <form onSubmit={handleDevelopmentLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@carmen.local"
                        value={devEmail}
                        onChange={(e) => setDevEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        value={devRole}
                        onChange={(e) => setDevRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="department-manager">Department Manager</option>
                        <option value="financial-manager">Financial Manager</option>
                        <option value="purchasing-staff">Purchasing Staff</option>
                        <option value="chef">Chef</option>
                        <option value="counter">Counter Staff</option>
                      </select>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 text-base bg-orange-600 hover:bg-orange-700"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <Code className="mr-2 h-4 w-4" />
                          Development Login
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              )}
            </Tabs>

            <div className="text-xs text-gray-500 text-center">
              By signing in, you agree to your organization's terms of service and privacy policy.
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Having trouble signing in?</p>
          <p>Contact your system administrator for assistance.</p>
        </div>
      </div>
    </div>
  )
}