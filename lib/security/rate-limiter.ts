/**
 * Rate Limiting System
 * 
 * Provides comprehensive rate limiting with multiple algorithms,
 * IP-based and user-based limits, and adaptive protection against abuse.
 * 
 * @author Carmen ERP Team
 */

import { NextRequest } from 'next/server'
import { getAuthSecurityConfig } from '@/lib/config/environment'
import { createSecurityAuditLog, SecurityEventType } from './audit-logger'

// Rate Limit Configuration
export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (request: NextRequest) => string
  onLimitReached?: (key: string, request: NextRequest) => Promise<void>
  whitelist?: string[] // IPs to skip rate limiting
  blacklist?: string[] // IPs to always block
}

// Rate Limit Result
export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
  blocked: boolean
}

// Rate Limit Entry
interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
  blocked: boolean
  blockUntil?: number
}

// Rate Limit Store Interface
interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>
  set(key: string, entry: RateLimitEntry, ttl: number): Promise<void>
  increment(key: string, ttl: number): Promise<RateLimitEntry>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

/**
 * In-Memory Rate Limit Store
 * In production, replace with Redis or similar distributed store
 */
class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>()
  private timers = new Map<string, NodeJS.Timeout>()

  async get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key)
    if (!entry) return null

    // Check if entry has expired
    if (Date.now() > entry.resetTime) {
      await this.delete(key)
      return null
    }

    return entry
  }

  async set(key: string, entry: RateLimitEntry, ttl: number): Promise<void> {
    this.store.set(key, entry)
    
    // Clear existing timer
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set expiration timer
    const timer = setTimeout(async () => {
      await this.delete(key)
    }, ttl)
    
    this.timers.set(key, timer)
  }

  async increment(key: string, ttl: number): Promise<RateLimitEntry> {
    const existing = await this.get(key)
    const now = Date.now()
    
    if (!existing) {
      const entry: RateLimitEntry = {
        count: 1,
        resetTime: now + ttl,
        firstRequest: now,
        blocked: false
      }
      await this.set(key, entry, ttl)
      return entry
    }

    existing.count++
    await this.set(key, existing, existing.resetTime - now)
    return existing
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
    
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  async clear(): Promise<void> {
    this.store.clear()
    
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
  }

  // Get store metrics
  getMetrics() {
    return {
      totalKeys: this.store.size,
      activeTimers: this.timers.size,
      memoryUsage: this.calculateMemoryUsage()
    }
  }

  private calculateMemoryUsage(): number {
    // Rough estimate of memory usage
    let size = 0
    this.store.forEach((entry, key) => {
      size += key.length * 2 // String characters (UTF-16)
      size += 64 // Estimated entry object size
    })
    return size
  }
}

/**
 * Advanced Rate Limiter with Multiple Algorithms
 */
export class AdvancedRateLimiter {
  private config = getAuthSecurityConfig()
  private store: RateLimitStore = new MemoryRateLimitStore()
  private suspiciousIPs = new Set<string>()
  private trustedIPs = new Set<string>()

  constructor() {
    // Initialize trusted IPs (localhost, private networks)
    this.trustedIPs.add('127.0.0.1')
    this.trustedIPs.add('::1')
    this.trustedIPs.add('localhost')
    
    // Clean up suspicious IPs periodically
    setInterval(() => this.cleanupSuspiciousIPs(), 3600000) // Every hour
  }

