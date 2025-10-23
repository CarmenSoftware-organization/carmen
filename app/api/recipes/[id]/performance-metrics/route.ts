/**
 * Recipe Performance Metrics API - Sales performance and analytics for recipes
 * 
 * GET /api/recipes/[id]/performance-metrics - Get detailed performance metrics
 * 
 * Security Features:
 * - JWT/Keycloak authentication required
 * - Role-based access control (RBAC)
 * - Rate limiting
 * - Input validation and sanitization
 * - Security headers
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  createMenuEngineeringService,
  type MenuClassification
} from '@/lib/services/menu-engineering-service'
import { EnhancedCacheLayer } from '@/lib/services/cache/enhanced-cache-layer'
import { authStrategies } from '@/lib/auth/api-protection'
import type { AuthenticatedUser } from '@/lib/middleware/auth'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Enhanced validation schema for performance metrics query
const PerformanceMetricsQuerySchema = z.object({
  // Time period
  timeframe: z.enum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'last_90_days', 'this_month', 'last_month', 'this_year', 'custom']).optional().default('last_30_days'),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  // Location and context
  locationId: SecureSchemas.uuid.optional(),
  departmentId: SecureSchemas.uuid.optional(),
  // Comparison options
  compareWith: z.enum(['previous_period', 'same_period_last_year', 'category_average', 'none']).optional().default('previous_period'),
  includeBenchmarks: z.string().optional().default('false').transform(str => str === 'true'),
  // Metrics selection
  metrics: z.string().transform(str => str.split(',')).pipe(
    z.array(z.enum([
      'sales_volume', 'revenue', 'profitability', 'popularity', 'customer_satisfaction',
      'preparation_time', 'waste_percentage', 'return_rate', 'seasonal_trends', 'cost_trends'
    ]))
  ).optional(),
  // Granularity
  groupBy: z.enum(['hour', 'day', 'week', 'month', 'day_of_week', 'meal_period']).optional().default('day'),
  // Output options
  includeForecasting: z.string().optional().default('false').transform(str => str === 'true'),
  includeRecommendations: z.string().optional().default('false').transform(str => str === 'true'),
  includeAlerts: z.string().optional().default('true').transform(str => str !== 'false'),
  // Analysis depth
  analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).optional().default('detailed')
}).refine(data => {
  // If timeframe is custom, dateFrom and dateTo are required
  if (data.timeframe === 'custom') {
    return data.dateFrom && data.dateTo && data.dateFrom <= data.dateTo;
  }
  return true;
}, {
  message: "For custom timeframe, both dateFrom and dateTo are required and dateFrom must be <= dateTo"
})

// Path parameter validation
const PathParamsSchema = z.object({
  id: SecureSchemas.uuid
})

/**
 * GET /api/recipes/[id]/performance-metrics - Get recipe performance metrics
 * Requires authentication and 'read:recipe_performance' permission
 */
