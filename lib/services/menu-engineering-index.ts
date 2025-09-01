/**
 * Menu Engineering Module Index
 * 
 * Central export point for all menu engineering services, types, and utilities.
 * This module provides Phase 13.2: Service Layer Implementation for Carmen ERP.
 */

// ====== SERVICE EXPORTS ======

// Core Services
export {
  POSIntegrationService,
  createPOSIntegrationService,
  type ImportSalesDataInput,
  type ImportSalesDataResult,
  type ValidateSalesDataInput,
  type ValidateSalesDataResult,
  type MapPOSItemsInput,
  type MapPOSItemsResult,
  type SyncDailySalesInput,
  type SyncDailySalesResult
} from './pos-integration-service';

export {
  MenuEngineeringService,
  createMenuEngineeringService,
  type AnalyzeMenuPerformanceInput,
  type ClassifyMenuItemsInput,
  type GenerateRecommendationsInput,
  type CalculatePopularityScoreInput,
  type CalculateProfitabilityScoreInput
} from './menu-engineering-service';

export {
  EnhancedRecipeCostingService,
  createEnhancedRecipeCostingService,
  type CalculateRealTimeCostInput,
  type CalculateRealTimeCostResult,
  type UpdateCostsFromInventoryInput,
  type UpdateCostsResult,
  type TrackCostVariationsInput,
  type CostVariationResult,
  type CostAlertInput
} from './enhanced-recipe-costing-service';

// Integration Service
export {
  MenuEngineeringIntegrationService,
  createMenuEngineeringIntegrationService,
  type GenerateIntegratedAnalysisInput,
  type GenerateMetricsInput,
  type CreateOptimizationPlanInput
} from './menu-engineering-integration';

// ====== TYPE EXPORTS ======

// Core Data Types
export type {
  // POS Integration Types
  SalesTransaction,
  POSItemMapping,
  SalesDataImportBatch,
  ValidationError,
  DailySyncStatus,
  
  // Menu Engineering Types
  MenuClassification,
  AnalysisPeriod,
  MenuItemPerformance,
  MenuAnalysisResult,
  RecommendationType,
  MenuRecommendation,
  RecommendationSet,
  AnalysisInsight,
  MenuEngineeeringConfig,
  
  // Recipe Costing Types
  RealTimeCostCalculation,
  IngredientCostSnapshot,
  LaborCostSnapshot,
  OverheadCostSnapshot,
  CostVariance,
  CostThreshold,
  CostAlert,
  RecipeCostBreakdown,
  InventoryChangeEvent,
  
  // Integrated Types
  IntegratedMenuAnalysis,
  MenuEngineeringMetrics,
  MenuOptimizationPlan,
  MenuItemLifecycle,
  CompetitiveAnalysis,
  SeasonalAnalysis,
  MenuEngineeringModuleConfig,
  MenuEngineeringServiceStatus,
  DatePeriod
} from './menu-engineering-types';

// ====== VALIDATION SCHEMAS ======

export {
  SalesTransactionSchema,
  POSItemMappingSchema,
  SalesDataImportBatchSchema,
  MenuAnalysisInputSchema,
  PopularityCalculationInputSchema,
  ProfitabilityCalculationInputSchema,
  RealTimeCostCalculationSchema,
  CostThresholdSchema,
  InventoryChangeEventSchema,
  MenuEngineeringModuleConfigSchema
} from './pos-integration-service';

export {
  MenuAnalysisInputSchema as AnalysisInputSchema,
  PopularityCalculationInputSchema as PopularityInputSchema,
  ProfitabilityCalculationInputSchema as ProfitabilityInputSchema
} from './menu-engineering-service';

export {
  RealTimeCostCalculationSchema as CostCalculationSchema,
  CostThresholdSchema as ThresholdSchema,
  InventoryChangeEventSchema as InventoryEventSchema
} from './enhanced-recipe-costing-service';

export {
  MenuEngineeringModuleConfigSchema as ModuleConfigSchema
} from './menu-engineering-integration';

// ====== UTILITY FUNCTIONS ======

/**
 * Create a complete menu engineering system with all services
 */
export function createMenuEngineeringSystem(
  config?: Partial<MenuEngineeringModuleConfig>
) {
  const integrationService = createMenuEngineeringIntegrationService(config);
  
  return {
    // Main integration service
    integration: integrationService,
    
    // Individual services (accessible if needed)
    services: {
      pos: createPOSIntegrationService(integrationService['cache']),
      analytics: createMenuEngineeringService(integrationService['cache']),
      costing: createEnhancedRecipeCostingService(integrationService['cache'])
    },
    
    // Convenience methods
    async generateFullAnalysis(periodStart: Date, periodEnd: Date, locationIds?: string[]) {
      return await integrationService.generateIntegratedAnalysis({
        periodStart,
        periodEnd,
        locationIds,
        includeCompetitive: true,
        includeSeasonal: true,
        includeForecasting: true
      });
    },
    
    async getDashboardMetrics(
      currentPeriod: { start: Date; end: Date },
      comparisonPeriod?: { start: Date; end: Date },
      locationIds?: string[]
    ) {
      return await integrationService.generateMetrics({
        currentPeriod,
        comparisonPeriod,
        locationIds,
        includeAlerts: true,
        includeTrends: true
      });
    },
    
    async getServiceHealth() {
      return await integrationService.getServiceStatus();
    },
    
    async shutdown() {
      return await integrationService.shutdown();
    }
  };
}

/**
 * Default configuration for menu engineering module
 */
