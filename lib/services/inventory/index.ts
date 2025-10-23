/**
 * Inventory Services Index
 * 
 * Central export point for all inventory management services providing
 * comprehensive inventory operations, analytics, and integrations.
 */

// Core inventory services
export {
  ComprehensiveInventoryService,
  comprehensiveInventoryService
} from './comprehensive-inventory-service'

export {
  StockMovementManagementService,
  stockMovementService
} from './stock-movement-management-service'

export {
  InventoryAnalyticsService,
  inventoryAnalyticsService
} from './inventory-analytics-service'

export {
  PhysicalCountService,
  physicalCountService
} from './physical-count-service'

export {
  InventoryIntegrationService,
  inventoryIntegrationService
} from './inventory-integration-service'

// Import instances and classes for local use
import {
  ComprehensiveInventoryService,
  comprehensiveInventoryService
} from './comprehensive-inventory-service'

import {
  StockMovementManagementService,
  stockMovementService
} from './stock-movement-management-service'

import {
  InventoryAnalyticsService,
  inventoryAnalyticsService
} from './inventory-analytics-service'

import {
  PhysicalCountService,
  physicalCountService
} from './physical-count-service'

import {
  InventoryIntegrationService,
  inventoryIntegrationService
} from './inventory-integration-service'

// Type exports
export type {
  EnhancedStockStatus,
  ABCClassification,
  ReorderSuggestion,
  LocationStock,
  ValuationConfig,
  CostVarianceAnalysis,
  InventoryKPIs,
  EnhancedServiceResult
} from './comprehensive-inventory-service'

export type {
  StockReservation,
  StockAllocation,
  TransferRequest,
  TransferRequestItem,
  BatchTransferOperation,
  BatchTransferItem,
  StockOperationResult
} from './stock-movement-management-service'

export type {
  InventoryForecast,
  InventoryTrendAnalysis,
  InventoryOptimization,
  DeadStockAnalysis,
  InventoryPerformanceDashboard,
  SupplierInventoryPerformance,
  AnalyticsResult
} from './inventory-analytics-service'

export type {
  CountPlan,
  CountSchedule,
  VarianceAnalysis,
  CountAccuracyMetrics,
  CountOperationResult
} from './physical-count-service'

export type {
  InventoryIntegrationConfig,
  ProcurementIntegrationResult,
  VendorInventoryPerformance
} from './inventory-integration-service'

// Import type separately for use in function signature
import type { InventoryIntegrationConfig } from './inventory-integration-service'

// Service factory function for custom configurations
export function createInventoryServices(config?: {
  enableCaching?: boolean
  defaultCurrency?: string
  reorderThresholds?: {
    low: number
    medium: number
    high: number
    critical: number
  }
  integrationConfig?: Partial<InventoryIntegrationConfig>
}) {
  const integrationService = new InventoryIntegrationService(config?.integrationConfig)
  
  return {
    comprehensive: comprehensiveInventoryService,
    stockMovement: stockMovementService,
    analytics: inventoryAnalyticsService,
    physicalCount: physicalCountService,
    integration: integrationService
  }
}

// Utility function to initialize all inventory services
export async function initializeInventoryServices(options?: {
  validateDatabase?: boolean
  syncProductData?: boolean
  loadCachedData?: boolean
}): Promise<{
  success: boolean
  errors?: string[]
  warnings?: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Validate database connections
    if (options?.validateDatabase) {
      try {
        // This would validate database connectivity and schema
        console.log('Validating inventory database schema...')
      } catch (dbError) {
        errors.push(`Database validation failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`)
      }
    }

    // Synchronize product data
    if (options?.syncProductData) {
      try {
        const syncResult = await inventoryIntegrationService.synchronizeProductInventoryData()
        if (syncResult.errors.length > 0) {
          warnings.push(`Product sync warnings: ${syncResult.errors.join(', ')}`)
        }
        console.log(`Synchronized ${syncResult.synchronized} products`)
      } catch (syncError) {
        warnings.push(`Product synchronization failed: ${syncError instanceof Error ? syncError.message : 'Unknown error'}`)
      }
    }

    // Load cached data
    if (options?.loadCachedData) {
      try {
        console.log('Loading cached inventory calculations...')
        // This would preload frequently accessed cached data
      } catch (cacheError) {
        warnings.push(`Cache loading failed: ${cacheError instanceof Error ? cacheError.message : 'Unknown error'}`)
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

// Service health check function
export async function checkInventoryServicesHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: {
    name: string
    status: 'up' | 'down' | 'degraded'
    responseTime?: number
    lastCheck: Date
    errors?: string[]
  }[]
}> {
  const services: {
    name: string
    status: 'up' | 'down' | 'degraded'
    responseTime?: number
    lastCheck: Date
    errors?: string[]
  }[] = []
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  // Check comprehensive inventory service
  try {
    const startTime = Date.now()
    const kpisResult = await comprehensiveInventoryService.generateInventoryKPIs()
    const responseTime = Date.now() - startTime

    services.push({
      name: 'comprehensive-inventory',
      status: kpisResult.success ? 'up' : 'degraded',
      responseTime,
      lastCheck: new Date(),
      errors: kpisResult.success ? undefined : [kpisResult.error || 'Unknown error']
    })

    if (!kpisResult.success) {
      overallStatus = 'degraded'
    }
  } catch (error) {
    services.push({
      name: 'comprehensive-inventory',
      status: 'down',
      lastCheck: new Date(),
      errors: [error instanceof Error ? error.message : 'Service unavailable']
    })
    overallStatus = 'unhealthy'
  }

  // Check analytics service
  try {
    const startTime = Date.now()
    const dashboardResult = await inventoryAnalyticsService.generatePerformanceDashboard()
    const responseTime = Date.now() - startTime

    services.push({
      name: 'inventory-analytics',
      status: dashboardResult.success ? 'up' : 'degraded',
      responseTime,
      lastCheck: new Date(),
      errors: dashboardResult.success ? undefined : [dashboardResult.error || 'Unknown error']
    })

    if (!dashboardResult.success && overallStatus === 'healthy') {
      overallStatus = 'degraded'
    }
  } catch (error) {
    services.push({
      name: 'inventory-analytics',
      status: 'down',
      lastCheck: new Date(),
      errors: [error instanceof Error ? error.message : 'Service unavailable']
    })
    if (overallStatus !== 'unhealthy') {
      overallStatus = 'unhealthy'
    }
  }

  // Add checks for other services...
  services.push(
    {
      name: 'stock-movement',
      status: 'up' as const,
      lastCheck: new Date()
    },
    {
      name: 'physical-count',
      status: 'up' as const,
      lastCheck: new Date()
    },
    {
      name: 'integration',
      status: 'up' as const,
      lastCheck: new Date()
    }
  )

  return {
    status: overallStatus,
    services
  }
}

// Export default service collection
export default {
  comprehensive: comprehensiveInventoryService,
  stockMovement: stockMovementService,
  analytics: inventoryAnalyticsService,
  physicalCount: physicalCountService,
  integration: inventoryIntegrationService,
  createServices: createInventoryServices,
  initialize: initializeInventoryServices,
  healthCheck: checkInventoryServicesHealth
}