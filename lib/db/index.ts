/**
 * Database utilities and connections
 *
 * This module provides:
 * - Prisma client singleton with connection pooling
 * - Database connection testing utilities
 * - Proper error handling and graceful shutdown
 */

export { default as prisma } from './prisma'
export { testConnection } from './test-connection'

// Re-export commonly used Prisma types for convenience
export type {
  Prisma,
  PrismaPromise,
} from '@prisma/client'

// Export PrismaClient class from generated client
export { PrismaClient } from '@prisma/client'