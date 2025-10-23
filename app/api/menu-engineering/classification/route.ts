/**
 * Menu Classification API - Get menu items by Boston Matrix classifications
 * 
 * GET /api/menu-engineering/classification - Get classified menu items
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
import { EnhancedCacheLayer, type CacheLayerConfig } from '@/lib/services/cache/enhanced-cache-layer'
import { withAuth, authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization } from '@/lib/middleware/rbac'
import type { AuthenticatedUser } from '@/lib/middleware/auth'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Enhanced validation schema for classification query
const ClassificationQuerySchema = z.object({
  classification: z.enum(['STAR', 'PLOWHORSES', 'PUZZLE', 'DOG']),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  locationId: SecureSchemas.uuid.optional(),
  categoryId: SecureSchemas.uuid.optional(),
  // Pagination
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  // Sorting
  sortBy: z.enum(['popularityScore', 'profitabilityScore', 'recipeName', 'totalRevenue', 'totalSales']).optional().default('popularityScore'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  // Filtering
  minPopularityScore: z.coerce.number().min(0).max(100).optional(),
  maxPopularityScore: z.coerce.number().min(0).max(100).optional(),
  minProfitabilityScore: z.coerce.number().min(0).max(100).optional(),
  maxProfitabilityScore: z.coerce.number().min(0).max(100).optional(),
  minRevenue: z.coerce.number().min(0).optional(),
  maxRevenue: z.coerce.number().min(0).optional(),
  // Output options
  includeMetrics: z.coerce.boolean().optional().default(true),
  includeTrends: z.coerce.boolean().optional().default(false)
}).refine(data => {
  // Validate score ranges
  if (data.minPopularityScore && data.maxPopularityScore) {
    return data.minPopularityScore <= data.maxPopularityScore
  }
  return true
}, {
  message: "minPopularityScore must be less than or equal to maxPopularityScore"
}).refine(data => {
  // Validate profitability score ranges
  if (data.minProfitabilityScore && data.maxProfitabilityScore) {
    return data.minProfitabilityScore <= data.maxProfitabilityScore
  }
  return true
}, {
  message: "minProfitabilityScore must be less than or equal to maxProfitabilityScore"
}).refine(data => {
  // Validate revenue ranges
  if (data.minRevenue && data.maxRevenue) {
    return data.minRevenue <= data.maxRevenue
  }
  return true
}, {
  message: "minRevenue must be less than or equal to maxRevenue"
})

/**
 * GET /api/menu-engineering/classification - Get classified menu items
 * Requires authentication and 'read:menu_analysis' permission
 */
