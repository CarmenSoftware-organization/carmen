/**
 * Menu Engineering API Middleware
 * 
 * Shared middleware functions for Menu Engineering API endpoints including
 * enhanced validation, rate limiting, caching, and error handling.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { SecurityEventType } from '@/lib/security/audit-logger'
import type { AuthenticatedUser } from '@/lib/middleware/auth'
import type { ApiResponse, ApiMetadata } from './types'

// ====== ENHANCED VALIDATION MIDDLEWARE ======

/**
 * Configuration for validation middleware
 */
export interface ValidationConfig {
  maxBodySize?: number
  maxQueryLength?: number
  allowedMethods?: string[]
  requireAuth?: boolean
  requiredPermissions?: string[]
  rateLimit?: {
    windowMs: number
    maxRequests: number
  }
}

/**
 * Enhanced validation middleware for Menu Engineering endpoints
 */
export function withMenuEngineeringValidation<T extends z.ZodSchema>(
  schema: T,
  config: ValidationConfig = {}
) {
  return async function validateRequest(
    request: NextRequest,
    user: AuthenticatedUser,
    rawData: any
  ): Promise<{ success: true; data: z.infer<T> } | { success: false; response: NextResponse }> {
    try {
      // Check method
      if (config.allowedMethods && !config.allowedMethods.includes(request.method)) {
        return {
          success: false,
          response: createSecureResponse(
            {
              success: false,
              error: `Method ${request.method} not allowed`
            },
            405
          )
        }
      }

      // Enhanced security validation with threat detection
      const validationResult = await validateInput(rawData, schema, {
        maxLength: config.maxQueryLength || 1000,
        trimWhitespace: true,
        removeSuspiciousPatterns: true,
        allowHtml: false
      })

      if (!validationResult.success) {
        // Log potential security threat
        await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
          reason: 'Invalid menu engineering API request',
          threats: validationResult.threats,
          riskLevel: validationResult.riskLevel,
          endpoint: request.url
        })

        return {
          success: false,
          response: createSecureResponse(
            {
              success: false,
              error: 'Invalid request parameters',
              details: validationResult.errors
            },
            400
          )
        }
      }

      return {
        success: true,
        data: validationResult.sanitized || validationResult.data!
      }
    } catch (error) {
      console.error('Validation middleware error:', error)
      
      await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
        error: error instanceof Error ? error.message : 'Unknown validation error',
        stack: error instanceof Error ? error.stack : undefined,
        endpoint: request.url
      })

      return {
        success: false,
        response: createSecureResponse(
          {
            success: false,
            error: 'Request validation failed'
          },
          500
        )
      }
    }
  }
}

// ====== CACHING MIDDLEWARE ======

/**
 * Cache configuration for Menu Engineering endpoints
 */
export interface CacheConfig {
  ttl: number // seconds
  varyBy?: string[] // headers to vary cache by
  conditions?: {
    method?: string[]
    contentType?: string[]
  }
}

/**
 * Intelligent caching middleware for Menu Engineering APIs
 */
export function withMenuEngineeringCache(config: CacheConfig) {
  return function applyCaching(response: NextResponse, request: NextRequest): NextResponse {
    // Only cache GET requests by default
    if (config.conditions?.method && !config.conditions.method.includes(request.method)) {
      return response
    }

    // Set cache headers based on configuration
    const cacheControl = `public, max-age=${config.ttl}`
    response.headers.set('Cache-Control', cacheControl)
    
    // Add ETag for cache validation
    const etag = generateETag(request.url + request.headers.get('authorization'))
    response.headers.set('ETag', etag)
    
    // Add Vary headers if specified
    if (config.varyBy && config.varyBy.length > 0) {
      response.headers.set('Vary', config.varyBy.join(', '))
    }

    // Add cache metadata
    response.headers.set('X-Cache-TTL', config.ttl.toString())
    response.headers.set('X-Cache-Generated', new Date().toISOString())

    return response
  }
}

// ====== ERROR HANDLING MIDDLEWARE ======

/**
 * Standardized error handling for Menu Engineering APIs
 */
export async function handleMenuEngineeringError(
  error: Error,
  request: NextRequest,
  user: AuthenticatedUser,
  context: {
    endpoint: string
    operation: string
    resourceId?: string
  }
): Promise<NextResponse> {
  console.error(`Menu Engineering API Error [${context.endpoint}]:`, error)
  
  // Log security event
  await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
    error: error.message,
    stack: error.stack,
    endpoint: context.endpoint,
    operation: context.operation,
    resourceId: context.resourceId
  })

  // Determine error type and response
  if (error.name === 'ValidationError') {
    return createSecureResponse(
      {
        success: false,
        error: 'Invalid input data',
        details: error.message
      },
      400
    )
  }

  if (error.name === 'NotFoundError') {
    return createSecureResponse(
      {
        success: false,
        error: 'Resource not found',
        details: error.message
      },
      404
    )
  }

  if (error.name === 'UnauthorizedError') {
    return createSecureResponse(
      {
        success: false,
        error: 'Insufficient permissions',
        details: error.message
      },
      403
    )
  }

  if (error.name === 'RateLimitError') {
    return createSecureResponse(
      {
        success: false,
        error: 'Rate limit exceeded',
        details: 'Too many requests. Please try again later.'
      },
      429
    )
  }

  // Generic server error
  return createSecureResponse(
    {
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    },
    500
  )
}

