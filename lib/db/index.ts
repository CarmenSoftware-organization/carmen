/**
 * Database utilities and connections
 *
 * This module provides:
 * - Mock Prisma client using JSON storage (no database required)
 * - JSON-based storage layer for prototype/development
 * - Prisma-compatible interface
 */

export { default as prisma, prisma as default } from './prisma'
export { jsonDb } from './json-storage'

// Re-export from mock Prisma client
export type { PrismaClient } from './prisma'

// Mock test connection function
export async function testConnection() {
  console.log('📦 Using JSON-based storage (no database connection test needed)')
  return { success: true, message: 'JSON storage ready' }
}