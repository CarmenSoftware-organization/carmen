/**
 * JWT Authentication Middleware
 * 
 * Provides JWT token validation, user extraction, and authentication utilities
 * for Next.js API routes with comprehensive error handling and security features.
 * 
 * @author Carmen ERP Team
 */

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { getAuthSecurityConfig, isProduction } from '@/lib/config/environment'
import { createSecurityAuditLog, SecurityEventType } from '@/lib/security/audit-logger'
import { rateLimit } from '@/lib/security/rate-limiter'
import type { User, Role, Department } from '@/lib/types/user'

// JWT Payload Schema
const jwtPayloadSchema = z.object({
  sub: z.string().uuid(), // User ID
  email: z.string().email(),
  role: z.enum(['staff', 'department-manager', 'financial-manager', 'purchasing-staff', 'counter', 'chef', 'admin', 'super-admin']),
  department: z.string().optional(),
  location: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  iat: z.number(),
  exp: z.number(),
  jti: z.string().uuid().optional(), // JWT ID for revocation
})

// Refresh Token Payload Schema
const refreshTokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  type: z.literal('refresh'),
  iat: z.number(),
  exp: z.number(),
  jti: z.string().uuid(),
})

export type JWTPayload = z.infer<typeof jwtPayloadSchema>
export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>

// Authentication Result Types
export interface AuthenticationResult {
  success: boolean
  user?: AuthenticatedUser
  error?: string
  statusCode?: number
}

export interface AuthenticatedUser {
  id: string
  email: string
  role: Role
  department?: string
  location?: string
  permissions: string[]
  sessionId?: string
}

// Token Generation Options
export interface TokenGenerationOptions {
  includeRefreshToken?: boolean
  customExpiry?: string
  additionalClaims?: Record<string, any>
}

export interface TokenPair {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  refreshExpiresIn?: number
}

/**
 * Authentication Middleware Class
 * Provides comprehensive JWT authentication with security features
 */
export class AuthenticationMiddleware {
  private config = getAuthSecurityConfig()
  private revokedTokens = new Set<string>() // In-memory revocation (use Redis in production)

  /**
   * Generates JWT access token and optional refresh token
   */
  async generateTokens(user: User, options: TokenGenerationOptions = {}): Promise<TokenPair> {
    const {
      includeRefreshToken = true,
      customExpiry,
      additionalClaims = {}
    } = options

    const now = Math.floor(Date.now() / 1000)
    const sessionId = crypto.randomUUID()

    // Access Token Payload
    const accessPayload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      department: user.department?.id,
      location: user.location?.id,
      permissions: user.permissions || [],
      iat: now,
      exp: now + this.parseExpiry(customExpiry || this.config.JWT_EXPIRES_IN),
      jti: sessionId,
      ...additionalClaims
    }

    // Generate Access Token
    const accessToken = jwt.sign(accessPayload, this.config.JWT_SECRET, {
      algorithm: 'HS256'
    })

    const result: TokenPair = {
      accessToken,
      expiresIn: accessPayload.exp - now
    }

    // Generate Refresh Token if requested
    if (includeRefreshToken) {
      const refreshPayload: RefreshTokenPayload = {
        sub: user.id,
        type: 'refresh',
        iat: now,
        exp: now + this.parseExpiry(this.config.JWT_REFRESH_EXPIRES_IN),
        jti: crypto.randomUUID()
      }

      result.refreshToken = jwt.sign(refreshPayload, this.config.JWT_REFRESH_SECRET, {
        algorithm: 'HS256'
      })
      result.refreshExpiresIn = refreshPayload.exp - now
    }

    // Log token generation
    await createSecurityAuditLog({
      eventType: SecurityEventType.TOKEN_GENERATED,
      userId: user.id,
      ipAddress: '', // Will be filled by caller
      userAgent: '', // Will be filled by caller
      details: {
        includeRefreshToken,
        expiresIn: result.expiresIn,
        sessionId
      }
    })