// ====== RESPONSE FORMATTING MIDDLEWARE ======

/**
 * Standardized response formatting for Menu Engineering APIs
 */
export function formatMenuEngineeringResponse<T>(
  data: T,
  metadata?: Partial<ApiMetadata>,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: status < 400,
    data: status < 400 ? data : undefined,
    error: status >= 400 ? (typeof data === 'string' ? data : 'Request failed') : undefined,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: 'v1',
      ...metadata
    }
  }

  const nextResponse = createSecureResponse(response, status)
  
  // Add standard headers
  nextResponse.headers.set('X-API-Version', 'v1')
  nextResponse.headers.set('X-Request-ID', response.metadata!.requestId!)
  
  if (metadata?.cacheTtl) {
    nextResponse.headers.set('Cache-Control', `public, max-age=${metadata.cacheTtl}`)
  }

  return nextResponse
}

// ====== PERFORMANCE MONITORING MIDDLEWARE ======

/**
 * Performance monitoring for Menu Engineering APIs
 */
export function withPerformanceMonitoring() {
  return function monitorPerformance(
    request: NextRequest,
    startTime: number
  ) {
    return function logPerformance(response: NextResponse) {
      const duration = Date.now() - startTime
      
      // Add performance headers
      response.headers.set('X-Response-Time', `${duration}ms`)
      response.headers.set('X-Process-Time', new Date().toISOString())
      
      // Log slow requests
      if (duration > 5000) { // > 5 seconds
        console.warn(`Slow Menu Engineering API request: ${request.url} took ${duration}ms`)
      }
      
      // Log performance metrics for monitoring
      if (process.env.NODE_ENV === 'production') {
        // Here you would send metrics to your monitoring system
        console.log(`API Performance: ${request.method} ${request.url} - ${duration}ms`)
      }
      
      return response
    }
  }
}

// ====== AUDIT LOGGING MIDDLEWARE ======

/**
 * Enhanced audit logging for Menu Engineering APIs
 */
export async function logMenuEngineeringActivity(
  request: NextRequest,
  user: AuthenticatedUser,
  activity: {
    resource: string
    action: string
    resourceId?: string
    details?: Record<string, any>
    sensitive?: boolean
  }
): Promise<void> {
  const eventType = activity.sensitive
    ? SecurityEventType.SENSITIVE_DATA_ACCESS
    : SecurityEventType.DATA_MODIFICATION

  await auditSecurityEvent(eventType, request, user.id, {
    resource: activity.resource,
    action: activity.action,
    resourceId: activity.resourceId,
    endpoint: request.url,
    method: request.method,
    userAgent: request.headers.get('user-agent'),
    ...activity.details
  })
}

// ====== UTILITY FUNCTIONS ======

/**
 * Generate ETag for caching
 */
function generateETag(content: string): string {
  // Simple hash function for ETag generation
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `"${Math.abs(hash).toString(16)}"`
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if request is from internal system
 */
export function isInternalRequest(request: NextRequest): boolean {
  const internalHeaders = [
    'x-internal-request',
    'x-service-token',
    'x-system-request'
  ]
  
  return internalHeaders.some(header => 
    request.headers.has(header) && request.headers.get(header) === 'true'
  )
}

/**
 * Extract client information for logging
 */
export function extractClientInfo(request: NextRequest): {
  ip: string
  userAgent: string
  referer?: string
} {
  return {
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    referer: request.headers.get('referer') || undefined
  }
}

/**
 * Rate limiting key generator for Menu Engineering APIs
 */
export function generateRateLimitKey(
  request: NextRequest,
  user?: AuthenticatedUser,
  keyType: 'user' | 'ip' | 'endpoint' | 'combined' = 'combined'
): string {
  const endpoint = new URL(request.url).pathname
  const method = request.method
  
  switch (keyType) {
    case 'user':
      return user ? `user:${user.id}` : `ip:${request.ip || 'unknown'}`
    case 'ip':
      return `ip:${request.ip || 'unknown'}`
    case 'endpoint':
      return `endpoint:${method}:${endpoint}`
    case 'combined':
    default:
      const userKey = user ? user.id : request.ip || 'unknown'
      return `menu-eng:${userKey}:${method}:${endpoint}`
  }
}