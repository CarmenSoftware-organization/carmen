/**
 * API Route Protection Utilities
 * 
 * Provides unified API protection that works with both JWT tokens (legacy)
 * and Keycloak sessions, allowing for gradual migration while maintaining
 * backward compatibility.
 * 
 * @author Carmen ERP Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withKeycloakAuth, getKeycloakUser, type KeycloakAuthenticatedUser } from './keycloak-middleware'
import { withAuth, getAuthenticatedUser, type AuthenticatedUser } from '../middleware/auth'
import { createSecurityAuditLog, SecurityEventType } from '@/lib/security/audit-logger'
import type { Role } from '@/lib/types/user'

// Unified user interface that works with both auth systems
export interface UnifiedAuthenticatedUser {
  id: string
  keycloakId?: string
  email: string
  name?: string
  role: Role
  roles?: string[]
  groups?: string[]
  department?: string
  location?: string
  permissions: string[]
  sessionId?: string
  accessToken?: string
  authProvider: 'jwt' | 'keycloak'
}

// Configuration for different auth strategies
export interface AuthConfig {
  strategy: 'keycloak-only' | 'jwt-only' | 'hybrid' | 'auto'
  fallbackToJWT?: boolean
  requireSpecificRoles?: Role[]
  requirePermissions?: string[]
  allowedDepartments?: string[]
  logActivity?: boolean
}

const DEFAULT_AUTH_CONFIG: AuthConfig = {
  strategy: 'auto', // Try Keycloak first, fallback to JWT
  fallbackToJWT: true,
  logActivity: true,
}

/**
 * Convert KeycloakAuthenticatedUser to UnifiedAuthenticatedUser
 */
function keycloakUserToUnified(user: KeycloakAuthenticatedUser): UnifiedAuthenticatedUser {
  return {
    id: user.id,
    keycloakId: user.keycloakId,
    email: user.email,
    name: user.name,
    role: user.role,
    roles: user.roles,
    groups: user.groups,
    department: user.department,
    location: user.location,
    permissions: user.permissions,
    sessionId: user.sessionId,
    accessToken: user.accessToken,
    authProvider: 'keycloak',
  }
}

/**
 * Convert legacy AuthenticatedUser to UnifiedAuthenticatedUser
 */
function jwtUserToUnified(user: AuthenticatedUser): UnifiedAuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    department: user.department,
    location: user.location,
    permissions: user.permissions,
    sessionId: user.sessionId,
    authProvider: 'jwt',
  }
}

/**
 * Get authenticated user using the configured strategy
 */
export async function getUnifiedAuthenticatedUser(
  request: NextRequest,
  config: AuthConfig = DEFAULT_AUTH_CONFIG
): Promise<UnifiedAuthenticatedUser | null> {
  let user: UnifiedAuthenticatedUser | null = null

  try {
    switch (config.strategy) {
      case 'keycloak-only':
        const keycloakUser = await getKeycloakUser(request)
        user = keycloakUser ? keycloakUserToUnified(keycloakUser) : null
        break

      case 'jwt-only':
        const jwtUser = await getAuthenticatedUser(request)
        user = jwtUser ? jwtUserToUnified(jwtUser) : null
        break

      case 'hybrid':
      case 'auto':
        // Try Keycloak first
        const kcUser = await getKeycloakUser(request)
        if (kcUser) {
          user = keycloakUserToUnified(kcUser)
        } else if (config.fallbackToJWT) {
          // Fallback to JWT
          const legacyUser = await getAuthenticatedUser(request)
          user = legacyUser ? jwtUserToUnified(legacyUser) : null
        }
        break

      default:
        throw new Error(`Unknown auth strategy: ${config.strategy}`)
    }

    // Apply additional authorization checks
    if (user && !passesAuthorizationChecks(user, config)) {
      await createSecurityAuditLog({
        eventType: SecurityEventType.AUTH_FAILED,
        userId: user.id,
        ipAddress: request.ip || '',
        userAgent: request.headers.get('user-agent') || '',
        details: {
          reason: 'Failed authorization checks',
          requiredRoles: config.requireSpecificRoles,
          requiredPermissions: config.requirePermissions,
          userRole: user.role,
          userPermissions: user.permissions
        }
      })
      return null
    }

    // Log successful authentication if enabled
    if (user && config.logActivity) {
      await createSecurityAuditLog({
        eventType: SecurityEventType.AUTH_SUCCESS,
        userId: user.id,
        ipAddress: request.ip || '',
        userAgent: request.headers.get('user-agent') || '',
        details: {
          provider: user.authProvider,
          role: user.role,
          department: user.department,
          sessionId: user.sessionId
        }
      })
    }

    return user
  } catch (error) {
    console.error('Unified authentication error:', error)
    
    await createSecurityAuditLog({
      eventType: SecurityEventType.AUTH_ERROR,
      ipAddress: request.ip || '',
      userAgent: request.headers.get('user-agent') || '',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        strategy: config.strategy
      }
    })

    return null
  }
}

/**
 * Check if user passes additional authorization requirements
 */
