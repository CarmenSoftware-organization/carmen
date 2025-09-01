/**
 * Menu Engineering API Types
 * 
 * Centralized type definitions for Menu Engineering API endpoints.
 * These types extend the service types with API-specific interfaces.
 */

import { z } from 'zod'
import { SecureSchemas } from '@/lib/security/input-validator'
import type {
  MenuClassification,
  AnalysisPeriod,
  MenuItemPerformance,
  MenuAnalysisResult,
  MenuRecommendation,
  RecommendationType
} from '@/lib/services/menu-engineering-service'
import type {
  SalesTransaction,
  POSItemMapping,
  ValidationError,
  DailySyncStatus
} from '@/lib/services/pos-integration-service'

// ====== API REQUEST/RESPONSE TYPES ======

/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
  metadata?: ApiMetadata
  pagination?: PaginationInfo
}

/**
 * API Metadata for responses
 */
export interface ApiMetadata {
  timestamp?: string
  requestId?: string
  version?: string
  cacheTtl?: number
  generatedAt?: string
  [key: string]: any
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ====== SALES DATA IMPORT TYPES ======

/**
 * Sales data import request
 */
export interface SalesImportRequest {
  source: string
  transactions: Partial<SalesTransaction>[]
  batchSize?: number
  validateOnly?: boolean
  skipDuplicates?: boolean
  metadata?: {
    posSystemName?: string
    posVersion?: string
    exportedAt?: Date
    fileSize?: number
    checksum?: string
    notes?: string
  }
}

/**
 * Sales data import response
 */
export interface SalesImportResponse {
  batchId: string
  totalRecords: number
  successfulRecords: number
  failedRecords: number
  duplicatesSkipped: number
  processingTimeMs: number
  validationErrors: ValidationError[]
  hasMore?: boolean
}

// ====== POS SYNC TYPES ======

/**
 * POS synchronization request
 */
export interface POSSyncRequest {
  date?: Date
  sources?: string[]
  syncType?: 'full' | 'incremental' | 'retry_failed'
  retryFailedRecords?: boolean
  maxRetries?: number
  batchSize?: number
  forceSync?: boolean
  configuration?: {
    posSystemName?: string
    apiEndpoint?: string
    timeout?: number
    compression?: boolean
    encryption?: boolean
  }
}

/**
 * POS synchronization response
 */
export interface POSSyncResponse {
  date: string
  status: 'completed' | 'partial' | 'failed'
  recordsProcessed: number
  errorCount: number
  processingTimeMs: number
  sources: Array<{
    source: string
    recordsProcessed: number
    errors: number
    status: 'completed' | 'failed'
  }>
  nextSyncTime?: string
  summary: {
    successRate: string
    avgProcessingSpeed: string
  }
}

// ====== MENU ANALYSIS TYPES ======

/**
 * Menu analysis request parameters
 */
export interface MenuAnalysisRequest {
  periodStart: Date
  periodEnd: Date
  locationIds?: string[]
  recipeIds?: string[]
  category?: string
  classification?: MenuClassification | 'all'
  includeInactive?: boolean
  popularityThreshold?: number
  profitabilityThreshold?: number
  minimumSampleSize?: number
  dataQualityThreshold?: number
  includeRecommendations?: boolean
  includeInsights?: boolean
  maxRecommendations?: number
}

/**
 * Menu analysis response
 */
export interface MenuAnalysisResponse {
  analysisId: string
  analysisDate: string
  periodType: AnalysisPeriod
  period: {
    start: string
    end: string
  }
  location: {
    id?: string
    name?: string
  }
  overview: {
    totalItems: number
    totalSales: number
    totalRevenue: { amount: number; currency: string }
    totalGrossProfit: { amount: number; currency: string }
    overallProfitMargin: number
    averagePopularityScore: number
    averageProfitabilityScore: number
    dataQuality: number
    confidence: number
  }
  classifications: {
    stars: { count: number; items: MenuItemPerformance[] }
    plowhorses: { count: number; items: MenuItemPerformance[] }
    puzzles: { count: number; items: MenuItemPerformance[] }
    dogs: { count: number; items: MenuItemPerformance[] }
  }
  recommendations?: {
    total: number
    highPriority: MenuRecommendation[]
    quickWins: MenuRecommendation[]
    strategicInitiatives: MenuRecommendation[]
  }
  insights?: any[]
}

// ====== RECIPE PERFORMANCE TYPES ======

/**
 * Recipe performance metrics request
 */
export interface RecipePerformanceRequest {
  timeframe?: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'this_year' | 'custom'
  dateFrom?: Date
  dateTo?: Date
  locationId?: string
  departmentId?: string
  compareWith?: 'previous_period' | 'same_period_last_year' | 'category_average' | 'none'
  includeBenchmarks?: boolean
  metrics?: string[]
  groupBy?: 'hour' | 'day' | 'week' | 'month' | 'day_of_week' | 'meal_period'
  includeForecasting?: boolean
  includeRecommendations?: boolean
  includeAlerts?: boolean
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive'
}

/**
 * Recipe performance metrics response
 */
export interface RecipePerformanceResponse {
  recipeId: string
  recipeName: string
  recipeCode: string
  category: string
  classification: MenuClassification
  analysisDate: string
  period: {
    from: string
    to: string
    type: string
    days: number
  }
  overview: {
    totalSales: number
    totalRevenue: { amount: number; currency: string }
    totalQuantitySold: number
    averagePrice: { amount: number; currency: string }
    totalProfit: { amount: number; currency: string }
    profitMargin: number
    popularityScore: number
    profitabilityScore: number
    customerRating: number
    repeatOrderRate: number
  }
  trends: {
    salesVolume: { trend: string; changePercent: number; data: any[] }
    revenue: { trend: string; changePercent: number; data: any[] }
    profitability: { trend: string; changePercent: number; data: any[] }
  }
  operational: {
    averagePreparationTime: number
    preparationTimeVariance: number
    wastePercentage: number
    returnRate: number
    qualityScore: number
    kitchenEfficiency: number
    ingredientAvailability: number
  }
  comparison?: any
  benchmarks?: any
  forecasting?: any
  recommendations?: any[]
  alerts: any[]
}

// ====== REAL-TIME COSTING TYPES ======

/**
 * Real-time cost calculation request
 */
export interface RealTimeCostRequest {
  yieldVariantId?: string
  portionSize?: number
  quantity?: number
  includeLabor?: boolean
  includeOverhead?: boolean
  useLatestPrices?: boolean
  preferredVendorId?: string
  useContractPrices?: boolean
  currency?: string
  locationId?: string
  includeIngredientBreakdown?: boolean
  includePriceHistory?: boolean
  includeAlternatives?: boolean
  compareToTarget?: boolean
  showVariance?: boolean
}

/**
 * Real-time cost calculation response
 */
export interface RealTimeCostResponse {
  recipeId: string
  recipeName: string
  recipeCode: string
  calculatedAt: string
  calculationId: string
  parameters: RealTimeCostRequest
  costBreakdown: {
    ingredients?: Array<{
      ingredientId: string
      ingredientName: string
      quantity: number
      unit: string
      unitCost: { amount: number; currency: string }
      totalCost: { amount: number; currency: string }
      vendor: string
      priceDate: string
      variance: { amount: number; currency: string; percentage: number }
      alternatives?: Array<{ vendor: string; unitCost: { amount: number; currency: string } }>
    }>
    totals: {
      ingredientCost: { amount: number; currency: string }
      laborCost?: { amount: number; currency: string }
      overheadCost?: { amount: number; currency: string }
      totalDirectCost: { amount: number; currency: string }
      costPerUnit: { amount: number; currency: string }
    }
  }
  pricing: {
    currentSellingPrice: { amount: number; currency: string }
    suggestedSellingPrice: { amount: number; currency: string }
    grossMargin: { amount: number; currency: string }
    grossMarginPercentage: number
  }
  comparison?: any
  priceHistory?: any
  alerts: any[]
}

// ====== COST ALERTS TYPES ======

/**
 * Cost alerts request
 */
export interface CostAlertsRequest {
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'all'
  status?: 'active' | 'acknowledged' | 'resolved' | 'all'
  alertType?: 'price_increase' | 'price_decrease' | 'threshold_breach' | 'variance' | 'availability' | 'quality' | 'all'
  since?: Date
  until?: Date
  period?: 'today' | 'last_24h' | 'last_7d' | 'last_30d' | 'custom'
  minVariancePercent?: number
  maxVariancePercent?: number
  minImpactAmount?: number
  includeHistorical?: boolean
  includeRecommendations?: boolean
  includeIngredientDetails?: boolean
  sortBy?: 'severity' | 'timestamp' | 'impact' | 'variance'
  sortOrder?: 'asc' | 'desc'
  limit?: number
}

/**
 * Cost alerts response
 */
export interface CostAlertsResponse {
  recipeId: string
  recipeName: string
  recipeCode: string
  period: {
    from: string
    to: string
    type: string
  }
  summary: {
    totalAlerts: number
    bySeverity: Record<string, number>
    byStatus: Record<string, number>
    byType: Record<string, number>
    totalImpact: number
    averageVariance: number
  }
  alerts: Array<{
    id: string
    recipeId: string
    type: string
    severity: string
    status: string
    timestamp: string
    title: string
    message: string
    ingredientId?: string
    ingredientName?: string
    variancePercent?: number
    impactAmount?: { amount: number; currency: string }
    threshold?: any
    supplier?: string
    acknowledgedBy?: string
    acknowledgedAt?: string
    resolvedAt?: string
    actions: string[]
  }>
  recommendations?: any[]
  historical?: any
}

// ====== ZOD VALIDATION SCHEMAS ======

// Common validation schemas
export const PeriodSchema = z.object({
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date()
}).refine(data => data.periodStart <= data.periodEnd, {
  message: "Start date must be before or equal to end date"
})

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

export const LocationFilterSchema = z.object({
  locationId: SecureSchemas.uuid.optional(),
  departmentId: SecureSchemas.uuid.optional()
})

// Export commonly used validation functions
export const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export const validateCurrency = (code: string): boolean => {
  const currencyRegex = /^[A-Z]{3}$/
  return currencyRegex.test(code)
}

export const validateDateRange = (start: Date, end: Date, maxDays: number = 365): boolean => {
  if (start > end) return false
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= maxDays
}