const getClassifiedItems = withSecurity(
  authStrategies.hybrid(
    withAuthorization('menu_engineering', 'read', async (request: NextRequest, context: { user: AuthenticatedUser }) => {
      const { user } = context
      try {
        const { searchParams } = new URL(request.url)
        
        // Parse query parameters
        const rawQuery = {
          classification: searchParams.get('classification'),
          periodStart: searchParams.get('periodStart') || undefined,
          periodEnd: searchParams.get('periodEnd') || undefined,
          locationId: searchParams.get('locationId') || undefined,
          categoryId: searchParams.get('categoryId') || undefined,
          page: searchParams.get('page') || undefined,
          limit: searchParams.get('limit') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
          sortOrder: searchParams.get('sortOrder') || undefined,
          minPopularityScore: searchParams.get('minPopularityScore') || undefined,
          maxPopularityScore: searchParams.get('maxPopularityScore') || undefined,
          minProfitabilityScore: searchParams.get('minProfitabilityScore') || undefined,
          maxProfitabilityScore: searchParams.get('maxProfitabilityScore') || undefined,
          minRevenue: searchParams.get('minRevenue') || undefined,
          maxRevenue: searchParams.get('maxRevenue') || undefined,
          includeMetrics: searchParams.get('includeMetrics') || undefined,
          includeTrends: searchParams.get('includeTrends') || undefined
        }

        // Enhanced security validation
        const validationResult = await validateInput(
          rawQuery,
          ClassificationQuerySchema as z.ZodType<z.infer<typeof ClassificationQuerySchema>>,
          {
            maxLength: 500,
            trimWhitespace: true,
            removeSuspiciousPatterns: true
          }
        )

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid classification query parameters',
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

        // Log classification access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'menu_classification',
          action: 'read',
          classification: queryParams.classification,
          filters: {
            locationRestricted: !!queryParams.locationId,
            categoryRestricted: !!queryParams.categoryId,
            scoreFilters: !!(queryParams.minPopularityScore || queryParams.maxPopularityScore || 
                           queryParams.minProfitabilityScore || queryParams.maxProfitabilityScore)
          },
          pagination: {
            page: queryParams.page,
            limit: queryParams.limit
          }
        })

        // Initialize cache and services
        const cacheConfig: CacheLayerConfig = {
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
            inventory: 600,
            vendor: 600,
            default: 300
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
        }
        const cache = new EnhancedCacheLayer(cacheConfig)

        // Mock classified items data (in real implementation, this would query the database)
        const mockItems = generateMockClassifiedItems(queryParams.classification, queryParams)

        // Apply filtering
        let filteredItems = mockItems.filter(item => {
          if (queryParams.minPopularityScore && item.popularityScore < queryParams.minPopularityScore) return false
          if (queryParams.maxPopularityScore && item.popularityScore > queryParams.maxPopularityScore) return false
          if (queryParams.minProfitabilityScore && item.profitabilityScore < queryParams.minProfitabilityScore) return false
          if (queryParams.maxProfitabilityScore && item.profitabilityScore > queryParams.maxProfitabilityScore) return false
          if (queryParams.minRevenue && item.totalRevenue.amount < queryParams.minRevenue) return false
          if (queryParams.maxRevenue && item.totalRevenue.amount > queryParams.maxRevenue) return false
          return true
        })

        // Apply sorting
        filteredItems.sort((a, b) => {
          const field = queryParams.sortBy
          let aValue: any, bValue: any

          switch (field) {
            case 'popularityScore':
              aValue = a.popularityScore
              bValue = b.popularityScore
              break
            case 'profitabilityScore':
              aValue = a.profitabilityScore
              bValue = b.profitabilityScore
              break
            case 'recipeName':
              aValue = a.recipeName.toLowerCase()
              bValue = b.recipeName.toLowerCase()
              break
            case 'totalRevenue':
              aValue = a.totalRevenue.amount
              bValue = b.totalRevenue.amount
              break
            case 'totalSales':
              aValue = a.totalSales
              bValue = b.totalSales
              break
            default:
              aValue = a.popularityScore
              bValue = b.popularityScore
          }

          if (queryParams.sortOrder === 'desc') {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
          }
        })

        // Apply pagination
        const totalItems = filteredItems.length
        const totalPages = Math.ceil(totalItems / queryParams.limit)
        const startIndex = (queryParams.page - 1) * queryParams.limit
        const endIndex = startIndex + queryParams.limit
        const paginatedItems = filteredItems.slice(startIndex, endIndex)

        // Calculate classification statistics
        const stats = {
          averagePopularityScore: filteredItems.reduce((sum, item) => sum + item.popularityScore, 0) / filteredItems.length || 0,
          averageProfitabilityScore: filteredItems.reduce((sum, item) => sum + item.profitabilityScore, 0) / filteredItems.length || 0,
          totalRevenue: filteredItems.reduce((sum, item) => sum + item.totalRevenue.amount, 0),
          totalSales: filteredItems.reduce((sum, item) => sum + item.totalSales, 0),
          totalQuantity: filteredItems.reduce((sum, item) => sum + item.totalQuantitySold, 0)
        }

        // Create response
        const response = createSecureResponse(
          {
            success: true,
            data: {
              classification: queryParams.classification,
              items: paginatedItems.map(item => queryParams.includeMetrics ? item : {
                recipeId: item.recipeId,
                recipeName: item.recipeName,
                recipeCode: item.recipeCode,
                category: item.category,
                popularityScore: item.popularityScore,
                profitabilityScore: item.profitabilityScore,
                classification: item.classification
              }),
              statistics: {
                ...stats,
                averagePopularityScore: Math.round(stats.averagePopularityScore * 100) / 100,
                averageProfitabilityScore: Math.round(stats.averageProfitabilityScore * 100) / 100
              }
            },
            pagination: {
              page: queryParams.page,
              limit: queryParams.limit,
              total: totalItems,
              totalPages,
              hasNext: queryParams.page < totalPages,
              hasPrev: queryParams.page > 1
            },
            metadata: {
              classification: queryParams.classification,
              generatedAt: new Date().toISOString(),
              sortBy: queryParams.sortBy,
              sortOrder: queryParams.sortOrder,
              cacheTtl: 600 // 10 minutes
            }
          }
        )

        // Add pagination headers
        response.headers.set('X-Total-Count', totalItems.toString())
        response.headers.set('X-Page-Count', totalPages.toString())
        response.headers.set('X-Current-Page', queryParams.page.toString())
        response.headers.set('X-Classification', queryParams.classification)
        response.headers.set('Cache-Control', 'public, max-age=600') // 10 minutes

        return response

      } catch (error) {
        console.error('Error in GET /api/menu-engineering/classification:', error)
        
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
      exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Current-Page', 'X-Classification']
    }
  }
)