function passesAuthorizationChecks(user: UnifiedAuthenticatedUser, config: AuthConfig): boolean {
  // Check role requirements
  if (config.requireSpecificRoles && config.requireSpecificRoles.length > 0) {
    if (!config.requireSpecificRoles.includes(user.role)) {
      return false
    }
  }

  // Check permission requirements
  if (config.requirePermissions && config.requirePermissions.length > 0) {
    const hasRequiredPermissions = config.requirePermissions.every(permission => {
      // Check for wildcard permissions
      if (user.permissions.includes('*')) return true
      
      // Check for exact match
      if (user.permissions.includes(permission)) return true
      
      // Check for wildcard pattern match (e.g., 'finance.*' matches 'finance.view')
      return user.permissions.some(userPerm => {
        if (userPerm.endsWith('.*')) {
          const basePermission = userPerm.slice(0, -2)
          return permission.startsWith(basePermission + '.')
        }
        return false
      })
    })

    if (!hasRequiredPermissions) {
      return false
    }
  }

  // Check department requirements
  if (config.allowedDepartments && config.allowedDepartments.length > 0) {
    if (!user.department || !config.allowedDepartments.includes(user.department)) {
      return false
    }
  }

  return true
}

/**
 * Higher-order function for protecting API routes with unified authentication
 */
export function withUnifiedAuth(
  handler: (request: NextRequest, context: { user: UnifiedAuthenticatedUser }) => Promise<NextResponse>,
  config: AuthConfig = DEFAULT_AUTH_CONFIG
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = await getUnifiedAuthenticatedUser(request, config)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      )
    }

    return await handler(request, { user })
  }
}

/**
 * Higher-order function for protecting API routes with role-based access
 */
export function withRoleAuth(
  roles: Role | Role[],
  handler: (request: NextRequest, context: { user: UnifiedAuthenticatedUser }) => Promise<NextResponse>,
  config: Partial<AuthConfig> = {}
) {
  const roleArray = Array.isArray(roles) ? roles : [roles]
  const authConfig: AuthConfig = {
    ...DEFAULT_AUTH_CONFIG,
    ...config,
    requireSpecificRoles: roleArray,
  }

  return withUnifiedAuth(handler, authConfig)
}

/**
 * Higher-order function for protecting API routes with permission-based access
 */
export function withPermissionAuth(
  permissions: string | string[],
  handler: (request: NextRequest, context: { user: UnifiedAuthenticatedUser }) => Promise<NextResponse>,
  config: Partial<AuthConfig> = {}
) {
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions]
  const authConfig: AuthConfig = {
    ...DEFAULT_AUTH_CONFIG,
    ...config,
    requirePermissions: permissionArray,
  }

  return withUnifiedAuth(handler, authConfig)
}

/**
 * Pre-configured auth functions for common scenarios
 */
export const authStrategies = {
  // Keycloak-only authentication
  keycloakOnly: (
    handler: (request: NextRequest, context: { user: UnifiedAuthenticatedUser }) => Promise<NextResponse>
  ) => withUnifiedAuth(handler, { ...DEFAULT_AUTH_CONFIG, strategy: 'keycloak-only' }),

  // JWT-only authentication (for legacy support)
  jwtOnly: (
    handler: (request: NextRequest, context: { user: UnifiedAuthenticatedUser }) => Promise<NextResponse>
  ) => withUnifiedAuth(handler, { ...DEFAULT_AUTH_CONFIG, strategy: 'jwt-only' }),

  // Hybrid approach with JWT fallback
  hybrid: (
    handler: (request: NextRequest, context: { user: UnifiedAuthenticatedUser }) => Promise<NextResponse>
  ) => withUnifiedAuth(handler, { ...DEFAULT_AUTH_CONFIG, strategy: 'hybrid' }),

  // Admin-only access
  adminOnly: (
    handler: (request: NextRequest, context: { user: UnifiedAuthenticatedUser }) => Promise<NextResponse>
  ) => withRoleAuth(['admin', 'super-admin'], handler),

  // Financial manager access
  financialAccess: (
    handler: (request: NextRequest, context: { user: UnifiedAuthenticatedUser }) => Promise<NextResponse>
  ) => withRoleAuth(['admin', 'super-admin', 'financial-manager'], handler),

  // Department manager and above access
  managerAccess: (
    handler: (request: NextRequest, context: { user: UnifiedAuthenticatedUser }) => Promise<NextResponse>
  ) => withRoleAuth(['admin', 'super-admin', 'financial-manager', 'department-manager'], handler),

  // Procurement staff access
  procurementAccess: (
    handler: (request: NextRequest, context: { user: UnifiedAuthenticatedUser }) => Promise<NextResponse>
  ) => withPermissionAuth(['procurement.*', 'admin'], handler),

  // Kitchen/Chef access
  kitchenAccess: (
    handler: (request: NextRequest, context: { user: UnifiedAuthenticatedUser }) => Promise<NextResponse>
  ) => withRoleAuth(['admin', 'super-admin', 'chef'], handler),
}

// Export legacy functions for backward compatibility
export { withKeycloakAuth, withAuth }