const getPerformanceMetrics = withSecurity(
  authStrategies.hybrid(
    withAuthorization('recipes', 'read', async (
      request: NextRequest,
      { user }: { user: AuthenticatedUser }
    ) => {
      // Extract params from URL
      const { pathname } = new URL(request.url)
      const id = pathname.split('/')[3] as string
      const params = { id }
      try {
        // Validate path parameters
        const pathValidation = await validateInput({ id: params.id }, PathParamsSchema)
        if (!pathValidation.success) {
          return createSecureResponse(
            {
              success: false,
              error: 'Invalid recipe ID',
              details: pathValidation.errors
            },
            400
          )
        }

        const { searchParams } = new URL(request.url)
        
        // Parse query parameters
        const rawQuery = {
          timeframe: searchParams.get('timeframe') || undefined,
          dateFrom: searchParams.get('dateFrom') || undefined,
          dateTo: searchParams.get('dateTo') || undefined,
          locationId: searchParams.get('locationId') || undefined,
          departmentId: searchParams.get('departmentId') || undefined,
          compareWith: searchParams.get('compareWith') || undefined,
          includeBenchmarks: searchParams.get('includeBenchmarks') || undefined,
          metrics: searchParams.get('metrics') || undefined,
          groupBy: searchParams.get('groupBy') || undefined,
          includeForecasting: searchParams.get('includeForecasting') || undefined,
          includeRecommendations: searchParams.get('includeRecommendations') || undefined,
          includeAlerts: searchParams.get('includeAlerts') || undefined,
          analysisDepth: searchParams.get('analysisDepth') || undefined
        }

        // Enhanced security validation
        const validationResult = await validateInput(rawQuery, PerformanceMetricsQuerySchema as any, {
          maxLength: 1000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        })

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid performance metrics query parameters',
            threats: validationResult.threats,
            riskLevel: validationResult.riskLevel
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Invalid query parameters',
              details: validationResult.errors
            },
            400
          )
        }

        const queryParams = (validationResult.sanitized || validationResult.data!) as {
          timeframe: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'this_year' | 'custom'
          dateFrom?: Date
          dateTo?: Date
          locationId?: string
          departmentId?: string
          compareWith: 'previous_period' | 'same_period_last_year' | 'category_average' | 'none'
          includeBenchmarks: boolean
          metrics?: Array<'sales_volume' | 'revenue' | 'profitability' | 'popularity' | 'customer_satisfaction' | 'preparation_time' | 'waste_percentage' | 'return_rate' | 'seasonal_trends' | 'cost_trends'>
          groupBy: 'hour' | 'day' | 'week' | 'month' | 'day_of_week' | 'meal_period'
          includeForecasting: boolean
          includeRecommendations: boolean
          includeAlerts: boolean
          analysisDepth: 'basic' | 'detailed' | 'comprehensive'
        }
        const recipeId = pathValidation.data!.id

        // Calculate date range based on timeframe
        const now = new Date()
        let dateFrom: Date
        let dateTo: Date = new Date(now)
        
        switch (queryParams.timeframe) {
          case 'today':
            dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'yesterday':
            dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
            dateTo = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'last_7_days':
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'last_30_days':
            dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case 'last_90_days':
            dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
          case 'this_month':
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            dateFrom = lastMonth
            dateTo = new Date(now.getFullYear(), now.getMonth(), 0)
            break
          case 'this_year':
            dateFrom = new Date(now.getFullYear(), 0, 1)
            break
          case 'custom':
            dateFrom = queryParams.dateFrom!
            dateTo = queryParams.dateTo!
            break
          default:
            dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }

        // Log performance metrics access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'recipe_performance_metrics',
          action: 'read',
          recipeId,
          timeframe: queryParams.timeframe,
          analysisDepth: queryParams.analysisDepth,
          periodDays: Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
        })

        // Initialize cache and services
        const cache = new EnhancedCacheLayer({
          redis: {
            enabled: false,
            fallbackToMemory: true,
            connectionTimeout: 5000
          },
          memory: {
            maxMemoryMB: 128,
            maxEntries: 1000
          },
          ttl: {
            financial: 900,
            inventory: 900,
            vendor: 900,
            default: 900
          },
          invalidation: {
            enabled: true,
            batchSize: 100,
            maxDependencies: 50
          },
          monitoring: {
            enabled: false,
            metricsInterval: 60000
          }
        })

        // Mock performance metrics data (in real implementation, this would aggregate from sales data)
        const performanceMetrics = {
          recipeId,
          recipeName: 'Signature Burger',
          recipeCode: 'SIG-001',
          category: 'Main Courses',
          classification: 'STAR' as MenuClassification,
          analysisDate: new Date().toISOString(),
          period: {
            from: dateFrom.toISOString(),
            to: dateTo.toISOString(),
            type: queryParams.timeframe,
            days: Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
          },
          overview: {
            totalSales: 245,
            totalRevenue: { amount: 12250.50, currency: 'USD' },
            totalQuantitySold: 245,
            averagePrice: { amount: 50.00, currency: 'USD' },
            totalProfit: { amount: 7350.30, currency: 'USD' },
            profitMargin: 60.0,
            popularityScore: 85.5,
            profitabilityScore: 88.2,
            customerRating: 4.6,
            repeatOrderRate: 34.5
          },
          trends: {
            salesVolume: {
              trend: 'increasing',
              changePercent: 12.3,
              data: generateMockTrendData(queryParams.groupBy, dateFrom, dateTo, 'sales')
            },
            revenue: {
              trend: 'increasing',
              changePercent: 15.7,
              data: generateMockTrendData(queryParams.groupBy, dateFrom, dateTo, 'revenue')
            },
            profitability: {
              trend: 'stable',
              changePercent: 2.1,
              data: generateMockTrendData(queryParams.groupBy, dateFrom, dateTo, 'profit')
            }
          },
          operational: {
            averagePreparationTime: 8.5, // minutes
            preparationTimeVariance: 1.2, // minutes
            wastePercentage: 3.2,
            returnRate: 0.8,
            qualityScore: 4.7,
            kitchenEfficiency: 92.5,
            ingredientAvailability: 98.2
          },
          comparison: queryParams.compareWith !== 'none' ? {
            type: queryParams.compareWith,
            baseline: {
              totalSales: 218,
              totalRevenue: { amount: 10890.00, currency: 'USD' },
              profitMargin: 58.2
            },
            changes: {
              salesGrowth: 12.3,
              revenueGrowth: 12.5,
              marginImprovement: 1.8
            }
          } : undefined,
          benchmarks: queryParams.includeBenchmarks ? {
            categoryAverage: {
              profitMargin: 55.2,
              popularityScore: 72.1,
              customerRating: 4.2
            },
            industryBenchmark: {
              profitMargin: 52.8,
              popularityScore: 68.5,
              customerRating: 4.1
            },
            position: {
              profitMarginRank: 'top_15_percent',
              popularityRank: 'top_25_percent',
              overallRank: 'top_20_percent'
            }
          } : undefined,
          forecasting: queryParams.includeForecasting ? {
            nextPeriod: {
              predictedSales: 267,
              predictedRevenue: { amount: 13350.00, currency: 'USD' },
              confidenceInterval: 85.2
            },
            seasonality: {
              peakSeason: 'Summer',
              seasonalFactor: 1.15,
              cyclicPattern: 'weekly_peaks_weekend'
            }
          } : undefined,
          recommendations: queryParams.includeRecommendations ? [
            {
              type: 'promotion',
              priority: 'high',
              title: 'Increase marketing for peak hours',
              description: 'Sales peak during dinner hours. Consider promotional pricing for lunch to increase overall volume.',
              expectedImpact: 'Revenue increase of 8-12%'
            }
          ] : undefined,
          alerts: queryParams.includeAlerts ? [
            {
              type: 'performance',
              severity: 'info',
              message: 'Recipe performance is 15.7% above average for the period',
              timestamp: new Date().toISOString()
            }
          ] : []
        }

        // Log successful metrics retrieval
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'recipe_performance_metrics',
          action: 'metrics_retrieved',
          recipeId,
          totalSales: performanceMetrics.overview.totalSales,
          totalRevenue: performanceMetrics.overview.totalRevenue.amount,
          profitMargin: performanceMetrics.overview.profitMargin
        })

        // Create response
        const response = createSecureResponse(
          {
            success: true,
            data: performanceMetrics,
            metadata: {
              recipeId,
              timeframe: queryParams.timeframe,
              analysisDepth: queryParams.analysisDepth,
              generatedAt: new Date().toISOString(),
              cacheTtl: 900 // 15 minutes
            }
          }
        )

        // Add caching and metadata headers
        response.headers.set('Cache-Control', 'public, max-age=900') // 15 minutes
        response.headers.set('X-Recipe-Id', recipeId)
        response.headers.set('X-Total-Sales', performanceMetrics.overview.totalSales.toString())
        response.headers.set('X-Profit-Margin', performanceMetrics.overview.profitMargin.toString())
        response.headers.set('X-Classification', performanceMetrics.classification)

        return response

      } catch (error) {
        console.error('Error in GET /api/recipes/[id]/performance-metrics:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          recipeId: params.id,
          stack: error instanceof Error ? error.stack : undefined
        })

        return createSecureResponse(
          {
            success: false,
            error: 'Internal server error'
          },
          500
        )
      }
    })
  ),
  {
    validationConfig: {
      maxBodySize: 0, // No body for GET requests
      validateOrigin: false // Allow cross-origin GET requests
    },
    corsConfig: {
      methods: ['GET'],
      exposedHeaders: ['X-Recipe-Id', 'X-Total-Sales', 'X-Profit-Margin', 'X-Classification']
    }
  }
)

