/**
 * Comprehensive Database Operation Timeout Handler
 * Provides timeout management, query cancellation, and operation-specific timeouts
 */

import { PrismaClient } from '@prisma/client'

export interface TimeoutConfig {
  // Default timeout for different operation types (ms)
  query: number
  transaction: number
  migration: number
  connection: number
  
  // Batch operation timeouts
  batchInsert: number
  batchUpdate: number
  batchDelete: number
  
  // Complex operation timeouts
  aggregation: number
  fullTextSearch: number
  reporting: number
  
  // Specialized timeouts
  healthCheck: number
  metrics: number
}

export interface OperationContext {
  operationType: keyof TimeoutConfig
  operationName?: string
  tableName?: string
  recordCount?: number
  complexity?: 'simple' | 'medium' | 'complex'
}

export interface TimeoutResult<T> {
  success: boolean
  result?: T
  error?: Error
  timedOut: boolean
  duration: number
  operationContext: OperationContext
}

export class DatabaseTimeoutHandler {
  private readonly config: TimeoutConfig
  private readonly activeOperations = new Map<string, AbortController>()

  constructor(config: Partial<TimeoutConfig> = {}) {
    this.config = {
      // Basic operation timeouts
      query: config.query ?? 30000,           // 30 seconds
      transaction: config.transaction ?? 60000, // 1 minute
      migration: config.migration ?? 300000,  // 5 minutes
      connection: config.connection ?? 10000, // 10 seconds
      
      // Batch operation timeouts
      batchInsert: config.batchInsert ?? 120000,  // 2 minutes
      batchUpdate: config.batchUpdate ?? 180000,  // 3 minutes
      batchDelete: config.batchDelete ?? 180000,  // 3 minutes
      
      // Complex operation timeouts
      aggregation: config.aggregation ?? 90000,     // 1.5 minutes
      fullTextSearch: config.fullTextSearch ?? 45000, // 45 seconds
      reporting: config.reporting ?? 300000,        // 5 minutes
      
      // Specialized timeouts
      healthCheck: config.healthCheck ?? 5000,    // 5 seconds
      metrics: config.metrics ?? 10000,           // 10 seconds
    }
  }

  /**
   * Execute operation with timeout protection
   */
  async executeWithTimeout<T>(
    operation: (signal?: AbortSignal) => Promise<T>,
    context: OperationContext,
    customTimeout?: number
  ): Promise<TimeoutResult<T>> {
    const operationId = this.generateOperationId(context)
    const timeout = customTimeout ?? this.getTimeoutForOperation(context)
    const startTime = Date.now()
    
    // Create abort controller for cancellation
    const abortController = new AbortController()
    this.activeOperations.set(operationId, abortController)
    
    try {
      const result = await Promise.race([
        operation(abortController.signal),
        this.createTimeoutPromise<T>(timeout, context)
      ])
      
      const duration = Date.now() - startTime
      
      return {
        success: true,
        result,
        timedOut: false,
        duration,
        operationContext: context
      }
      
    } catch (error) {
      const duration = Date.now() - startTime
      const isTimeout = error instanceof DatabaseTimeoutError
      
      return {
        success: false,
        error: error as Error,
        timedOut: isTimeout,
        duration,
        operationContext: context
      }
      
    } finally {
      // Clean up
      this.activeOperations.delete(operationId)
      if (!abortController.signal.aborted) {
        abortController.abort()
      }
    }
  }

  /**
   * Execute Prisma query with timeout
   */
  async executeQuery<T>(
    prisma: PrismaClient,
    queryFn: (prisma: PrismaClient) => Promise<T>,
    context: Omit<OperationContext, 'operationType'>,
    customTimeout?: number
  ): Promise<TimeoutResult<T>> {
    const fullContext: OperationContext = {
      ...context,
      operationType: 'query'
    }
    
    return this.executeWithTimeout(
      async (signal) => {
        // Check for cancellation before executing
        if (signal?.aborted) {
          throw new DatabaseTimeoutError('Operation cancelled before execution')
        }
        
        return queryFn(prisma)
      },
      fullContext,
      customTimeout
    )
  }

  /**
   * Execute Prisma transaction with timeout
   */
  async executeTransaction<T>(
    prisma: PrismaClient,
    transactionFn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
    context: Omit<OperationContext, 'operationType'>,
    customTimeout?: number
  ): Promise<TimeoutResult<T>> {
    const fullContext: OperationContext = {
      ...context,
      operationType: 'transaction'
    }

    return this.executeWithTimeout(
      async (signal) => {
        if (signal?.aborted) {
          throw new DatabaseTimeoutError('Transaction cancelled before execution')
        }

        return prisma.$transaction(async (tx) => {
          // Check for cancellation during transaction
          if (signal?.aborted) {
            throw new DatabaseTimeoutError('Transaction cancelled during execution')
          }

          return transactionFn(tx)
        })
      },
      fullContext,
      customTimeout
    )
  }