  /**
   * Check rate limit for request
   */
  async check(
    request: NextRequest,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const rateLimitConfig: RateLimitConfig = {
      windowMs: this.config.API_RATE_LIMIT_WINDOW * 1000,
      maxRequests: this.config.API_RATE_LIMIT_MAX_REQUESTS,
      skipSuccessfulRequests: this.config.API_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS,
      ...config
    }

    const key = this.generateKey(request, rateLimitConfig)
    const ip = this.extractIP(request)

    try {
      // Check whitelist
      if (rateLimitConfig.whitelist?.includes(ip) || this.trustedIPs.has(ip)) {
        return {
          success: true,
          remaining: rateLimitConfig.maxRequests,
          resetTime: Date.now() + rateLimitConfig.windowMs,
          blocked: false
        }
      }

      // Check blacklist
      if (rateLimitConfig.blacklist?.includes(ip) || this.suspiciousIPs.has(ip)) {
        await this.logRateLimitEvent(key, request, 'blacklisted')
        return {
          success: false,
          remaining: 0,
          resetTime: Date.now() + rateLimitConfig.windowMs,
          retryAfter: rateLimitConfig.windowMs / 1000,
          blocked: true
        }
      }

      // Get current entry
      const entry = await this.store.increment(key, rateLimitConfig.windowMs)

      // Check if blocked
      if (entry.blocked && entry.blockUntil && Date.now() < entry.blockUntil) {
        return {
          success: false,
          remaining: 0,
          resetTime: entry.resetTime,
          retryAfter: Math.ceil((entry.blockUntil - Date.now()) / 1000),
          blocked: true
        }
      }

      // Check rate limit
      if (entry.count > rateLimitConfig.maxRequests) {
        // Block IP for progressive duration
        const blockDuration = this.calculateBlockDuration(entry.count, rateLimitConfig.maxRequests)
        entry.blocked = true
        entry.blockUntil = Date.now() + blockDuration

        await this.store.set(key, entry, Math.max(rateLimitConfig.windowMs, blockDuration))

        // Mark IP as suspicious if excessive requests
        if (entry.count > rateLimitConfig.maxRequests * 3) {
          this.suspiciousIPs.add(ip)
        }

        // Log rate limit exceeded
        await this.logRateLimitEvent(key, request, 'exceeded', {
          count: entry.count,
          limit: rateLimitConfig.maxRequests,
          blockDuration
        })

        // Call limit reached callback
        if (rateLimitConfig.onLimitReached) {
          await rateLimitConfig.onLimitReached(key, request)
        }

        return {
          success: false,
          remaining: 0,
          resetTime: entry.resetTime,
          retryAfter: Math.ceil(blockDuration / 1000),
          blocked: true
        }
      }

      // Success - calculate remaining requests
      const remaining = Math.max(0, rateLimitConfig.maxRequests - entry.count)

      return {
        success: true,
        remaining,
        resetTime: entry.resetTime,
        blocked: false
      }

    } catch (error) {
      console.error('Rate limiter error:', error)
      
      // Fail open for rate limiter errors (allow request but log error)
      await createSecurityAuditLog({
        eventType: SecurityEventType.SECURITY_ERROR,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || '',
        details: {
          component: 'rate_limiter',
          error: error instanceof Error ? error.message : 'Unknown error',
          key
        }
      })

      return {
        success: true,
        remaining: rateLimitConfig.maxRequests,
        resetTime: Date.now() + rateLimitConfig.windowMs,
        blocked: false
      }
    }
  }

  /**
   * Generate rate limit key
   */
  private generateKey(request: NextRequest, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(request)
    }

    // Default: IP + endpoint based key
    const ip = this.extractIP(request)
    const path = new URL(request.url).pathname
    
