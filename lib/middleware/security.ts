/**
 * Security Headers and CORS Middleware
 * 
 * Provides comprehensive security headers, CORS configuration, and request
 * validation for Next.js API routes following OWASP security guidelines.
 * 
 * @author Carmen ERP Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSecurityConfig, isProduction } from '@/lib/config/environment'
import { createSecurityAuditLog, SecurityEventType } from '@/lib/security/audit-logger'

// Security Headers Configuration
export interface SecurityHeadersConfig {
  enableHSTS?: boolean
  enableCSP?: boolean
  enableXSS?: boolean
  enableFrameOptions?: boolean
  enableContentType?: boolean
  enableReferrerPolicy?: boolean
  enablePermissionsPolicy?: boolean
  customHeaders?: Record<string, string>
}

// CORS Configuration
export interface CORSConfig {
  origin?: string | string[] | boolean
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  preflightContinue?: boolean
  optionsSuccessStatus?: number
}

// Request Validation Configuration
export interface RequestValidationConfig {
  maxBodySize?: number
  allowedContentTypes?: string[]
  requireContentType?: boolean
  validateOrigin?: boolean
  blockSuspiciousRequests?: boolean
}

/**
 * Security Middleware Class
 * Provides comprehensive security features for API routes
 */
export class SecurityMiddleware {
  private config = getAuthSecurityConfig()

  /**
   * Apply security headers to response
   */
  applySecurityHeaders(response: NextResponse, config: SecurityHeadersConfig = {}): NextResponse {
    const {
      enableHSTS = true,
      enableCSP = this.config.CSP_ENABLED,
      enableXSS = true,
      enableFrameOptions = true,
      enableContentType = true,
      enableReferrerPolicy = true,
      enablePermissionsPolicy = true,
      customHeaders = {}
    } = config

    // Strict Transport Security (HSTS)
    if (enableHSTS && isProduction()) {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      )
    }

    // Content Security Policy (CSP)
    if (enableCSP) {
      const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.anthropic.com https://api.openai.com",
        "media-src 'self'",
        "object-src 'none'",
        "frame-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ]

      // Add report URI if configured
      if (this.config.CSP_REPORT_URI) {
        cspDirectives.push(`report-uri ${this.config.CSP_REPORT_URI}`)
      }

      response.headers.set('Content-Security-Policy', cspDirectives.join('; '))
    }

    // XSS Protection
    if (enableXSS) {
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('X-Content-Type-Options', 'nosniff')
    }

    // Frame Options
    if (enableFrameOptions) {
      response.headers.set('X-Frame-Options', 'DENY')
    }

    // Content Type Options
    if (enableContentType) {
      response.headers.set('X-Content-Type-Options', 'nosniff')
    }

    // Referrer Policy
    if (enableReferrerPolicy) {
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    }

    // Permissions Policy (Feature Policy)
    if (enablePermissionsPolicy) {
      const permissionsPolicies = [
        'geolocation=()',
        'microphone=()',
        'camera=()',
        'magnetometer=()',
        'gyroscope=()',
        'fullscreen=(self)',
        'payment=(self)',
        'usb=()'
      ]
      response.headers.set('Permissions-Policy', permissionsPolicies.join(', '))
    }

    // Additional Security Headers
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

    // Remove server identification
    response.headers.delete('Server')
    response.headers.delete('X-Powered-By')

    // API specific headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    // Apply custom headers
    Object.entries(customHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  /**
   * Handle CORS preflight and apply CORS headers
   */
  handleCORS(request: NextRequest, config: CORSConfig = {}): NextResponse | null {
    const {
      origin = this.config.CORS_ORIGIN,
      methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders = [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'X-File-Name'
      ],
      exposedHeaders = ['X-Total-Count', 'X-Page-Count'],
      credentials = this.config.CORS_CREDENTIALS,
      maxAge = 86400, // 24 hours
      optionsSuccessStatus = 204
    } = config

    const requestOrigin = request.headers.get('origin')
    const method = request.method

    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
      const response = new NextResponse(null, { status: optionsSuccessStatus })

      // Set CORS headers for preflight
      this.setCORSHeaders(response, {
        origin,
        methods,
        allowedHeaders,
        exposedHeaders,
        credentials,
        maxAge,
        requestOrigin
      })

      return this.applySecurityHeaders(response)
    }

    return null // Not a preflight request
  }

  /**
   * Apply CORS headers to response
   */
  applyCORSHeaders(response: NextResponse, request: NextRequest, config: CORSConfig = {}): NextResponse {
    const {
      origin = this.config.CORS_ORIGIN,
      methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      exposedHeaders = ['X-Total-Count', 'X-Page-Count'],
      credentials = this.config.CORS_CREDENTIALS
    } = config

    const requestOrigin = request.headers.get('origin')

    this.setCORSHeaders(response, {
      origin,
      methods,
      exposedHeaders,
      credentials,
      requestOrigin
    })

    return response
  }

