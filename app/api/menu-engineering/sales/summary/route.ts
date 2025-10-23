/**
 * Sales Analytics Summary API - Retrieve sales analytics for menu engineering
 * 
 * GET /api/menu-engineering/sales/summary - Get sales analytics summary
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
  createPOSIntegrationService,
  type SyncDailySalesInput
} from '@/lib/services/pos-integration-service'
import { EnhancedCacheLayer } from '@/lib/services/cache/enhanced-cache-layer'
import { authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Enhanced validation schema for sales summary query
const SalesSummaryQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  locationId: SecureSchemas.uuid.optional(),
  categoryId: SecureSchemas.uuid.optional(),
  period: z.enum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_month', 'last_month', 'custom']).optional().default('last_7_days'),
  groupBy: z.enum(['date', 'location', 'category', 'recipe', 'hour', 'day_of_week']).optional().default('date'),
  metrics: z.array(z.enum(['revenue', 'quantity', 'profit', 'cost', 'margin', 'transactions'])).optional(),
  includeComparisons: z.boolean().optional().default(false),
  includeTrends: z.boolean().optional().default(true)
}).refine(data => {
  // If period is custom, dateFrom and dateTo are required
  if (data.period === 'custom') {
    return data.dateFrom && data.dateTo && data.dateFrom <= data.dateTo;
  }
  return true;
}, {
  message: "For custom period, both dateFrom and dateTo are required and dateFrom must be <= dateTo"
})

/**
 * GET /api/menu-engineering/sales/summary - Get sales analytics summary
 * Requires authentication and 'read:sales_data' permission
 */
