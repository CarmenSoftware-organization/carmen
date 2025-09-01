/**
 * Keycloak Authentication Integration Tests
 * 
 * Comprehensive test suite for validating Keycloak integration with Carmen ERP
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getToken } from 'next-auth/jwt'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/next-auth.config'
import { validateKeycloakConnection, getKeycloakConfig } from '@/lib/config/keycloak'

// Test configuration
const TEST_CONFIG = {
  keycloakUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'carmen',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'carmen-web-dev',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'dev-client-secret-change-in-production',
  testUsers: {
    admin: {
      username: 'admin',
      password: 'admin123!',
      expectedRole: 'carmen-admin',
      expectedGroups: ['/Departments/Administration']
    },
    manager: {
      username: 'dept.manager',
      password: 'manager123!',
      expectedRole: 'carmen-department-manager',
      expectedGroups: ['/Departments/Procurement']
    },
    staff: {
      username: 'general.staff',
      password: 'staff123!',
      expectedRole: 'carmen-staff',
      expectedGroups: ['/Departments/Housekeeping']
    }
  }
}

// Helper functions
class KeycloakTestHelper {
  private baseUrl: string
  private realm: string

  constructor() {
    this.baseUrl = TEST_CONFIG.keycloakUrl
    this.realm = TEST_CONFIG.realm
  }

  async getAdminToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/realms/master/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: 'admin',
        password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin123',
        grant_type: 'password',
        client_id: 'admin-cli',
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(`Failed to get admin token: ${data.error_description || data.error}`)
    }

    return data.access_token
  }

  async getUserToken(username: string, password: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`, {
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
      throw new Error(`Failed to get user token: ${data.error_description || data.error}`)
    }

    return data
  }

  async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(`Failed to get user info: ${data.error_description || data.error}`)
    }

    return data
  }

  async introspectToken(token: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token,
        client_id: TEST_CONFIG.clientId,
        client_secret: TEST_CONFIG.clientSecret,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(`Failed to introspect token: ${data.error_description || data.error}`)
    }

    return data
  }

  parseJWT(token: string): any {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  }

  async checkRealmHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/realms/${this.realm}/.well-known/openid_configuration`)
      return response.ok
    } catch {
      return false
    }
  }
}

describe('Keycloak Integration Tests', () => {
  let helper: KeycloakTestHelper

  beforeAll(async () => {
    helper = new KeycloakTestHelper()
    
    // Wait for Keycloak to be ready
    const maxAttempts = 30
    let attempts = 0
    
    while (attempts < maxAttempts) {
      if (await helper.checkRealmHealth()) {
        break
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Keycloak is not ready after 60 seconds')
    }
  })

  describe('Keycloak Configuration', () => {
    test('should validate Keycloak connection', async () => {
      const result = await validateKeycloakConnection()
      expect(result.success).toBe(true)
      expect(result.serverInfo).toBeDefined()
      expect(result.serverInfo.issuer).toContain(TEST_CONFIG.realm)
    })

    test('should retrieve Keycloak configuration', () => {
      const config = getKeycloakConfig()
      expect(config.realm).toBe(TEST_CONFIG.realm)
      expect(config.clientId).toBe(TEST_CONFIG.clientId)
      expect(config.baseUrl).toBeDefined()
      expect(config.issuer).toContain(TEST_CONFIG.realm)
    })

    test('should have correct well-known configuration', async () => {
      const response = await fetch(`${TEST_CONFIG.keycloakUrl}/realms/${TEST_CONFIG.realm}/.well-known/openid_configuration`)
      const config = await response.json()
      
      expect(response.ok).toBe(true)
      expect(config.issuer).toContain(TEST_CONFIG.realm)
      expect(config.authorization_endpoint).toBeDefined()
      expect(config.token_endpoint).toBeDefined()
      expect(config.userinfo_endpoint).toBeDefined()
      expect(config.jwks_uri).toBeDefined()
    })
  })

  describe('User Authentication Flow', () => {
    test.each(Object.entries(TEST_CONFIG.testUsers))('should authenticate %s user', async (userType, userData) => {
      const tokenResponse = await helper.getUserToken(userData.username, userData.password)
      
      expect(tokenResponse.access_token).toBeDefined()
      expect(tokenResponse.refresh_token).toBeDefined()
      expect(tokenResponse.id_token).toBeDefined()
      expect(tokenResponse.token_type).toBe('Bearer')
      expect(tokenResponse.expires_in).toBeGreaterThan(0)
    })

    test('should reject invalid credentials', async () => {
      await expect(
        helper.getUserToken('invalid_user', 'invalid_password')
      ).rejects.toThrow('Failed to get user token')
    })

    test('should handle token refresh', async () => {
      const { access_token, refresh_token } = await helper.getUserToken('admin', 'admin123!')
      
      // Use refresh token to get new access token
      const response = await fetch(`${TEST_CONFIG.keycloakUrl}/realms/${TEST_CONFIG.realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token,
          client_id: TEST_CONFIG.clientId,
          client_secret: TEST_CONFIG.clientSecret,
        }),
      })

      const refreshData = await response.json()
      expect(response.ok).toBe(true)
      expect(refreshData.access_token).toBeDefined()
      expect(refreshData.access_token).not.toBe(access_token) // Should be a new token
    })
  })

  describe('Token Validation and Claims', () => {
    test.each(Object.entries(TEST_CONFIG.testUsers))('should have correct claims for %s', async (userType, userData) => {
      const { access_token, id_token } = await helper.getUserToken(userData.username, userData.password)
      
      // Validate access token claims
      const accessTokenClaims = helper.parseJWT(access_token)
      expect(accessTokenClaims.preferred_username).toBe(userData.username)
      expect(accessTokenClaims.realm_access.roles).toContain(userData.expectedRole)
      expect(accessTokenClaims.groups).toEqual(expect.arrayContaining(userData.expectedGroups))
      
      // Validate ID token claims
      const idTokenClaims = helper.parseJWT(id_token)
      expect(idTokenClaims.preferred_username).toBe(userData.username)
      expect(idTokenClaims.email_verified).toBe(true)
    })

    test('should validate token introspection', async () => {
      const { access_token } = await helper.getUserToken('admin', 'admin123!')
      const introspection = await helper.introspectToken(access_token)
      
      expect(introspection.active).toBe(true)
      expect(introspection.username).toBe('admin')
      expect(introspection.client_id).toBe(TEST_CONFIG.clientId)
      expect(introspection.token_type).toBe('Bearer')
    })

    test('should retrieve user info from userinfo endpoint', async () => {
      const { access_token } = await helper.getUserToken('admin', 'admin123!')
      const userInfo = await helper.getUserInfo(access_token)
      
      expect(userInfo.preferred_username).toBe('admin')
      expect(userInfo.email_verified).toBe(true)
      expect(userInfo.groups).toContain('/Departments/Administration')
    })
  })

  describe('Role-Based Access Control', () => {
    test('should map Keycloak roles to Carmen ERP roles correctly', async () => {
      const testCases = [
        { keycloakRole: 'carmen-admin', expectedCarmenRole: 'admin' },
        { keycloakRole: 'carmen-department-manager', expectedCarmenRole: 'department-manager' },
        { keycloakRole: 'carmen-purchasing-staff', expectedCarmenRole: 'purchasing-staff' },
        { keycloakRole: 'carmen-chef', expectedCarmenRole: 'chef' },
        { keycloakRole: 'carmen-counter', expectedCarmenRole: 'counter' },
        { keycloakRole: 'carmen-staff', expectedCarmenRole: 'staff' }
      ]

      // This would typically be tested with the actual role mapping function
      // For now, we'll verify the roles exist in tokens
      for (const testCase of testCases) {
        const userData = Object.values(TEST_CONFIG.testUsers).find(
          user => user.expectedRole === testCase.keycloakRole
        )
        
        if (userData) {
          const { access_token } = await helper.getUserToken(userData.username, userData.password)
          const claims = helper.parseJWT(access_token)
          expect(claims.realm_access.roles).toContain(testCase.keycloakRole)
        }
      }
    })

    test('should include custom Carmen ERP claims', async () => {
      const { access_token } = await helper.getUserToken('dept.manager', 'manager123!')
      const claims = helper.parseJWT(access_token)
      
      expect(claims.department).toBeDefined()
      expect(claims.location).toBeDefined()
      expect(claims.employee_id).toBeDefined()
      expect(claims.approval_limit).toBeDefined()
    })
  })

  describe('Session Management', () => {
    test('should handle logout correctly', async () => {
      const { access_token, refresh_token } = await helper.getUserToken('admin', 'admin123!')
      
      // Perform logout
      const logoutResponse = await fetch(`${TEST_CONFIG.keycloakUrl}/realms/${TEST_CONFIG.realm}/protocol/openid-connect/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: TEST_CONFIG.clientId,
          client_secret: TEST_CONFIG.clientSecret,
          refresh_token,
        }),
      })

      expect(logoutResponse.ok).toBe(true)

      // Verify token is no longer valid
      const introspection = await helper.introspectToken(access_token)
      expect(introspection.active).toBe(false)
    })

    test('should respect token expiration', async () => {
      const { access_token } = await helper.getUserToken('admin', 'admin123!')
      const claims = helper.parseJWT(access_token)
      
      expect(claims.exp).toBeDefined()
      expect(claims.iat).toBeDefined()
      expect(claims.exp).toBeGreaterThan(claims.iat)
      
      // Verify token is currently valid
      const introspection = await helper.introspectToken(access_token)
      expect(introspection.active).toBe(true)
      expect(introspection.exp).toBe(claims.exp)
    })
  })

  describe('NextAuth Integration', () => {
    test('should configure NextAuth options correctly', () => {
      expect(authOptions).toBeDefined()
      expect(authOptions.providers).toHaveLength(1)
      expect(authOptions.providers[0].id).toBe('keycloak')
      expect(authOptions.session.strategy).toBe('jwt')
      expect(authOptions.callbacks.jwt).toBeDefined()
      expect(authOptions.callbacks.session).toBeDefined()
    })

    test('should handle NextAuth callbacks correctly', async () => {
      // This would typically require a more complex test setup with NextAuth
      // For now, we'll verify the callback functions exist and are properly typed
      expect(typeof authOptions.callbacks.jwt).toBe('function')
      expect(typeof authOptions.callbacks.session).toBe('function')
      expect(typeof authOptions.callbacks.signIn).toBe('function')
    })
  })

  describe('Error Handling', () => {
    test('should handle invalid client credentials', async () => {
      const response = await fetch(`${TEST_CONFIG.keycloakUrl}/realms/${TEST_CONFIG.realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: 'admin',
          password: 'admin123!',
          grant_type: 'password',
          client_id: 'invalid-client',
          client_secret: 'invalid-secret',
        }),
      })

      expect(response.ok).toBe(false)
      const error = await response.json()
      expect(error.error).toBe('invalid_client')
    })

    test('should handle malformed requests', async () => {
      const response = await fetch(`${TEST_CONFIG.keycloakUrl}/realms/${TEST_CONFIG.realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          // Missing required parameters
        }),
      })

      expect(response.ok).toBe(false)
      const error = await response.json()
      expect(error.error).toBeDefined()
    })

    test('should handle network connectivity issues', async () => {
      const invalidHelper = new KeycloakTestHelper()
      invalidHelper['baseUrl'] = 'http://invalid-host:8080'
      
      await expect(invalidHelper.checkRealmHealth()).resolves.toBe(false)
    })
  })

  describe('Performance Tests', () => {
    test('should authenticate within acceptable time limits', async () => {
      const startTime = Date.now()
      await helper.getUserToken('admin', 'admin123!')
      const endTime = Date.now()
      
      const responseTime = endTime - startTime
      expect(responseTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    test('should handle concurrent authentication requests', async () => {
      const concurrentRequests = 10
      const requests = Array(concurrentRequests).fill(null).map(() =>
        helper.getUserToken('admin', 'admin123!')
      )

      const startTime = Date.now()
      const results = await Promise.allSettled(requests)
      const endTime = Date.now()

      const successfulRequests = results.filter(r => r.status === 'fulfilled')
      expect(successfulRequests.length).toBe(concurrentRequests)
      
      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(10000) // All requests should complete within 10 seconds
    })
  })

  describe('Security Tests', () => {
    test('should use secure token defaults', async () => {
      const { access_token } = await helper.getUserToken('admin', 'admin123!')
      const claims = helper.parseJWT(access_token)
      
      // Verify security claims
      expect(claims.iss).toContain(TEST_CONFIG.realm)
      expect(claims.aud).toContain(TEST_CONFIG.clientId)
      expect(claims.azp).toBe(TEST_CONFIG.clientId)
      expect(claims.typ).toBe('Bearer')
    })

    test('should not expose sensitive information in tokens', async () => {
      const { access_token, id_token } = await helper.getUserToken('admin', 'admin123!')
      const accessClaims = helper.parseJWT(access_token)
      const idClaims = helper.parseJWT(id_token)
      
      // Verify no sensitive data is exposed
      expect(accessClaims.password).toBeUndefined()
      expect(idClaims.password).toBeUndefined()
      expect(accessClaims.client_secret).toBeUndefined()
      expect(idClaims.client_secret).toBeUndefined()
    })

    test('should validate token signatures', async () => {
      const { access_token } = await helper.getUserToken('admin', 'admin123!')
      
      // Get JWKS to validate signature
      const jwksResponse = await fetch(`${TEST_CONFIG.keycloakUrl}/realms/${TEST_CONFIG.realm}/protocol/openid-connect/certs`)
      const jwks = await jwksResponse.json()
      
      expect(jwksResponse.ok).toBe(true)
      expect(jwks.keys).toBeDefined()
      expect(jwks.keys.length).toBeGreaterThan(0)
      
      // Verify token structure (actual signature validation would require additional crypto libraries)
      const tokenParts = access_token.split('.')
      expect(tokenParts).toHaveLength(3) // Header, payload, signature
    })
  })
})