  /**
   * Set CORS headers on response
   */
  private setCORSHeaders(response: NextResponse, config: {
    origin: string | string[] | boolean
    methods?: string[]
    allowedHeaders?: string[]
    exposedHeaders?: string[]
    credentials?: boolean
    maxAge?: number
    requestOrigin?: string | null
  }): void {
    const { origin, methods, allowedHeaders, exposedHeaders, credentials, maxAge, requestOrigin } = config

    // Handle origin
    if (typeof origin === 'string') {
      if (origin === '*') {
        response.headers.set('Access-Control-Allow-Origin', '*')
      } else if (requestOrigin === origin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Vary', 'Origin')
      }
    } else if (Array.isArray(origin)) {
      if (requestOrigin && origin.includes(requestOrigin)) {
        response.headers.set('Access-Control-Allow-Origin', requestOrigin)
        response.headers.set('Vary', 'Origin')
      }
    } else if (origin === true && requestOrigin) {
      response.headers.set('Access-Control-Allow-Origin', requestOrigin)
      response.headers.set('Vary', 'Origin')
    }

    // Set other CORS headers
    if (methods) {
      response.headers.set('Access-Control-Allow-Methods', methods.join(', '))
    }

    if (allowedHeaders) {
      response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
    }

    if (exposedHeaders) {
      response.headers.set('Access-Control-Expose-Headers', exposedHeaders.join(', '))
    }

    if (credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    if (maxAge) {
      response.headers.set('Access-Control-Max-Age', maxAge.toString())
    }
  }

  /**
   * Validate incoming request
   */
  async validateRequest(request: NextRequest, config: RequestValidationConfig = {}): Promise<{
    valid: boolean
    error?: string
    statusCode?: number
  }> {
    const {
      maxBodySize = 10 * 1024 * 1024, // 10MB
      allowedContentTypes = [
        'application/json',
        'application/x-www-form-urlencoded',
        'multipart/form-data',
        'text/plain'
      ],
      requireContentType = true,
      validateOrigin = true,
      blockSuspiciousRequests = true
    } = config

    try {
      // Validate Content-Length
      const contentLength = request.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > maxBodySize) {
        await createSecurityAuditLog({
          eventType: SecurityEventType.SECURITY_VIOLATION,
          ipAddress: request.ip || '',
          userAgent: request.headers.get('user-agent') || '',
          details: {
            type: 'oversized_request',
            contentLength: parseInt(contentLength),
            maxAllowed: maxBodySize
          }
        })

        return {
          valid: false,
          error: 'Request too large',
          statusCode: 413
        }
      }

      // Validate Content-Type for non-GET requests
      if (requireContentType && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        const contentType = request.headers.get('content-type')
        if (!contentType) {
          return {
            valid: false,
            error: 'Content-Type header required',
            statusCode: 400
          }
        }

        const baseContentType = contentType.split(';')[0].trim()
        if (!allowedContentTypes.includes(baseContentType)) {
          await createSecurityAuditLog({
            eventType: SecurityEventType.SECURITY_VIOLATION,
            ipAddress: request.ip || '',
            userAgent: request.headers.get('user-agent') || '',
            details: {
              type: 'invalid_content_type',
              contentType: baseContentType,
              allowed: allowedContentTypes
            }
          })

          return {
            valid: false,
            error: 'Unsupported Content-Type',
            statusCode: 415
          }
        }
      }

      // Validate Origin for state-changing requests
      if (validateOrigin && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const origin = request.headers.get('origin')
        const referer = request.headers.get('referer')
        
        if (!origin && !referer) {
          await createSecurityAuditLog({
            eventType: SecurityEventType.SECURITY_VIOLATION,
            ipAddress: request.ip || '',
            userAgent: request.headers.get('user-agent') || '',
            details: {
              type: 'missing_origin',
              method: request.method
            }
          })

          return {
            valid: false,
            error: 'Origin or Referer header required',
            statusCode: 400
          }
        }
      }

      // Block suspicious requests
      if (blockSuspiciousRequests) {
        const userAgent = request.headers.get('user-agent') || ''
        const suspiciousPatterns = [
          /curl/i,
          /wget/i,
          /python-requests/i,
          /go-http-client/i,
          /java/i,
          /php/i
        ]

        // Allow legitimate automation tools in development
        if (isProduction() && suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
          // Check for API key or authorization header
          const auth = request.headers.get('authorization')
          if (!auth) {
            await createSecurityAuditLog({
              eventType: SecurityEventType.SECURITY_VIOLATION,
              ipAddress: request.ip || '',
              userAgent,
              details: {
                type: 'suspicious_user_agent',
                userAgent
              }
            })

            return {
              valid: false,
              error: 'Suspicious request detected',
              statusCode: 403
            }
          }
        }
      }

      // Check for common attack patterns in headers
      const suspiciousHeaderPatterns = [
        { header: 'x-forwarded-for', pattern: /(<|>|script|javascript|vbscript)/i },
        { header: 'x-real-ip', pattern: /(<|>|script|javascript|vbscript)/i },
        { header: 'user-agent', pattern: /(<|>|script|javascript|vbscript|eval\(|expression\()/i },
        { header: 'referer', pattern: /(javascript:|data:|vbscript:)/i }
      ]

      for (const { header, pattern } of suspiciousHeaderPatterns) {
        const headerValue = request.headers.get(header)
        if (headerValue && pattern.test(headerValue)) {
          await createSecurityAuditLog({
            eventType: SecurityEventType.SECURITY_VIOLATION,
            ipAddress: request.ip || '',
            userAgent: request.headers.get('user-agent') || '',
            details: {
              type: 'malicious_header',
              header,
              value: headerValue.substring(0, 100) // Truncate for logging
            }
          })

          return {
            valid: false,
            error: 'Malicious request detected',
            statusCode: 400
          }
        }
      }

      return { valid: true }

    } catch (error) {
      console.error('Request validation error:', error)
      return {
        valid: false,
        error: 'Request validation failed',
        statusCode: 500
      }
    }
  }

  /**
   * Generate nonce for CSP
   */
  generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
  }

  /**
   * Sanitize header value
   */
  sanitizeHeaderValue(value: string): string {
    // Remove potentially dangerous characters
    return value.replace(/[\r\n\t]/g, '').substring(0, 200)
  }
}

// Singleton instance
export const securityMiddleware = new SecurityMiddleware()

/**
 * Higher-order function to apply security middleware to API routes
 */
export function withSecurity(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  config: {
    corsConfig?: CORSConfig
    headersConfig?: SecurityHeadersConfig
    validationConfig?: RequestValidationConfig
  } = {}
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const { corsConfig, headersConfig, validationConfig } = config

      // Handle CORS preflight
      const corsResponse = securityMiddleware.handleCORS(request, corsConfig)
      if (corsResponse) {
        return corsResponse
      }

      // Validate request
      const validation = await securityMiddleware.validateRequest(request, validationConfig)
      if (!validation.valid) {
        const response = NextResponse.json(
          {
            success: false,
            error: validation.error
          },
          { status: validation.statusCode || 400 }
        )

        return securityMiddleware.applySecurityHeaders(
          securityMiddleware.applyCORSHeaders(response, request, corsConfig),
          headersConfig
        )
      }

      // Execute the handler
      const response = await handler(request, ...args)

      // Apply security headers and CORS
      return securityMiddleware.applySecurityHeaders(
        securityMiddleware.applyCORSHeaders(response, request, corsConfig),
        headersConfig
      )

    } catch (error) {
      console.error('Security middleware error:', error)
      
      await createSecurityAuditLog({
        eventType: SecurityEventType.SECURITY_ERROR,
        ipAddress: request.ip || '',
        userAgent: request.headers.get('user-agent') || '',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      const errorResponse = NextResponse.json(
        {
          success: false,
          error: 'Security system error'
        },
        { status: 500 }
      )

      return securityMiddleware.applySecurityHeaders(errorResponse, config.headersConfig)
    }
  }
}

/**
 * Utility function to create secure API response
 */
export function createSecureResponse(
  data: any,
  status: number = 200,
  headers: Record<string, string> = {}
): NextResponse {
  const response = NextResponse.json(data, { status })
  
  // Apply custom headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return securityMiddleware.applySecurityHeaders(response)
}

/**
 * Security audit utility for API routes
 */
export async function auditSecurityEvent(
  eventType: SecurityEventType,
  request: NextRequest,
  userId?: string,
  details?: Record<string, any>
): Promise<void> {
  await createSecurityAuditLog({
    eventType,
    userId,
    ipAddress: request.ip || '',
    userAgent: request.headers.get('user-agent') || '',
    details
  })
}

// Export security constants
export const SECURITY_HEADERS = {
  HSTS: 'Strict-Transport-Security',
  CSP: 'Content-Security-Policy',
  XSS: 'X-XSS-Protection',
  FRAME_OPTIONS: 'X-Frame-Options',
  CONTENT_TYPE: 'X-Content-Type-Options',
  REFERRER: 'Referrer-Policy'
} as const