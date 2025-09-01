/**
 * Keycloak Configuration Management
 * 
 * Provides centralized configuration for Keycloak integration with
 * environment-based settings and validation.
 * 
 * @author Carmen ERP Team
 */

import { z } from 'zod'

// Keycloak configuration schema
const keycloakConfigSchema = z.object({
  issuer: z.string().url('Invalid Keycloak issuer URL'),
  clientId: z.string().min(1, 'Keycloak client ID is required'),
  clientSecret: z.string().min(1, 'Keycloak client secret is required'),
  realm: z.string().min(1, 'Keycloak realm is required'),
  baseUrl: z.string().url('Invalid Keycloak base URL'),
})

export type KeycloakConfig = z.infer<typeof keycloakConfigSchema>

// Environment variables schema
const keycloakEnvSchema = z.object({
  KEYCLOAK_ISSUER: z.string().optional(),
  KEYCLOAK_CLIENT_ID: z.string().optional(),
  KEYCLOAK_CLIENT_SECRET: z.string().optional(),
  KEYCLOAK_REALM: z.string().optional(),
  KEYCLOAK_BASE_URL: z.string().optional(),
  // Legacy environment variables for backward compatibility
  KEYCLOAK_URL: z.string().optional(),
  KEYCLOAK_REALM_NAME: z.string().optional(),
})

/**
 * Get Keycloak configuration from environment variables
 */
export function getKeycloakConfig(): KeycloakConfig {
  const env = keycloakEnvSchema.parse(process.env)

  // Determine base URL
  const baseUrl = env.KEYCLOAK_BASE_URL || env.KEYCLOAK_URL || 'http://localhost:8080'
  
  // Determine realm
  const realm = env.KEYCLOAK_REALM || env.KEYCLOAK_REALM_NAME || 'carmen'
  
  // Construct issuer URL
  const issuer = env.KEYCLOAK_ISSUER || `${baseUrl}/realms/${realm}`

  const config = {
    issuer,
    clientId: env.KEYCLOAK_CLIENT_ID || 'carmen-web',
    clientSecret: env.KEYCLOAK_CLIENT_SECRET || '',
    realm,
    baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
  }

  // Validate configuration
  try {
    return keycloakConfigSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingFields = error.errors.map(e => e.path.join('.')).join(', ')
      throw new Error(
        `Keycloak configuration validation failed. Missing or invalid fields: ${missingFields}. ` +
        `Please check your environment variables: KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET, KEYCLOAK_REALM, KEYCLOAK_BASE_URL`
      )
    }
    throw error
  }
}

/**
 * Get Keycloak admin configuration for administrative operations
 */
export interface KeycloakAdminConfig extends KeycloakConfig {
  adminClientId: string
  adminClientSecret: string
  adminUsername?: string
  adminPassword?: string
}

export function getKeycloakAdminConfig(): KeycloakAdminConfig {
  const baseConfig = getKeycloakConfig()
  
  const adminConfig = {
    ...baseConfig,
    adminClientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
    adminClientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || '',
    adminUsername: process.env.KEYCLOAK_ADMIN_USERNAME,
    adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD,
  }

  if (!adminConfig.adminClientSecret && !adminConfig.adminUsername) {
    throw new Error(
      'Keycloak admin configuration requires either client credentials (KEYCLOAK_ADMIN_CLIENT_SECRET) ' +
      'or user credentials (KEYCLOAK_ADMIN_USERNAME and KEYCLOAK_ADMIN_PASSWORD)'
    )
  }

  return adminConfig
}

/**
 * Keycloak endpoints utility
 */
export function getKeycloakEndpoints(config: KeycloakConfig = getKeycloakConfig()) {
  return {
    // OIDC endpoints
    authorization: `${config.issuer}/protocol/openid-connect/auth`,
    token: `${config.issuer}/protocol/openid-connect/token`,
    userInfo: `${config.issuer}/protocol/openid-connect/userinfo`,
    logout: `${config.issuer}/protocol/openid-connect/logout`,
    jwks: `${config.issuer}/protocol/openid-connect/certs`,
    wellKnown: `${config.issuer}/.well-known/openid_configuration`,
    
    // Admin API endpoints
    admin: `${config.baseUrl}/admin/realms/${config.realm}`,
    adminUsers: `${config.baseUrl}/admin/realms/${config.realm}/users`,
    adminRoles: `${config.baseUrl}/admin/realms/${config.realm}/roles`,
    adminGroups: `${config.baseUrl}/admin/realms/${config.realm}/groups`,
    adminClients: `${config.baseUrl}/admin/realms/${config.realm}/clients`,
    
    // Account management endpoints
    account: `${config.baseUrl}/realms/${config.realm}/account`,
    accountProfile: `${config.baseUrl}/realms/${config.realm}/account/#/personal-info`,
    accountPassword: `${config.baseUrl}/realms/${config.realm}/account/#/password`,
  }
}

/**
 * Validate Keycloak connection
 */
export async function validateKeycloakConnection(config: KeycloakConfig = getKeycloakConfig()): Promise<{
  success: boolean
  error?: string
  serverInfo?: any
}> {
  try {
    const endpoints = getKeycloakEndpoints(config)
    
    // Check if well-known endpoint is accessible
    const response = await fetch(endpoints.wellKnown, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Keycloak server responded with ${response.status}: ${response.statusText}`
      }
    }

    const wellKnownData = await response.json()
    
    return {
      success: true,
      serverInfo: {
        issuer: wellKnownData.issuer,
        authorizationEndpoint: wellKnownData.authorization_endpoint,
        tokenEndpoint: wellKnownData.token_endpoint,
        userInfoEndpoint: wellKnownData.userinfo_endpoint,
        jwksUri: wellKnownData.jwks_uri,
        supportedScopes: wellKnownData.scopes_supported,
        supportedResponseTypes: wellKnownData.response_types_supported,
        supportedGrantTypes: wellKnownData.grant_types_supported,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown connection error'
    }
  }
}

/**
 * Default configuration values for different environments
 */
export const KEYCLOAK_DEFAULTS = {
  development: {
    baseUrl: 'http://localhost:8080',
    realm: 'carmen',
    clientId: 'carmen-web',
  },
  production: {
    realm: 'carmen',
    clientId: 'carmen-web',
  },
} as const

/**
 * Get environment-specific defaults
 */
export function getKeycloakDefaults() {
  const env = process.env.NODE_ENV || 'development'
  return KEYCLOAK_DEFAULTS[env as keyof typeof KEYCLOAK_DEFAULTS] || KEYCLOAK_DEFAULTS.development
}