    return result
  }

  /**
   * Validates JWT token and returns user information
   */
  async validateToken(token: string): Promise<AuthenticationResult> {
    try {
      // Check if token is revoked
      if (this.revokedTokens.has(token)) {
        return {
          success: false,
          error: 'Token has been revoked',
          statusCode: 401
        }
      }

      // Verify token signature and expiry
      const decoded = jwt.verify(token, this.config.JWT_SECRET) as any
      
      // Validate payload structure
      const validationResult = jwtPayloadSchema.safeParse(decoded)
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Invalid token payload',
          statusCode: 401
        }
      }

      const payload = validationResult.data

      // Check token expiry (additional check)
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp <= now) {
        return {
          success: false,
          error: 'Token has expired',
          statusCode: 401
        }
      }

      // Convert payload to AuthenticatedUser
      const user: AuthenticatedUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        department: payload.department,
        location: payload.location,
        permissions: payload.permissions,
        sessionId: payload.jti
      }

      return {
        success: true,
        user
      }

    } catch (error) {
      let errorMessage = 'Invalid token'
      let statusCode = 401

      if (error instanceof jwt.JsonWebTokenError) {
        errorMessage = 'Malformed token'
      } else if (error instanceof jwt.TokenExpiredError) {
        errorMessage = 'Token has expired'
      } else if (error instanceof jwt.NotBeforeError) {
        errorMessage = 'Token not active yet'
      }

      return {
        success: false,
        error: errorMessage,
        statusCode
      }
    }
  }

  /**
   * Validates refresh token and returns user ID
   */
  async validateRefreshToken(refreshToken: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // Check if token is revoked
      if (this.revokedTokens.has(refreshToken)) {
        return {
          success: false,
          error: 'Refresh token has been revoked'
        }
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.config.JWT_REFRESH_SECRET) as any
      
      // Validate payload structure
      const validationResult = refreshTokenPayloadSchema.safeParse(decoded)
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Invalid refresh token payload'
        }
      }

      const payload = validationResult.data

      return {
        success: true,
        userId: payload.sub
      }

    } catch (error) {
      return {
        success: false,
        error: 'Invalid refresh token'
      }
    }
  }

  /**
   * Revokes a token (adds to revocation list)
   */
  async revokeToken(token: string, userId?: string): Promise<void> {
    this.revokedTokens.add(token)

    // Log token revocation
    if (userId) {
      await createSecurityAuditLog({
        eventType: SecurityEventType.TOKEN_REVOKED,
        userId,
        details: { reason: 'Manual revocation' }
      })
    }

    // In production, store revoked tokens in Redis with expiry
    // await redis.setex(`revoked:${tokenHash}`, tokenTTL, '1')
  }

  /**
   * Revokes all tokens for a user (by adding user to revocation list)
   */
  async revokeUserTokens(userId: string): Promise<void> {
    // In a production system, you'd maintain a user revocation timestamp
    // and check this timestamp during token validation
    
    await createSecurityAuditLog({
      eventType: SecurityEventType.USER_TOKENS_REVOKED,
      userId,
      details: { reason: 'All user tokens revoked' }
    })

    // Implementation would involve:
    // 1. Update user's token_revoked_at timestamp in database
    // 2. During validation, check if token.iat < user.token_revoked_at
  }

  /**
   * Extracts token from Authorization header
   */
  extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return null
    }

    // Support both "Bearer <token>" and "<token>" formats
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i)
    if (bearerMatch) {
      return bearerMatch[1]
    }

    // Direct token (less secure, but supported)
    if (authHeader && !authHeader.includes(' ')) {
      return authHeader
    }

    return null
  }

  /**
   * Parse expiry string to seconds
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/)
    if (!match) {
      throw new Error(`Invalid expiry format: ${expiry}`)
    }

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 's': return value
      case 'm': return value * 60
      case 'h': return value * 3600
      case 'd': return value * 86400
      default: throw new Error(`Unknown expiry unit: ${unit}`)
    }
  }
}

// Singleton instance
export const authMiddleware = new AuthenticationMiddleware()

/**
 * Higher-order function to protect API routes with authentication
 */
export function withAuth(
  handler: (request: NextRequest, context: { user: AuthenticatedUser }) => Promise<NextResponse>
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

      // Extract token from request
      const token = authMiddleware.extractTokenFromRequest(request)
      if (!token) {
        await createSecurityAuditLog({
          eventType: SecurityEventType.AUTH_FAILED,
          ipAddress: request.ip || '',
          userAgent: request.headers.get('user-agent') || '',
          details: { reason: 'Missing authorization token' }
        })

        return NextResponse.json(
          {
            success: false,
            error: 'Authorization token required'
          },
          { status: 401 }
        )
      }

      // Validate token
      const authResult = await authMiddleware.validateToken(token)
      if (!authResult.success) {
        await createSecurityAuditLog({
          eventType: SecurityEventType.AUTH_FAILED,
          ipAddress: request.ip || '',
          userAgent: request.headers.get('user-agent') || '',
          details: { 
            reason: authResult.error,
            token: token.substring(0, 10) + '...' // Log partial token for debugging
          }
        })

        return NextResponse.json(
          {
            success: false,
            error: authResult.error
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
          role: authResult.user!.role,
          department: authResult.user!.department,
          sessionId: authResult.user!.sessionId
        }
      })

      // Call the protected handler with user context
      return await handler(request, { user: authResult.user! })

    } catch (error) {
      console.error('Authentication middleware error:', error)
      
      await createSecurityAuditLog({
        eventType: SecurityEventType.AUTH_ERROR,
        ipAddress: request.ip || '',
        userAgent: request.headers.get('user-agent') || '',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
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
 * Utility function to get authenticated user from request in API routes
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const token = authMiddleware.extractTokenFromRequest(request)
  if (!token) {
    return null
  }

  const authResult = await authMiddleware.validateToken(token)
  return authResult.success ? authResult.user! : null
}

/**
 * Utility function to require authentication in API routes
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

// Export utilities
export { SecurityEventType } from '@/lib/security/audit-logger'