    return `ratelimit:${ip}:${path}`
  }

  /**
   * Extract IP address from request
   */
  private extractIP(request: NextRequest): string {
    // Check various headers for real IP
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim()
    }

    const realIP = request.headers.get('x-real-ip')
    if (realIP) {
      return realIP.trim()
    }

    const clientIP = request.headers.get('x-client-ip')
    if (clientIP) {
      return clientIP.trim()
    }

    // Fallback to request IP
    return request.ip || 'unknown'
  }

  /**
   * Calculate progressive block duration
   */
  private calculateBlockDuration(currentCount: number, limit: number): number {
    const excess = currentCount - limit
    const baseBlockTime = 60000 // 1 minute base
    
    // Progressive blocking: 1min, 5min, 15min, 1hr, 6hr
    if (excess <= 10) return baseBlockTime
    if (excess <= 50) return baseBlockTime * 5
    if (excess <= 100) return baseBlockTime * 15
    if (excess <= 500) return baseBlockTime * 60
    return baseBlockTime * 360 // 6 hours for extreme abuse
  }

  /**
   * Log rate limit event
   */
  private async logRateLimitEvent(
    key: string,
    request: NextRequest,
    reason: string,
    details?: Record<string, any>
  ): Promise<void> {
    await createSecurityAuditLog({
      eventType: SecurityEventType.RATE_LIMIT_EXCEEDED,
      ipAddress: this.extractIP(request),
      userAgent: request.headers.get('user-agent') || '',
      endpoint: new URL(request.url).pathname,
      method: request.method,
      details: {
        key,
        reason,
        ...details
      }
    })
  }

  /**
   * Clean up suspicious IPs (remove old entries)
   */
  private cleanupSuspiciousIPs(): void {
    // In a production system, you'd track timestamps and remove old entries
    // For now, just clear periodically to prevent memory growth
    if (this.suspiciousIPs.size > 10000) {
      this.suspiciousIPs.clear()
    }
  }

  /**
   * Add IP to whitelist
   */
  addTrustedIP(ip: string): void {
    this.trustedIPs.add(ip)
  }

  /**
   * Remove IP from whitelist
   */
  removeTrustedIP(ip: string): void {
    this.trustedIPs.delete(ip)
  }

  /**
   * Block IP manually
   */
  async blockIP(ip: string, durationMs: number = 3600000): Promise<void> {
    this.suspiciousIPs.add(ip)
    
    // Create block entries for common endpoints
    const endpoints = ['/api/', '/auth/', '/admin/']
    for (const endpoint of endpoints) {
      const key = `ratelimit:${ip}:${endpoint}`
      const entry: RateLimitEntry = {
        count: 999999,
        resetTime: Date.now() + durationMs,
        firstRequest: Date.now(),
        blocked: true,
        blockUntil: Date.now() + durationMs
      }
      await this.store.set(key, entry, durationMs)
    }

    await createSecurityAuditLog({
      eventType: SecurityEventType.SECURITY_VIOLATION,
      ipAddress: ip,
      details: {
        action: 'ip_blocked_manually',
        duration: durationMs
      }
    })
  }

  /**
   * Unblock IP
   */
  async unblockIP(ip: string): Promise<void> {
    this.suspiciousIPs.delete(ip)
    
    // Remove block entries
    const endpoints = ['/api/', '/auth/', '/admin/']
    for (const endpoint of endpoints) {
      const key = `ratelimit:${ip}:${endpoint}`
      await this.store.delete(key)
    }

    await createSecurityAuditLog({
      eventType: SecurityEventType.SECURITY_VIOLATION,
      ipAddress: ip,
      details: {
        action: 'ip_unblocked_manually'
      }
    })
  }

  /**
   * Get rate limiter statistics
   */
  async getStats(): Promise<{
    storeMetrics: any
    suspiciousIPCount: number
    trustedIPCount: number
    recentBlocks: Array<{key: string, count: number, resetTime: number}>
  }> {
    const storeMetrics = (this.store as MemoryRateLimitStore).getMetrics?.() || {}
    
    return {
      storeMetrics,
      suspiciousIPCount: this.suspiciousIPs.size,
      trustedIPCount: this.trustedIPs.size,
      recentBlocks: [] // Would need to track this separately
    }
  }

  /**
   * Reset rate limits for key
   */
  async resetLimits(key: string): Promise<void> {
    await this.store.delete(key)
  }

  /**
   * Clear all rate limits
   */
  async clearAll(): Promise<void> {
    await this.store.clear()
  }
}

// Singleton instance
export const rateLimit = new AdvancedRateLimiter()

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  // Authentication endpoints (stricter)
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: false
  },

  // API endpoints (moderate)
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per 15 minutes
    skipSuccessfulRequests: true
  },

  // Administrative endpoints (very strict)
  ADMIN: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100, // 100 requests per hour
    skipSuccessfulRequests: false
  },

  // File upload endpoints
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 uploads per hour
    skipSuccessfulRequests: true
  },

  // Password reset (very strict)
  PASSWORD_RESET: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 3, // 3 resets per day
    skipSuccessfulRequests: false
  }
}

/**
 * Higher-order function to apply rate limiting to API routes
 */
export function withRateLimit(config: Partial<RateLimitConfig> = {}) {
  return (handler: (request: NextRequest, ...args: any[]) => Promise<Response>) => {
    return async (request: NextRequest, ...args: any[]): Promise<Response> => {
      const result = await rateLimit.check(request, config)
      
      if (!result.success) {
        const response = new Response(
          JSON.stringify({
            success: false,
            error: 'Too many requests',
            retryAfter: result.retryAfter
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': result.retryAfter?.toString() || '60',
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
            }
          }
        )
        
        return response
      }

      // Add rate limit headers to successful response
      const response = await handler(request, ...args)
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())
      
      return response
    }
  }
}