export const defaultMenuEngineeringConfig: MenuEngineeringModuleConfig = {
  analysis: {
    defaultPeriodDays: 30,
    minimumSampleSize: 10,
    confidenceThreshold: 0.8,
    updateFrequency: 'daily'
  },
  classification: {
    popularityThreshold: 70,
    profitabilityThreshold: 70,
    volatilityThreshold: 0.2,
    dataQualityThreshold: 0.7
  },
  alerting: {
    enabled: true,
    costVarianceThreshold: 10,
    profitMarginThreshold: 20,
    notificationChannels: ['email', 'dashboard']
  },
  integration: {
    posSystemId: 'default_pos',
    inventorySystemId: 'default_inventory',
    syncFrequency: 24,
    dataRetentionDays: 365,
    cacheSettings: {
      ttl: 300,
      maxSize: 100
    }
  },
  reporting: {
    defaultCurrency: 'USD',
    decimalPlaces: 2,
    chartColors: {
      stars: '#22c55e',      // green
      plowhorses: '#f59e0b', // amber
      puzzles: '#3b82f6',    // blue
      dogs: '#ef4444'        // red
    },
    exportFormats: ['pdf', 'excel', 'csv']
  }
};

/**
 * Boston Matrix classification helper
 */
export const bostonMatrix = {
  classify(popularityScore: number, profitabilityScore: number, thresholds = { popularity: 70, profitability: 70 }): MenuClassification {
    const isHighPopularity = popularityScore >= thresholds.popularity;
    const isHighProfitability = profitabilityScore >= thresholds.profitability;
    
    if (isHighPopularity && isHighProfitability) return 'STAR';
    if (isHighPopularity && !isHighProfitability) return 'PLOWHORSES';
    if (!isHighPopularity && isHighProfitability) return 'PUZZLE';
    return 'DOG';
  },
  
  getClassificationColor(classification: MenuClassification): string {
    const colors = defaultMenuEngineeringConfig.reporting.chartColors;
    switch (classification) {
      case 'STAR': return colors.stars;
      case 'PLOWHORSES': return colors.plowhorses;
      case 'PUZZLE': return colors.puzzles;
      case 'DOG': return colors.dogs;
      default: return '#6b7280'; // gray
    }
  },
  
  getClassificationDescription(classification: MenuClassification): string {
    switch (classification) {
      case 'STAR':
        return 'High popularity, high profitability - promote and maintain';
      case 'PLOWHORSES':
        return 'High popularity, low profitability - improve margins';
      case 'PUZZLE':
        return 'Low popularity, high profitability - increase marketing';
      case 'DOG':
        return 'Low popularity, low profitability - consider removal';
      default:
        return 'Unknown classification';
    }
  }
};

/**
 * Validation helper functions
 */
export const validation = {
  /**
   * Validate sales transaction data
   */
  validateSalesTransaction(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      SalesTransactionSchema.parse(data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  },
  
  /**
   * Validate cost threshold configuration
   */
  validateCostThreshold(data: any): { valid: boolean; errors: string[] } {
    try {
      CostThresholdSchema.parse(data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  },
  
  /**
   * Validate module configuration
   */
  validateModuleConfig(data: any): { valid: boolean; errors: string[]; config?: MenuEngineeringModuleConfig } {
    try {
      const config = MenuEngineeringModuleConfigSchema.parse(data);
      return { valid: true, errors: [], config };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }
};

/**
 * Performance monitoring helpers
 */
export const monitoring = {
  /**
   * Create performance metrics collector
   */
  createMetricsCollector() {
    const metrics = {
      operationCounts: new Map<string, number>(),
      operationTimes: new Map<string, number[]>(),
      errorCounts: new Map<string, number>(),
      cacheHitRates: new Map<string, number>()
    };
    
    return {
      recordOperation(operation: string, duration: number, success: boolean) {
        // Update operation counts
        metrics.operationCounts.set(operation, (metrics.operationCounts.get(operation) || 0) + 1);
        
        // Update timing
        if (!metrics.operationTimes.has(operation)) {
          metrics.operationTimes.set(operation, []);
        }
        metrics.operationTimes.get(operation)!.push(duration);
        
        // Update error counts
        if (!success) {
          metrics.errorCounts.set(operation, (metrics.errorCounts.get(operation) || 0) + 1);
        }
      },
      
      recordCacheHit(operation: string, hit: boolean) {
        const key = `${operation}_cache`;
        if (!metrics.cacheHitRates.has(key)) {
          metrics.cacheHitRates.set(key, 0);
        }
        
        // Simple hit rate calculation (would be more sophisticated in production)
        const currentRate = metrics.cacheHitRates.get(key)!;
        const newRate = hit ? currentRate + 1 : currentRate;
        metrics.cacheHitRates.set(key, newRate);
      },
      
      getMetrics() {
        return {
          operations: Object.fromEntries(metrics.operationCounts),
          averageResponseTimes: Object.fromEntries(
            Array.from(metrics.operationTimes.entries()).map(([op, times]) => [
              op,
              times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0
            ])
          ),
          errorRates: Object.fromEntries(
            Array.from(metrics.errorCounts.entries()).map(([op, errors]) => [
              op,
              (metrics.operationCounts.get(op) || 0) > 0 
                ? (errors / (metrics.operationCounts.get(op) || 1)) * 100 
                : 0
            ])
          ),
          cacheHitRates: Object.fromEntries(metrics.cacheHitRates)
        };
      },
      
      reset() {
        metrics.operationCounts.clear();
        metrics.operationTimes.clear();
        metrics.errorCounts.clear();
        metrics.cacheHitRates.clear();
      }
    };
  }
};

// Import required dependencies for type checking
import { z } from 'zod';
import type {
  MenuClassification,
  MenuEngineeringModuleConfig
} from './menu-engineering-types';