// Helper function to generate mock classified items
function generateMockClassifiedItems(classification: MenuClassification, params: any) {
  const baseItems = [
    // STAR items
    { id: 'recipe-001', name: 'Signature Burger', code: 'SIG-001', category: 'Main Courses', popularity: 95, profitability: 92 },
    { id: 'recipe-002', name: 'Classic Pizza', code: 'PIZ-001', category: 'Main Courses', popularity: 88, profitability: 85 },
    { id: 'recipe-003', name: 'Grilled Salmon', code: 'SEA-001', category: 'Main Courses', popularity: 82, profitability: 90 },
    
    // PLOWHORSES items
    { id: 'recipe-004', name: 'Caesar Salad', code: 'SAL-001', category: 'Appetizers', popularity: 90, profitability: 45 },
    { id: 'recipe-005', name: 'French Fries', code: 'SID-001', category: 'Sides', popularity: 95, profitability: 40 },
    { id: 'recipe-006', name: 'Chicken Wings', code: 'APP-001', category: 'Appetizers', popularity: 85, profitability: 50 },
    
    // PUZZLE items
    { id: 'recipe-007', name: 'Lobster Thermidor', code: 'LUX-001', category: 'Main Courses', popularity: 35, profitability: 95 },
    { id: 'recipe-008', name: 'Truffle Pasta', code: 'PAS-001', category: 'Main Courses', popularity: 28, profitability: 88 },
    { id: 'recipe-009', name: 'Wagyu Steak', code: 'STE-001', category: 'Main Courses', popularity: 42, profitability: 92 },
    
    // DOG items
    { id: 'recipe-010', name: 'Cold Soup', code: 'SOU-001', category: 'Appetizers', popularity: 15, profitability: 25 },
    { id: 'recipe-011', name: 'Quinoa Bowl', code: 'HEA-001', category: 'Health', popularity: 22, profitability: 30 },
    { id: 'recipe-012', name: 'Vegan Wrap', code: 'VEG-001', category: 'Wraps', popularity: 18, profitability: 35 }
  ]

  const filteredByClassification = baseItems.filter(item => {
    switch (classification) {
      case 'STAR':
        return item.popularity >= 80 && item.profitability >= 80
      case 'PLOWHORSES':
        return item.popularity >= 80 && item.profitability < 80
      case 'PUZZLE':
        return item.popularity < 80 && item.profitability >= 80
      case 'DOG':
        return item.popularity < 80 && item.profitability < 80
      default:
        return false
    }
  })

  return filteredByClassification.map(item => ({
    recipeId: item.id,
    recipeName: item.name,
    recipeCode: item.code,
    category: item.category,
    totalSales: Math.floor(Math.random() * 500) + 50,
    totalRevenue: { amount: Math.floor(Math.random() * 10000) + 1000, currency: 'USD' },
    totalQuantitySold: Math.floor(Math.random() * 1000) + 100,
    averagePrice: { amount: Math.floor(Math.random() * 50) + 10, currency: 'USD' },
    totalFoodCost: { amount: Math.floor(Math.random() * 3000) + 300, currency: 'USD' },
    averageFoodCost: { amount: Math.floor(Math.random() * 15) + 3, currency: 'USD' },
    totalGrossProfit: { amount: Math.floor(Math.random() * 7000) + 700, currency: 'USD' },
    averageProfitMargin: item.profitability,
    popularityScore: item.popularity,
    profitabilityScore: item.profitability,
    popularityRank: Math.floor(Math.random() * 100) + 1,
    profitabilityRank: Math.floor(Math.random() * 100) + 1,
    classification: classification,
    dataQuality: 0.85 + Math.random() * 0.1,
    sampleSize: Math.floor(Math.random() * 200) + 50,
    salesTrend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable',
    profitabilityTrend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable'
  }))
}

// Apply rate limiting
export const GET = withRateLimit(RateLimitPresets.API)(getClassifiedItems)