// Helper function to generate mock trend data
function generateMockTrendData(groupBy: string, dateFrom: Date, dateTo: Date, metric: string) {
  const data = []
  const periodMs = dateTo.getTime() - dateFrom.getTime()
  const days = Math.ceil(periodMs / (1000 * 60 * 60 * 24))
  
  let interval: number
  let format: string
  
  switch (groupBy) {
    case 'hour':
      interval = 60 * 60 * 1000 // 1 hour
      format = 'hour'
      break
    case 'day':
      interval = 24 * 60 * 60 * 1000 // 1 day
      format = 'day'
      break
    case 'week':
      interval = 7 * 24 * 60 * 60 * 1000 // 1 week
      format = 'week'
      break
    case 'month':
      interval = 30 * 24 * 60 * 60 * 1000 // ~1 month
      format = 'month'
      break
    default:
      interval = 24 * 60 * 60 * 1000 // 1 day
      format = 'day'
  }
  
  for (let current = dateFrom.getTime(); current < dateTo.getTime(); current += interval) {
    const date = new Date(current)
    let value: number
    
    switch (metric) {
      case 'sales':
        value = Math.floor(Math.random() * 20) + 5
        break
      case 'revenue':
        value = Math.floor(Math.random() * 1000) + 200
        break
      case 'profit':
        value = Math.floor(Math.random() * 600) + 100
        break
      default:
        value = Math.floor(Math.random() * 100) + 10
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      value,
      period: format
    })
  }
  
  return data.slice(0, 50) // Limit to 50 data points
}

// Apply rate limiting
export const GET = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 300, // 300 performance metric requests per hour
  skipSuccessfulRequests: false,
  keyGenerator: (req) => `recipe-performance-metrics:${req.headers.get('authorization') || req.ip}`
})(getPerformanceMetrics)