/**
 * Mock Prisma Client for Prototype Mode
 *
 * This mock client provides empty responses for database operations
 * to allow the application to run without a database connection.
 *
 * @author Carmen ERP Team
 */

// Mock Prisma Client that returns empty results or mock data
export class MockPrismaClient {
  // Mock all database operations to return empty arrays or null
  [key: string]: any

  constructor() {
    // Create a proxy that returns mock methods for any database table
    return new Proxy(this, {
      get(target, prop) {
        if (typeof prop === 'string') {
          // Return mock database table operations
          return {
            findMany: async () => [],
            findUnique: async () => null,
            findFirst: async () => null,
            create: async (data: any) => ({ id: 'mock-id', ...data.data }),
            update: async (data: any) => ({ id: data.where.id, ...data.data }),
            delete: async (data: any) => ({ id: data.where.id }),
            count: async () => 0,
            aggregate: async () => ({ _count: { _all: 0 } }),
            upsert: async (data: any) => ({ id: 'mock-id', ...data.create || data.update }),
          }
        }
        return target[prop as unknown as keyof MockPrismaClient]
      }
    })
  }

  async $connect() {
    console.log('Mock Prisma Client: Connected (no-op)')
    return Promise.resolve()
  }

  async $disconnect() {
    console.log('Mock Prisma Client: Disconnected (no-op)')
    return Promise.resolve()
  }

  async $transaction(queries: any[]) {
    console.log('Mock Prisma Client: Transaction executed (no-op)')
    return Promise.resolve([])
  }
}

// Export as PrismaClient for compatibility
export const PrismaClient = MockPrismaClient

// Create a default instance
export const prisma = new MockPrismaClient()