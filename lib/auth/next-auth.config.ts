/**
 * NextAuth.js Configuration with Keycloak Integration
 * 
 * Provides comprehensive Keycloak OIDC authentication with role mapping,
 * session management, and integration with Carmen ERP's existing user system.
 * 
 * @author Carmen ERP Team
 */

import { NextAuthOptions, Session, User } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { AdapterUser } from 'next-auth/adapters'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getKeycloakConfig } from '@/lib/config/keycloak'
import { createSecurityAuditLog, SecurityEventType } from '@/lib/security/audit-logger'
import type { Role } from '@/lib/types/user'

// Enhanced JWT interface with Keycloak claims
interface KeycloakJWT extends JWT {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  refreshExpiresAt?: number
  keycloakId?: string
  roles?: string[]
  groups?: string[]
  realmAccess?: {
    roles: string[]
  }
  resourceAccess?: {
    [key: string]: {
      roles: string[]
    }
  }
  error?: string
}

// Enhanced Session interface
interface KeycloakSession extends Session {
  accessToken?: string
  roles?: string[]
  groups?: string[]
  keycloakId?: string
  error?: string
}

// Role mapping from Keycloak roles to Carmen ERP roles
const ROLE_MAPPING: Record<string, Role> = {
  'carmen-admin': 'admin',
  'carmen-super-admin': 'super-admin',
  'carmen-financial-manager': 'financial-manager',
  'carmen-department-manager': 'department-manager',
  'carmen-purchasing-staff': 'purchasing-staff',
  'carmen-chef': 'chef',
  'carmen-counter': 'counter',
  'carmen-staff': 'staff',
  // Fallback mappings
  'admin': 'admin',
  'manager': 'department-manager',
  'staff': 'staff',
  'user': 'staff'
}

/**
 * Maps Keycloak roles to Carmen ERP roles with fallback logic
 */
function mapKeycloakRoles(keycloakRoles: string[] = []): Role {
  // Check for exact matches first
  for (const keycloakRole of keycloakRoles) {
    if (ROLE_MAPPING[keycloakRole]) {
      return ROLE_MAPPING[keycloakRole]
    }
  }

  // Check for partial matches (case-insensitive)
  for (const keycloakRole of keycloakRoles) {
    const lowerRole = keycloakRole.toLowerCase()
    if (lowerRole.includes('admin')) return 'admin'
    if (lowerRole.includes('manager')) return 'department-manager'
    if (lowerRole.includes('chef')) return 'chef'
    if (lowerRole.includes('purchasing') || lowerRole.includes('buyer')) return 'purchasing-staff'
    if (lowerRole.includes('finance') || lowerRole.includes('financial')) return 'financial-manager'
    if (lowerRole.includes('counter') || lowerRole.includes('cashier')) return 'counter'
  }

  // Default fallback
  return 'staff'
}

/**
 * Extracts roles from Keycloak JWT token
 */
function extractKeycloakRoles(token: KeycloakJWT): string[] {
  const roles: string[] = []

  // Get roles from realm_access
  if (token.realmAccess?.roles) {
    roles.push(...token.realmAccess.roles)
  }

  // Get roles from resource_access (client-specific roles)
  if (token.resourceAccess) {
    Object.values(token.resourceAccess).forEach(resource => {
      if (resource.roles) {
        roles.push(...resource.roles)
      }
    })
  }

  // Get roles from custom roles claim
  if (token.roles) {
    roles.push(...token.roles)
  }

  return [...new Set(roles)] // Remove duplicates
}

/**
 * NextAuth.js configuration for Keycloak
 */