  /**
   * Execute batch operation with timeout
   */
  async executeBatchOperation<T>(
    operation: () => Promise<T>,
    operationType: 'batchInsert' | 'batchUpdate' | 'batchDelete',
    context: Omit<OperationContext, 'operationType'>,
    customTimeout?: number
  ): Promise<TimeoutResult<T>> {
    const fullContext: OperationContext = {
      ...context,
      operationType
    }
    
    // Adjust timeout based on record count
    const adjustedTimeout = this.adjustTimeoutForRecordCount(
      customTimeout ?? this.config[operationType],
      context.recordCount
    )
    
    return this.executeWithTimeout(operation, fullContext, adjustedTimeout)
  }

  /**
   * Cancel active operation
   */
  cancelOperation(operationId: string): boolean {
    const abortController = this.activeOperations.get(operationId)
    if (abortController) {
      abortController.abort()
      this.activeOperations.delete(operationId)
      return true
    }
    return false
  }

  /**
   * Cancel all active operations
   */
  cancelAllOperations(): number {
    let cancelledCount = 0
    
    for (const [operationId, abortController] of this.activeOperations) {
      abortController.abort()
      cancelledCount++
    }
    
    this.activeOperations.clear()
    return cancelledCount
  }

  /**
   * Get active operation count
   */
  getActiveOperationCount(): number {
    return this.activeOperations.size
  }

  /**
   * Get active operations info
   */
  getActiveOperations(): Array<{
    operationId: string
    startTime: number
    duration: number
  }> {
    const now = Date.now()
    return Array.from(this.activeOperations.keys()).map(operationId => ({
      operationId,
      startTime: now, // We don't track start time per operation currently
      duration: 0
    }))
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise<T>(timeout: number, context: OperationContext): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new DatabaseTimeoutError(
          `Database ${context.operationType} operation timed out after ${timeout}ms` +
          (context.operationName ? ` (${context.operationName})` : '') +
          (context.tableName ? ` on table ${context.tableName}` : '')
        ))
      }, timeout)
    })
  }

  /**
   * Generate unique operation ID
   */
  private generateOperationId(context: OperationContext): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `${context.operationType}-${timestamp}-${random}`
  }

  /**
   * Get timeout for specific operation type and context
   */
  private getTimeoutForOperation(context: OperationContext): number {
    let baseTimeout = this.config[context.operationType]
    
    // Adjust based on complexity
    if (context.complexity) {
      switch (context.complexity) {
        case 'simple':
          baseTimeout *= 0.5
          break
        case 'medium':
          baseTimeout *= 1.0
          break
        case 'complex':
          baseTimeout *= 2.0
          break
      }
    }
    
    // Adjust based on record count
    if (context.recordCount) {
      baseTimeout = this.adjustTimeoutForRecordCount(baseTimeout, context.recordCount)
    }
    
    return Math.round(baseTimeout)
  }

  /**
   * Adjust timeout based on record count
   */
  private adjustTimeoutForRecordCount(baseTimeout: number, recordCount?: number): number {
    if (!recordCount) return baseTimeout
    
    // Scale timeout based on record count
    if (recordCount < 100) {
      return baseTimeout
    } else if (recordCount < 1000) {
      return baseTimeout * 1.5
    } else if (recordCount < 10000) {
      return baseTimeout * 2
    } else {
      return baseTimeout * 3
    }
  }

  /**
   * Update timeout configuration
   */
  updateConfig(newConfig: Partial<TimeoutConfig>): void {
    Object.assign(this.config, newConfig)
  }

  /**
   * Get current timeout configuration
   */
  getConfig(): TimeoutConfig {
    return { ...this.config }
  }
}

/**
 * Database timeout error class
 */
export class DatabaseTimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseTimeoutError'
  }
}

/**
 * Utility functions for common timeout scenarios
 */
export class TimeoutUtils {
  /**
   * Create timeout for simple query
   */
  static simpleQuery(operationName?: string, tableName?: string): OperationContext {
    return {
      operationType: 'query',
      operationName,
      tableName,
      complexity: 'simple'
    }
  }

  /**
   * Create timeout for complex query
   */
  static complexQuery(operationName?: string, tableName?: string): OperationContext {
    return {
      operationType: 'query',
      operationName,
      tableName,
      complexity: 'complex'
    }
  }

  /**
   * Create timeout for batch operation
   */
  static batchOperation(
    type: 'batchInsert' | 'batchUpdate' | 'batchDelete',
    recordCount: number,
    tableName?: string
  ): OperationContext {
    return {
      operationType: type,
      tableName,
      recordCount,
      complexity: recordCount > 1000 ? 'complex' : 'medium'
    }
  }

  /**
   * Create timeout for transaction
   */
  static transaction(operationName?: string, complexity?: 'simple' | 'medium' | 'complex'): OperationContext {
    return {
      operationType: 'transaction',
      operationName,
      complexity: complexity ?? 'medium'
    }
  }

  /**
   * Create timeout for aggregation
   */
  static aggregation(operationName?: string, tableName?: string): OperationContext {
    return {
      operationType: 'aggregation',
      operationName,
      tableName,
      complexity: 'complex'
    }
  }

  /**
   * Create timeout for health check
   */
  static healthCheck(): OperationContext {
    return {
      operationType: 'healthCheck',
      complexity: 'simple'
    }
  }
}

// Global timeout handler instance
export const databaseTimeoutHandler = new DatabaseTimeoutHandler()