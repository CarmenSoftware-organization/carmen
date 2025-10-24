/**
 * Mock Prisma Client for Development/Prototype
 *
 * Provides a Prisma-compatible interface using JSON storage
 * instead of actual database connections.
 */

import jsonDb from './json-storage'
import { mockUsers, mockVendors, mockInventoryItems, mockProducts } from '@/lib/mock-data'

// Mock Prisma Client
export class MockPrismaClient {
  // Initialize collections with mock data
  constructor() {
    // Initialize with mock data if collections don't exist
    if (!jsonDb.exists('users')) {
      jsonDb.initialize('users', mockUsers)
    }
    if (!jsonDb.exists('vendors')) {
      jsonDb.initialize('vendors', mockVendors)
    }
    if (!jsonDb.exists('inventory')) {
      jsonDb.initialize('inventory', mockInventoryItems)
    }
    if (!jsonDb.exists('products')) {
      jsonDb.initialize('products', mockProducts)
    }
  }

  // Mock $connect method
  async $connect(): Promise<void> {
    console.log('📦 Using JSON-based storage (no database connection required)')
    return Promise.resolve()
  }

  // Mock $disconnect method
  async $disconnect(): Promise<void> {
    jsonDb.clearCache()
    return Promise.resolve()
  }

  // Mock $queryRaw method
  async $queryRaw(query: any): Promise<any[]> {
    console.log('Mock query executed:', query)
    return Promise.resolve([{ health_check: 1 }])
  }

  // Mock $executeRaw method
  async $executeRaw(query: any): Promise<number> {
    console.log('Mock execute:', query)
    return Promise.resolve(1)
  }

  // Mock $transaction method
  async $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return fn(this)
  }

  // Mock $use middleware
  $use(middleware: any): void {
    // No-op for mock
  }

  // Mock $on event handler
  $on(event: string, handler: any): void {
    // No-op for mock
  }

  // Mock $extends method
  $extends(extension: any): any {
    return this
  }
}

// Create singleton instance
const mockPrisma = new MockPrismaClient()

// Export with Prisma-compatible interface
export const prisma = mockPrisma

// Mock ReliablePrismaClient for compatibility
export class ReliablePrismaClient {
  private client: MockPrismaClient

  constructor(client: MockPrismaClient) {
    this.client = client
  }

  async query<T>(queryFn: (client: any) => Promise<T>, options?: any): Promise<T> {
    return queryFn(this.client)
  }

  async transaction<T>(transactionFn: (tx: any) => Promise<T>, options?: any): Promise<T> {
    return this.client.$transaction(transactionFn)
  }

  get raw(): MockPrismaClient {
    return this.client
  }

  async healthCheck(): Promise<boolean> {
    return true
  }

  getMetrics() {
    return {
      connectionPool: null,
      circuitBreaker: null,
      activeOperations: 0,
      config: {}
    }
  }
}

export const reliablePrisma = new ReliablePrismaClient(mockPrisma)
export default reliablePrisma

// Mock exports for compatibility
export const databaseCircuitBreaker = {
  execute: async <T>(fn: () => Promise<T>, name?: string) => fn(),
  reset: () => {},
  getMetrics: () => ({})
}

export const getDatabaseMonitor = () => null

export const databaseTimeoutHandler = {
  executeQuery: async (client: any, queryFn: any, context?: any, timeout?: number) => {
    try {
      const result = await queryFn(client)
      return { success: true, result }
    } catch (error) {
      return { success: false, error }
    }
  },
  executeTransaction: async (client: any, txFn: any, context?: any, timeout?: number) => {
    try {
      const result = await client.$transaction(txFn)
      return { success: true, result }
    } catch (error) {
      return { success: false, error }
    }
  },
  cancelAllOperations: () => 0,
  getActiveOperationCount: () => 0
}

export const TimeoutUtils = {
  healthCheck: () => ({ operationName: 'health-check' }),
  quick: () => ({ operationName: 'quick' }),
  medium: () => ({ operationName: 'medium' }),
  slow: () => ({ operationName: 'slow' })
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

// Type exports for compatibility
export type PrismaClient = MockPrismaClient
export type CircuitBreakerMetrics = any
export type ConnectionPoolMetrics = any
export type HealthCheckResult = any
export type TimeoutResult<T> = {
  success: boolean
  result?: T
  error?: Error
}
export type OperationContext = any
