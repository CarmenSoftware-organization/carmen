/**
 * Auth module exports
 * 
 * Central export file for authentication-related utilities
 */

// NextAuth configuration
export { authOptions, default } from './next-auth.config'

// API protection utilities
export * from './api-protection'

// Keycloak middleware
export * from './keycloak-middleware'