const getSalesSummary = withSecurity(
  authStrategies.hybrid(
    withAuthorization('menu_engineering', 'read', async (request: NextRequest, { user }: { user: { id: string; role: string } }) => {
      try {
        const { searchParams } = new URL(request.url)
        
        // Parse query parameters
        const rawQuery = {
          dateFrom: searchParams.get('dateFrom') || undefined,
          dateTo: searchParams.get('dateTo') || undefined,
          locationId: searchParams.get('locationId') || undefined,
          categoryId: searchParams.get('categoryId') || undefined,
          period: searchParams.get('period') || undefined,
          groupBy: searchParams.get('groupBy') || undefined,
          metrics: searchParams.getAll('metrics'),
          includeComparisons: searchParams.get('includeComparisons') === 'true',
          includeTrends: searchParams.get('includeTrends') !== 'false' // Default true
        }

        // Enhanced security validation
        const validationResult = await validateInput(rawQuery, SalesSummaryQuerySchema, {
          maxLength: 500,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        })

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid sales summary query parameters',
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

        const queryParams = validationResult.sanitized || validationResult.data!

        // Calculate date range based on period
        const now = new Date()
        let dateFrom: Date
        let dateTo: Date = new Date(now)
        
        switch (queryParams.period) {
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
          case 'this_month':
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            dateFrom = lastMonth
            dateTo = new Date(now.getFullYear(), now.getMonth(), 0)
            break
          case 'custom':
            dateFrom = queryParams.dateFrom!
            dateTo = queryParams.dateTo!
            break
          default:
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }

        // Log data access for sensitive operations
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'sales_summary',
          action: 'read',
          filters: {
            period: queryParams.period,
            groupBy: queryParams.groupBy,
            locationRestricted: !!queryParams.locationId,
            categoryRestricted: !!queryParams.categoryId
          },
          dateRange: {
            from: dateFrom.toISOString(),
            to: dateTo.toISOString()
          }
        })

        // Initialize cache and services
        const cache = new EnhancedCacheLayer({
          redis: {
            enabled: false,
            fallbackToMemory: true,
            connectionTimeout: 5000
          },
          memory: {
            maxMemoryMB: 100,
            maxEntries: 1000
          },
          ttl: {
            financial: 300,
            inventory: 300,
            vendor: 300,
            default: 300
          },
          invalidation: {
            enabled: false,
            batchSize: 100,
            maxDependencies: 1000
          },
          monitoring: {
            enabled: false,
            metricsInterval: 60000
          }
        })

        // Mock sales summary data (in real implementation, this would query the database)
        const salesSummary = {
          summary: {
            period: {
              from: dateFrom.toISOString(),
              to: dateTo.toISOString(),
              type: queryParams.period
            },
            totals: {
              revenue: { amount: 125678.50, currency: 'USD' },
              transactions: 1247,
              itemsSold: 3891,
              averageOrderValue: { amount: 100.78, currency: 'USD' },
              grossProfit: { amount: 75407.10, currency: 'USD' },
              grossMargin: 60.02
            },
            topPerformers: {
              byRevenue: [
                { recipeId: 'recipe-001', recipeName: 'Signature Burger', revenue: 15678.90, quantity: 234 },
                { recipeId: 'recipe-002', recipeName: 'Classic Pizza', revenue: 12456.70, quantity: 189 },
                { recipeId: 'recipe-003', recipeName: 'Caesar Salad', revenue: 8765.40, quantity: 345 }
              ],
              byQuantity: [
                { recipeId: 'recipe-003', recipeName: 'Caesar Salad', quantity: 345, revenue: 8765.40 },
                { recipeId: 'recipe-001', recipeName: 'Signature Burger', quantity: 234, revenue: 15678.90 },
                { recipeId: 'recipe-002', recipeName: 'Classic Pizza', quantity: 189, revenue: 12456.70 }
              ],
              byProfit: [
                { recipeId: 'recipe-001', recipeName: 'Signature Burger', profit: 9407.34, margin: 60.03 },
                { recipeId: 'recipe-002', recipeName: 'Classic Pizza', profit: 7473.02, margin: 60.00 },
                { recipeId: 'recipe-003', recipeName: 'Caesar Salad', profit: 5259.24, margin: 60.01 }
              ]
            }
          },
          trends: queryParams.includeTrends ? {
            dailyRevenue: [
              { date: '2024-01-01', revenue: 18567.89, transactions: 178 },
              { date: '2024-01-02', revenue: 17234.56, transactions: 165 },
              { date: '2024-01-03', revenue: 19876.34, transactions: 189 }
            ],
            hourlyPatterns: [
              { hour: 11, avgRevenue: 1234.56, avgTransactions: 12 },
              { hour: 12, avgRevenue: 2456.78, avgTransactions: 24 },
              { hour: 18, avgRevenue: 3456.89, avgTransactions: 35 }
            ],
            categoryBreakdown: [
              { categoryId: 'cat-001', categoryName: 'Main Courses', revenue: 75432.10, percentage: 60.0 },
              { categoryId: 'cat-002', categoryName: 'Appetizers', revenue: 25432.10, percentage: 20.2 },
              { categoryId: 'cat-003', categoryName: 'Desserts', revenue: 24814.30, percentage: 19.8 }
            ]
          } : undefined,
          comparisons: queryParams.includeComparisons ? {
            previousPeriod: {
              revenue: { amount: 118567.25, currency: 'USD' },
              growth: 6.01,
              transactions: 1189,
              transactionGrowth: 4.88
            },
            yearOverYear: {
              revenue: { amount: 98765.40, currency: 'USD' },
              growth: 27.23,
              transactions: 1023,
              transactionGrowth: 21.89
            }
          } : undefined
        }

        // Add metadata headers
        const response = createSecureResponse({
          success: true,
          data: salesSummary,
          metadata: {
            generatedAt: new Date().toISOString(),
            period: queryParams.period,
            groupBy: queryParams.groupBy,
            cacheTtl: 300 // 5 minutes
          }
        })

        // Add caching headers
        response.headers.set('Cache-Control', 'public, max-age=300') // 5 minutes
        response.headers.set('X-Data-Source', 'menu-engineering-service')
        response.headers.set('X-Query-Period', queryParams.period || 'last_7_days')

        return response

      } catch (error) {
        console.error('Error in GET /api/menu-engineering/sales/summary:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
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
      exposedHeaders: ['X-Data-Source', 'X-Query-Period', 'Cache-Control']
    }
  }
)

// Apply rate limiting
export const GET = withRateLimit(RateLimitPresets.API)(getSalesSummary)