export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'keycloak',
      name: 'Keycloak',
      type: 'oauth',
      wellKnown: `${getKeycloakConfig().issuer}/.well-known/openid_configuration`,
      clientId: getKeycloakConfig().clientId,
      clientSecret: getKeycloakConfig().clientSecret,
      authorization: {
        params: {
          scope: 'openid email profile roles',
          response_type: 'code',
        },
      },
      idToken: true,
      checks: ['pkce', 'state'],
      profile(profile, tokens) {
        const keycloakRoles = profile.realm_access?.roles || []
        const mappedRole = mapKeycloakRoles(keycloakRoles)

        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          email: profile.email,
          image: profile.picture,
          role: mappedRole,
          roles: keycloakRoles,
          keycloakId: profile.sub,
        }
      },
    },
    // Development credentials provider (bypass Keycloak for local development)
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        id: 'development',
        name: 'Development Login',
        credentials: {
          email: { label: 'Email', type: 'email', placeholder: 'admin@carmen.local' },
          role: { label: 'Role', type: 'text', placeholder: 'admin' }
        },
        async authorize(credentials) {
          // In development, allow any login for testing
          if (credentials?.email) {
            const role = credentials.role || 'staff'
            return {
              id: 'dev-user-001',
              name: credentials.email.split('@')[0],
              email: credentials.email,
              role: role as Role,
              keycloakId: 'dev-user-001',
            }
          }
          return null
        },
      })
    ] : []),
  ],

  callbacks: {
    async jwt({ token, account, profile, user }): Promise<KeycloakJWT> {
      const keycloakToken = token as KeycloakJWT

      // Initial sign-in
      if (account && profile) {
        keycloakToken.accessToken = account.access_token
        keycloakToken.refreshToken = account.refresh_token
        keycloakToken.expiresAt = account.expires_at
        keycloakToken.refreshExpiresAt = account.refresh_expires_at
        keycloakToken.keycloakId = profile.sub
        
        // Extract and store roles
        const roles = extractKeycloakRoles({
          ...keycloakToken,
          realmAccess: (profile as any).realm_access,
          resourceAccess: (profile as any).resource_access,
        })
        
        keycloakToken.roles = roles
        keycloakToken.groups = (profile as any).groups || []

        // Log successful authentication
        await createSecurityAuditLog({
          eventType: SecurityEventType.AUTH_SUCCESS,
          userId: profile.sub as string,
          details: {
            provider: 'keycloak',
            roles,
            authMethod: 'oidc'
          }
        })

        return keycloakToken
      }

      // Check if token needs refresh
      if (keycloakToken.expiresAt && Date.now() < keycloakToken.expiresAt * 1000) {
        return keycloakToken
      }

      // Token expired, attempt refresh
      if (keycloakToken.refreshToken && keycloakToken.refreshExpiresAt) {
        try {
          const config = getKeycloakConfig()
          const response = await fetch(`${config.issuer}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: config.clientId,
              client_secret: config.clientSecret,
              grant_type: 'refresh_token',
              refresh_token: keycloakToken.refreshToken,
            }),
          })

          if (response.ok) {
            const tokens = await response.json()
            
            keycloakToken.accessToken = tokens.access_token
            keycloakToken.refreshToken = tokens.refresh_token ?? keycloakToken.refreshToken
            keycloakToken.expiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in
            keycloakToken.refreshExpiresAt = tokens.refresh_expires_in 
              ? Math.floor(Date.now() / 1000) + tokens.refresh_expires_in
              : keycloakToken.refreshExpiresAt

            // Log token refresh
            await createSecurityAuditLog({
              eventType: SecurityEventType.TOKEN_REFRESHED,
              userId: keycloakToken.keycloakId || '',
              details: {
                provider: 'keycloak',
                expiresAt: keycloakToken.expiresAt
              }
            })

            return keycloakToken
          } else {
            console.error('Token refresh failed:', response.statusText)
            keycloakToken.error = 'RefreshTokenError'
            
            await createSecurityAuditLog({
              eventType: SecurityEventType.TOKEN_REFRESH_FAILED,
              userId: keycloakToken.keycloakId || '',
              details: {
                error: response.statusText,
                status: response.status
              }
            })
          }
        } catch (error) {
          console.error('Token refresh error:', error)
          keycloakToken.error = 'RefreshTokenError'
          
          await createSecurityAuditLog({
            eventType: SecurityEventType.TOKEN_REFRESH_FAILED,
            userId: keycloakToken.keycloakId || '',
            details: {
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          })
        }
      }

      return keycloakToken
    },

    async session({ session, token }): Promise<KeycloakSession> {
      const keycloakToken = token as KeycloakJWT
      const keycloakSession = session as KeycloakSession

      if (keycloakToken.error) {
        keycloakSession.error = keycloakToken.error
      }

      if (keycloakToken.accessToken) {
        keycloakSession.accessToken = keycloakToken.accessToken
        keycloakSession.roles = keycloakToken.roles
        keycloakSession.groups = keycloakToken.groups
        keycloakSession.keycloakId = keycloakToken.keycloakId

        // Enhance user object with additional info
        if (keycloakSession.user) {
          (keycloakSession.user as any).id = keycloakToken.keycloakId
          ;(keycloakSession.user as any).role = mapKeycloakRoles(keycloakToken.roles)
          ;(keycloakSession.user as any).roles = keycloakToken.roles
          ;(keycloakSession.user as any).keycloakId = keycloakToken.keycloakId
        }
      }

      return keycloakSession
    },

    async signIn({ user, account, profile }) {
      // Allow all successful authentications
      // Additional validation can be added here if needed
      if (account?.provider === 'keycloak') {
        return true
      }
      
      // Allow development authentication in development environment
      if (account?.provider === 'development' && process.env.NODE_ENV === 'development') {
        return true
      }
      
      return false
    },

    async redirect({ url, baseUrl }) {
      // Redirect to app after successful authentication
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      await createSecurityAuditLog({
        eventType: SecurityEventType.USER_LOGIN,
        userId: user.id,
        details: {
          provider: account?.provider,
          isNewUser,
          authMethod: 'keycloak-oidc'
        }
      })
    },

    async signOut({ session, token }) {
      const keycloakToken = token as KeycloakJWT
      
      await createSecurityAuditLog({
        eventType: SecurityEventType.USER_LOGOUT,
        userId: keycloakToken.keycloakId || session?.user?.email || 'unknown',
        details: {
          provider: 'keycloak',
          sessionDuration: keycloakToken.iat 
            ? Math.floor(Date.now() / 1000) - keycloakToken.iat 
            : 0
        }
      })

      // Optionally invalidate token in Keycloak
      if (keycloakToken.refreshToken) {
        try {
          const config = getKeycloakConfig()
          await fetch(`${config.issuer}/protocol/openid-connect/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: config.clientId,
              client_secret: config.clientSecret,
              refresh_token: keycloakToken.refreshToken,
            }),
          })
        } catch (error) {
          console.error('Keycloak logout error:', error)
        }
      }
    },

    async session({ session }) {
      // Session accessed event - can be used for activity tracking
    },
  },

  debug: process.env.NODE_ENV === 'development',
}

export default authOptions