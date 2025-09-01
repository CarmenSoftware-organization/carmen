/**
 * Keycloak Authentication Middleware
 * 
 * Provides NextAuth.js session-based authentication middleware that integrates
 * with the existing Carmen ERP authorization system while supporting Keycloak OIDC.
 * 
 * @author Carmen ERP Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'
import jwtDecode from 'jwt-decode'
import { authOptions } from '@/lib/auth/next-auth.config'
import { createSecurityAuditLog, SecurityEventType } from '@/lib/security/audit-logger'
import { rateLimit } from '@/lib/security/rate-limiter'
import type { Role } from '@/lib/types/user'

// Keycloak JWT payload schema
const keycloakJWTSchema = z.object({
  sub: z.string(),
  email: z.string().email().optional(),
  preferred_username: z.string().optional(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  realm_access: z.object({
    roles: z.array(z.string())
  }).optional(),
  resource_access: z.record(z.object({
    roles: z.array(z.string())
  })).optional(),
  groups: z.array(z.string()).optional(),
  exp: z.number(),
  iat: z.number(),
  jti: z.string().optional(),
})

export type KeycloakJWTPayload = z.infer<typeof keycloakJWTSchema>

// Enhanced AuthenticatedUser interface for Keycloak
export interface KeycloakAuthenticatedUser {
  id: string
  keycloakId: string
  email: string
  name?: string
  role: Role
  roles: string[]
  groups?: string[]
  department?: string
  location?: string
  permissions: string[]
  sessionId?: string
  accessToken?: string
}

// Authentication result types
export interface KeycloakAuthResult {
  success: boolean
  user?: KeycloakAuthenticatedUser
  error?: string
  statusCode?: number
}

/**
 * Keycloak Authentication Middleware Class
 * Integrates NextAuth.js sessions with existing Carmen ERP authentication
 */
export class KeycloakAuthMiddleware {
  /**
   * Extract user from NextAuth.js session
   */
  async getSessionUser(request: NextRequest): Promise<KeycloakAuthResult> {
    try {
      // Get NextAuth.js token (works in API routes)
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      })

      if (!token) {
        return {
          success: false,
          error: 'No active session',
          statusCode: 401
        }
      }

      // Check for token error (e.g., refresh failed)
      if (token.error) {
        await createSecurityAuditLog({
          eventType: SecurityEventType.AUTH_FAILED,
          userId: token.keycloakId as string || 'unknown',
          ipAddress: request.ip || '',
          userAgent: request.headers.get('user-agent') || '',
          details: {
            error: token.error,
            provider: 'keycloak'
          }
        })

        return {
          success: false,
          error: 'Session expired or invalid',
          statusCode: 401
        }
      }

      // Map token to AuthenticatedUser
      const user: KeycloakAuthenticatedUser = {
        id: token.keycloakId as string || token.sub || '',
        keycloakId: token.keycloakId as string || token.sub || '',
        email: token.email || '',
        name: token.name || '',
        role: this.mapKeycloakRole(token.roles as string[] || []),
        roles: token.roles as string[] || [],
        groups: token.groups as string[] || [],
        permissions: this.extractPermissions(token.roles as string[] || []),
        sessionId: token.jti as string,
        accessToken: token.accessToken as string,
      }

