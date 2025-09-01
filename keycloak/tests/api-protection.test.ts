/**
 * API Protection Integration Tests
 * 
 * Tests for validating API endpoint protection with Keycloak authentication
 */

import { describe, test, expect, beforeAll, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { withKeycloakAuth } from '@/lib/auth/keycloak-middleware'
import { withUnifiedAuth } from '@/lib/auth/api-protection'
import { createMockRequest, createMockResponse } from '@/lib/test-utils/mock-helpers'

// Test configuration
const TEST_CONFIG = {
  keycloakUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'carmen',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'carmen-web-dev',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'dev-client-secret-change-in-production',
}

// Helper to get test tokens
class TokenHelper {
  async getValidToken(username: string = 'admin', password: string = 'admin123!'): Promise<string> {
    const response = await fetch(`${TEST_CONFIG.keycloakUrl}/realms/${TEST_CONFIG.realm}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username,
        password,
        grant_type: 'password',
        client_id: TEST_CONFIG.clientId,
        client_secret: TEST_CONFIG.clientSecret,
        scope: 'openid profile email roles carmen-erp',
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(`Failed to get token: ${data.error_description || data.error}`)
    }

    return data.access_token
  }

  async getExpiredToken(): Promise<string> {
    // Create a mock expired token (this would be replaced with an actual expired token in real tests)
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'test' }))
    const payload = btoa(JSON.stringify({
      iss: `${TEST_CONFIG.keycloakUrl}/realms/${TEST_CONFIG.realm}`,
      aud: TEST_CONFIG.clientId,
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      iat: Math.floor(Date.now() / 1000) - 7200,
      preferred_username: 'test-user',
      realm_access: { roles: ['carmen-staff'] }
    }))
    const signature = 'mock-signature'
    
    return `${header}.${payload}.${signature}`
  }

  createInvalidToken(): string {
    return 'invalid.token.here'
  }
}

// Mock API handlers for testing
const mockHandlers = {
  publicHandler: async (req: NextRequest) => {
    return NextResponse.json({ message: 'Public endpoint accessed' })
  },
  
  protectedHandler: async (req: NextRequest) => {
    const user = (req as any).user
    return NextResponse.json({ 
      message: 'Protected endpoint accessed',
      user: user ? {
        id: user.id,
        username: user.username,
        roles: user.roles
      } : null
    })
  },
  
  adminOnlyHandler: async (req: NextRequest) => {
    const user = (req as any).user
    if (!user?.roles?.includes('carmen-admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    return NextResponse.json({ message: 'Admin endpoint accessed' })
  }
}

describe('API Protection Tests', () => {
  let tokenHelper: TokenHelper

  beforeAll(() => {
    tokenHelper = new TokenHelper()
  })

  describe('Keycloak Authentication Middleware', () => {
    test('should allow access with valid token', async () => {
      const token = await tokenHelper.getValidToken()
      const request = createMockRequest('GET', '/api/protected', {
        headers: { Authorization: `Bearer ${token}` }
      })

      const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler)
      const response = await protectedEndpoint(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Protected endpoint accessed')
      expect(data.user).toBeDefined()
      expect(data.user.username).toBe('admin')
    })

    test('should reject request without token', async () => {
      const request = createMockRequest('GET', '/api/protected')

      const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler)
      const response = await protectedEndpoint(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    test('should reject request with invalid token', async () => {
      const invalidToken = tokenHelper.createInvalidToken()
      const request = createMockRequest('GET', '/api/protected', {
        headers: { Authorization: `Bearer ${invalidToken}` }
      })

      const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler)
      const response = await protectedEndpoint(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid token')
    })

    test('should reject request with expired token', async () => {
      const expiredToken = await tokenHelper.getExpiredToken()
      const request = createMockRequest('GET', '/api/protected', {
        headers: { Authorization: `Bearer ${expiredToken}` }
      })

      const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler)
      const response = await protectedEndpoint(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Token expired')
    })

    test('should handle malformed Authorization header', async () => {
      const request = createMockRequest('GET', '/api/protected', {
        headers: { Authorization: 'InvalidFormat' }
      })

      const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler)
      const response = await protectedEndpoint(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid authorization header')
    })
  })

  describe('Unified Authentication Middleware', () => {
    test('should work with Keycloak token', async () => {
      const token = await tokenHelper.getValidToken()
      const request = createMockRequest('GET', '/api/unified', {
        headers: { Authorization: `Bearer ${token}` }
      })

      const unifiedEndpoint = withUnifiedAuth(mockHandlers.protectedHandler, {
        authMethods: ['keycloak']
      })
      const response = await unifiedEndpoint(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toBeDefined()
    })

    test('should fallback to JWT when Keycloak is unavailable', async () => {
      // Mock a scenario where Keycloak is unavailable
      const originalKeycloakUrl = process.env.KEYCLOAK_URL
      process.env.KEYCLOAK_URL = 'http://invalid-host:8080'

      const request = createMockRequest('GET', '/api/unified', {
        headers: { Authorization: 'Bearer legacy-jwt-token' }
      })

      const unifiedEndpoint = withUnifiedAuth(mockHandlers.protectedHandler, {
        authMethods: ['keycloak', 'jwt'],
        fallbackToJwt: true
      })

      try {
        const response = await unifiedEndpoint(request)
        // Should attempt JWT validation as fallback
        expect(response.status).toBe(401) // JWT validation will fail for mock token
      } finally {
        // Restore original URL
        process.env.KEYCLOAK_URL = originalKeycloakUrl
      }
    })
  })

  describe('Role-Based Access Control', () => {
    test('should enforce role-based access', async () => {
      // Test with admin user
      const adminToken = await tokenHelper.getValidToken('admin', 'admin123!')
      const adminRequest = createMockRequest('GET', '/api/admin', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })

      const adminEndpoint = withKeycloakAuth(mockHandlers.adminOnlyHandler)
      const adminResponse = await adminEndpoint(adminRequest)
      const adminData = await adminResponse.json()

      expect(adminResponse.status).toBe(200)
      expect(adminData.message).toBe('Admin endpoint accessed')

      // Test with non-admin user
      const staffToken = await tokenHelper.getValidToken('general.staff', 'staff123!')
      const staffRequest = createMockRequest('GET', '/api/admin', {
        headers: { Authorization: `Bearer ${staffToken}` }
      })

      const staffResponse = await adminEndpoint(staffRequest)
      const staffData = await staffResponse.json()

      expect(staffResponse.status).toBe(403)
      expect(staffData.error).toBe('Insufficient permissions')
    })

    test('should validate department-specific access', async () => {
      const procurementToken = await tokenHelper.getValidToken('dept.manager', 'manager123!')
      const request = createMockRequest('GET', '/api/procurement', {
        headers: { Authorization: `Bearer ${procurementToken}` }
      })

      const departmentHandler = async (req: NextRequest) => {
        const user = (req as any).user
        const userGroups = user?.groups || []
        
        if (!userGroups.some((group: string) => group.includes('Procurement'))) {
          return NextResponse.json({ error: 'Department access denied' }, { status: 403 })
        }
        
        return NextResponse.json({ message: 'Department access granted' })
      }

      const departmentEndpoint = withKeycloakAuth(departmentHandler)
      const response = await departmentEndpoint(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Department access granted')
    })
  })

  describe('Performance and Load Testing', () => {
    test('should handle multiple concurrent requests', async () => {
      const token = await tokenHelper.getValidToken()
      const concurrentRequests = 50
      
      const requests = Array(concurrentRequests).fill(null).map(() => {
        const request = createMockRequest('GET', '/api/protected', {
          headers: { Authorization: `Bearer ${token}` }
        })
        return withKeycloakAuth(mockHandlers.protectedHandler)(request)
      })

      const startTime = Date.now()
      const responses = await Promise.allSettled(requests)
      const endTime = Date.now()

      const successfulResponses = responses.filter(r => r.status === 'fulfilled')
      expect(successfulResponses.length).toBe(concurrentRequests)
      
      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(10000) // Should complete within 10 seconds
    })

    test('should have acceptable response times', async () => {
      const token = await tokenHelper.getValidToken()
      const request = createMockRequest('GET', '/api/protected', {
        headers: { Authorization: `Bearer ${token}` }
      })

      const startTime = Date.now()
      const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler)
      const response = await protectedEndpoint(request)
      const endTime = Date.now()

      const responseTime = endTime - startTime
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(1000) // Should respond within 1 second
    })
  })

  describe('Error Handling and Resilience', () => {
    test('should handle Keycloak server unavailability', async () => {
      const originalUrl = process.env.KEYCLOAK_URL
      process.env.KEYCLOAK_URL = 'http://unavailable-server:8080'

      const token = 'some-token'
      const request = createMockRequest('GET', '/api/protected', {
        headers: { Authorization: `Bearer ${token}` }
      })

      const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler, {
        fallbackToJwt: true
      })

      try {
        const response = await protectedEndpoint(request)
        // Should handle the error gracefully
        expect([401, 500, 503]).toContain(response.status)
      } finally {
        process.env.KEYCLOAK_URL = originalUrl
      }
    })

    test('should handle network timeouts', async () => {
      const token = await tokenHelper.getValidToken()
      const request = createMockRequest('GET', '/api/protected', {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Mock a slow verification process
      const slowHandler = withKeycloakAuth(mockHandlers.protectedHandler, {
        timeout: 100 // Very short timeout
      })

      const response = await slowHandler(request)
      
      // Should either succeed quickly or timeout gracefully
      expect([200, 408, 500]).toContain(response.status)
    }, 10000)

    test('should handle malformed JWT tokens', async () => {
      const malformedTokens = [
        'not.a.jwt',
        'too.few.parts',
        'invalid.base64.encoding.here',
        '',
        'null'
      ]

      for (const malformedToken of malformedTokens) {
        const request = createMockRequest('GET', '/api/protected', {
          headers: { Authorization: `Bearer ${malformedToken}` }
        })

        const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler)
        const response = await protectedEndpoint(request)

        expect(response.status).toBe(401)
      }
    })
  })

  describe('Security Headers and CORS', () => {
    test('should include security headers in responses', async () => {
      const token = await tokenHelper.getValidToken()
      const request = createMockRequest('GET', '/api/protected', {
        headers: { Authorization: `Bearer ${token}` }
      })

      const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler)
      const response = await protectedEndpoint(request)

      // Check for security headers
      const headers = response.headers
      expect(headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(headers.get('X-Frame-Options')).toBe('DENY')
      expect(headers.get('X-XSS-Protection')).toBe('1; mode=block')
    })

    test('should handle CORS preflight requests', async () => {
      const request = createMockRequest('OPTIONS', '/api/protected', {
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization'
        }
      })

      const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler)
      const response = await protectedEndpoint(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined()
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
    })
  })

  describe('Audit Logging', () => {
    test('should log successful authentication events', async () => {
      const token = await tokenHelper.getValidToken()
      const request = createMockRequest('GET', '/api/protected', {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Mock audit logger
      const auditLogs: any[] = []
      const mockAuditLogger = {
        log: (event: any) => auditLogs.push(event)
      }

      const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler, {
        auditLogger: mockAuditLogger
      })
      
      const response = await protectedEndpoint(request)

      expect(response.status).toBe(200)
      expect(auditLogs.length).toBeGreaterThan(0)
      expect(auditLogs[0]).toMatchObject({
        event: 'authentication_success',
        userId: expect.any(String),
        timestamp: expect.any(String)
      })
    })

    test('should log failed authentication attempts', async () => {
      const invalidToken = tokenHelper.createInvalidToken()
      const request = createMockRequest('GET', '/api/protected', {
        headers: { Authorization: `Bearer ${invalidToken}` }
      })

      const auditLogs: any[] = []
      const mockAuditLogger = {
        log: (event: any) => auditLogs.push(event)
      }

      const protectedEndpoint = withKeycloakAuth(mockHandlers.protectedHandler, {
        auditLogger: mockAuditLogger
      })
      
      const response = await protectedEndpoint(request)

      expect(response.status).toBe(401)
      expect(auditLogs.length).toBeGreaterThan(0)
      expect(auditLogs[0]).toMatchObject({
        event: 'authentication_failure',
        reason: expect.any(String),
        timestamp: expect.any(String)
      })
    })
  })
})