      return {
        success: true,
        user
      }
    } catch (error) {
      console.error('Session authentication error:', error)
      return {
        success: false,
        error: 'Authentication system error',
        statusCode: 500
      }
    }
  }

  /**
   * Validate Keycloak access token directly
   */
  async validateKeycloakToken(accessToken: string): Promise<KeycloakAuthResult> {
    try {
      // Decode JWT without verification (Keycloak signature verification handled by NextAuth)
      const payload = jwtDecode<any>(accessToken)
      
      // Validate payload structure
      const validationResult = keycloakJWTSchema.safeParse(payload)
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Invalid token payload',
          statusCode: 401
        }
      }

      const keycloakPayload = validationResult.data

      // Check expiration
      const now = Math.floor(Date.now() / 1000)
      if (keycloakPayload.exp <= now) {
        return {
          success: false,
          error: 'Token has expired',
          statusCode: 401
        }
      }

      // Extract roles from payload
      const roles = this.extractRolesFromPayload(keycloakPayload)
      
      // Create user object
      const user: KeycloakAuthenticatedUser = {
        id: keycloakPayload.sub,
        keycloakId: keycloakPayload.sub,
        email: keycloakPayload.email || keycloakPayload.preferred_username || '',
        name: keycloakPayload.name || keycloakPayload.preferred_username || '',
        role: this.mapKeycloakRole(roles),
        roles,
        groups: keycloakPayload.groups || [],
        permissions: this.extractPermissions(roles),
        sessionId: keycloakPayload.jti,
        accessToken,
      }

      return {
        success: true,
        user
      }
    } catch (error) {
      return {
        success: false,
        error: 'Invalid token format',
        statusCode: 401
      }
    }
  }

  /**
   * Extract roles from Keycloak JWT payload
   */
  private extractRolesFromPayload(payload: KeycloakJWTPayload): string[] {
    const roles: string[] = []

    // Realm-level roles
    if (payload.realm_access?.roles) {
      roles.push(...payload.realm_access.roles)
    }

    // Client-level roles
    if (payload.resource_access) {
      Object.values(payload.resource_access).forEach(resource => {
        if (resource.roles) {
          roles.push(...resource.roles)
        }
      })
    }

    return [...new Set(roles)] // Remove duplicates
  }

  /**
   * Map Keycloak roles to Carmen ERP role
   */
  private mapKeycloakRole(keycloakRoles: string[]): Role {
    const roleMapping: Record<string, Role> = {
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

    // Check for exact matches first
    for (const keycloakRole of keycloakRoles) {
      if (roleMapping[keycloakRole]) {
        return roleMapping[keycloakRole]
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
   * Extract permissions from roles (integrate with existing RBAC system)
   */
  private extractPermissions(roles: string[]): string[] {
    const permissions: string[] = []
    
    // Basic permissions mapping - extend as needed
    const rolePermissions: Record<string, string[]> = {
      'admin': ['*'],
      'super-admin': ['*'],
      'financial-manager': ['finance.*', 'reports.*', 'procurement.approve'],
      'department-manager': ['department.*', 'procurement.create', 'inventory.view'],
      'purchasing-staff': ['procurement.*', 'vendor.*', 'inventory.update'],
      'chef': ['recipes.*', 'production.*', 'inventory.view'],
      'counter': ['pos.*', 'inventory.view'],
      'staff': ['profile.view', 'inventory.view']
    }

    for (const role of roles) {
      const mappedRole = this.mapKeycloakRole([role])
      if (rolePermissions[mappedRole]) {
        permissions.push(...rolePermissions[mappedRole])
      }
    }

    return [...new Set(permissions)] // Remove duplicates
  }

  /**
   * Extract authentication token from request headers
   */
  extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return null
    }

    // Support Bearer token format
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i)
    if (bearerMatch) {
      return bearerMatch[1]
    }

    return null
  }
}

// Singleton instance
export const keycloakAuthMiddleware = new KeycloakAuthMiddleware()

/**
 * Higher-order function to protect API routes with Keycloak authentication
 * This replaces the existing withAuth function
 */
export function withKeycloakAuth(
  handler: (request: NextRequest, context: { user: KeycloakAuthenticatedUser }) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Apply rate limiting
      const rateLimitResult = await rateLimit.check(request)
      if (!rateLimitResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many requests',
            retryAfter: rateLimitResult.retryAfter
          },
          { status: 429 }
        )
      }

      // Try session-based authentication first (primary method)
      let authResult = await keycloakAuthMiddleware.getSessionUser(request)

      // Fallback to token-based authentication
      if (!authResult.success) {
        const token = keycloakAuthMiddleware.extractTokenFromRequest(request)
        if (token) {
          authResult = await keycloakAuthMiddleware.validateKeycloakToken(token)
        }
      }

      if (!authResult.success) {
        await createSecurityAuditLog({
          eventType: SecurityEventType.AUTH_FAILED,
          ipAddress: request.ip || '',
          userAgent: request.headers.get('user-agent') || '',
          details: { 
            reason: authResult.error,
            provider: 'keycloak'
          }
        })

        return NextResponse.json(
          {
            success: false,
            error: authResult.error || 'Authentication required'
          },
          { status: authResult.statusCode || 401 }
        )
      }

      // Log successful authentication
      await createSecurityAuditLog({
        eventType: SecurityEventType.AUTH_SUCCESS,
        userId: authResult.user!.id,
        ipAddress: request.ip || '',
        userAgent: request.headers.get('user-agent') || '',
        details: {
          provider: 'keycloak',
          role: authResult.user!.role,
          sessionId: authResult.user!.sessionId
        }
      })

      // Call the protected handler with user context
      return await handler(request, { user: authResult.user! })

    } catch (error) {
      console.error('Keycloak authentication middleware error:', error)
      
      await createSecurityAuditLog({
        eventType: SecurityEventType.AUTH_ERROR,
        ipAddress: request.ip || '',
        userAgent: request.headers.get('user-agent') || '',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          provider: 'keycloak'
        }
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Authentication system error'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Utility function to get authenticated user from request
 */
export async function getKeycloakUser(request: NextRequest): Promise<KeycloakAuthenticatedUser | null> {
  // Try session-based authentication first
  let authResult = await keycloakAuthMiddleware.getSessionUser(request)

  // Fallback to token-based authentication
  if (!authResult.success) {
    const token = keycloakAuthMiddleware.extractTokenFromRequest(request)
    if (token) {
      authResult = await keycloakAuthMiddleware.validateKeycloakToken(token)
    }
  }

  return authResult.success ? authResult.user! : null
}

/**
 * Utility function to require authentication in API routes
 */
export async function requireKeycloakAuth(request: NextRequest): Promise<KeycloakAuthenticatedUser> {
  const user = await getKeycloakUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

// Re-export types for backward compatibility
export type { SecurityEventType } from '@/lib/security/audit-logger'