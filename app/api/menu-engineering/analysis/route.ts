/**
 * Menu Engineering Analysis API - Comprehensive menu performance analysis using Boston Matrix
 * 
 * GET /api/menu-engineering/analysis - Get menu performance analysis with classifications
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
  type AnalyzeMenuPerformanceInput,
  type MenuAnalysisResult,
  MenuAnalysisInputSchema
} from '@/lib/services/menu-engineering-service'
import { EnhancedCacheLayer } from '@/lib/services/cache/enhanced-cache-layer'
import { withUnifiedAuth, type UnifiedAuthenticatedUser, authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Enhanced validation schema for menu analysis query
const MenuAnalysisQuerySchema = z.object({
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  locationIds: z.string().transform(str => str.split(',')).pipe(z.array(SecureSchemas.uuid)).optional(),
  recipeIds: z.string().transform(str => str.split(',')).pipe(z.array(SecureSchemas.uuid)).optional(),
  category: SecureSchemas.safeString(100).optional(),
  classification: z.enum(['stars', 'plowhorses', 'puzzles', 'dogs', 'all']).optional().default('all'),
  includeInactive: z.string().transform(str => str === 'true').optional().default(false),
  // Configuration options
  popularityThreshold: z.coerce.number().min(50).max(95).optional(),
  profitabilityThreshold: z.coerce.number().min(50).max(95).optional(),
  minimumSampleSize: z.coerce.number().positive().optional(),
  dataQualityThreshold: z.coerce.number().min(0.1).max(1).optional(),
  // Output options
  includeRecommendations: z.string().transform(str => str !== 'false').optional().default(true),
  includeInsights: z.string().transform(str => str !== 'false').optional().default(true),
  maxRecommendations: z.coerce.number().int().min(1).max(50).optional().default(20)
}).refine(data => {
  // Period validation
  return data.periodStart <= data.periodEnd
}, {
  message: "Period start date must be before or equal to end date"
}).refine(data => {
  // Max analysis period of 1 year
  const maxPeriod = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
  const periodLength = data.periodEnd.getTime() - data.periodStart.getTime()
  return periodLength <= maxPeriod
}, {
  message: "Analysis period cannot exceed 1 year"
})

/**
 * GET /api/menu-engineering/analysis - Get comprehensive menu performance analysis
 * Requires authentication and 'read:menu_analysis' permission
 */
const getMenuAnalysis = withSecurity(
  authStrategies.hybrid(
    withAuthorization('menu_engineering', 'read', async (request: NextRequest, { user }: { user: UnifiedAuthenticatedUser }) => {
      try {
        const { searchParams } = new URL(request.url)
        
        // Parse query parameters
        const rawQuery = {
          periodStart: searchParams.get('periodStart') || undefined,
          periodEnd: searchParams.get('periodEnd') || undefined,
          locationIds: searchParams.get('locationIds') || undefined,
          recipeIds: searchParams.get('recipeIds') || undefined,
          category: searchParams.get('category') || undefined,
          classification: searchParams.get('classification') || undefined,
          includeInactive: searchParams.get('includeInactive') || undefined,
          popularityThreshold: searchParams.get('popularityThreshold') || undefined,
          profitabilityThreshold: searchParams.get('profitabilityThreshold') || undefined,
          minimumSampleSize: searchParams.get('minimumSampleSize') || undefined,
          dataQualityThreshold: searchParams.get('dataQualityThreshold') || undefined,
          includeRecommendations: searchParams.get('includeRecommendations') || undefined,
          includeInsights: searchParams.get('includeInsights') || undefined,
          maxRecommendations: searchParams.get('maxRecommendations') || undefined
        }

        // Enhanced security validation
        const validationResult = await validateInput(rawQuery, MenuAnalysisQuerySchema, {
          maxLength: 1000,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        })

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid menu analysis query parameters',
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

        // Log analytics access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'menu_analysis',
          action: 'read',
          filters: {
            periodDays: Math.ceil((queryParams.periodEnd.getTime() - queryParams.periodStart.getTime()) / (1000 * 60 * 60 * 24)),
            locationRestricted: !!queryParams.locationIds,
            recipeRestricted: !!queryParams.recipeIds,
            classification: queryParams.classification,
            includeRecommendations: queryParams.includeRecommendations
          }
        })

        // Initialize cache and menu engineering service
        const cache = new EnhancedCacheLayer()
        const menuService = createMenuEngineeringService(cache)

        // Prepare analysis input
        const analysisInput: AnalyzeMenuPerformanceInput = {
          periodStart: queryParams.periodStart,
          periodEnd: queryParams.periodEnd,
          locationIds: queryParams.locationIds,
          recipeIds: queryParams.recipeIds,
          includeInactive: queryParams.includeInactive,
          config: {
            popularityThreshold: queryParams.popularityThreshold,
            profitabilityThreshold: queryParams.profitabilityThreshold,
            minimumSampleSize: queryParams.minimumSampleSize,
            dataQualityThreshold: queryParams.dataQualityThreshold
          }
        }

        // Execute menu analysis
        const result = await menuService.analyzeMenuPerformance(analysisInput)

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'menu-engineering-service',
            operation: 'analyze_menu_performance',
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to analyze menu performance',
              details: result.error
            },
            500
          )
        }

        const analysisResult = result.value as MenuAnalysisResult

        // Filter results by classification if specified
        let filteredResult = analysisResult
        if (queryParams.classification !== 'all') {
          const classificationKey = queryParams.classification as keyof Pick<MenuAnalysisResult, 'stars' | 'plowhorses' | 'puzzles' | 'dogs'>
          filteredResult = {
            ...analysisResult,
            [classificationKey]: analysisResult[classificationKey],
            // Clear other classifications to reduce response size
            stars: queryParams.classification === 'stars' ? analysisResult.stars : [],
            plowhorses: queryParams.classification === 'plowhorses' ? analysisResult.plowhorses : [],
            puzzles: queryParams.classification === 'puzzles' ? analysisResult.puzzles : [],
            dogs: queryParams.classification === 'dogs' ? analysisResult.dogs : []
          }
        }

        // Log successful analysis
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'menu_analysis',
          action: 'analysis_completed',
          analysisId: analysisResult.analysisId,
          totalItems: analysisResult.totalItems,
          confidence: analysisResult.confidence,
          dataQuality: analysisResult.dataQuality
        })

        // Create response with analysis results
        const response = createSecureResponse(
          {
            success: true,
            data: {
              analysisId: filteredResult.analysisId,
              analysisDate: filteredResult.analysisDate.toISOString(),
              periodType: filteredResult.periodType,
              period: {
                start: filteredResult.periodStart.toISOString(),
                end: filteredResult.periodEnd.toISOString()
              },
              location: {
                id: filteredResult.locationId,
                name: filteredResult.locationName
              },
              overview: {
                totalItems: filteredResult.totalItems,
                totalSales: filteredResult.totalSales,
                totalRevenue: filteredResult.totalRevenue,
                totalGrossProfit: filteredResult.totalGrossProfit,
                overallProfitMargin: filteredResult.overallProfitMargin,
                averagePopularityScore: filteredResult.averagePopularityScore,
                averageProfitabilityScore: filteredResult.averageProfitabilityScore,
                dataQuality: filteredResult.dataQuality,
                confidence: filteredResult.confidence
              },
              classifications: {
                stars: {
                  count: filteredResult.stars.length,
                  items: filteredResult.stars.slice(0, 20) // Limit to top 20
                },
                plowhorses: {
                  count: filteredResult.plowhorses.length,
                  items: filteredResult.plowhorses.slice(0, 20)
                },
                puzzles: {
                  count: filteredResult.puzzles.length,
                  items: filteredResult.puzzles.slice(0, 20)
                },
                dogs: {
                  count: filteredResult.dogs.length,
                  items: filteredResult.dogs.slice(0, 20)
                }
              },
              recommendations: queryParams.includeRecommendations ? {
                total: filteredResult.recommendations.totalRecommendations,
                highPriority: filteredResult.recommendations.highPriority.slice(0, 10),
                quickWins: filteredResult.recommendations.quickWins.slice(0, 10),
                strategicInitiatives: filteredResult.recommendations.strategicInitiatives.slice(0, 5)
              } : undefined,
              insights: queryParams.includeInsights ? filteredResult.insights : undefined
            },
            metadata: {
              generatedAt: new Date().toISOString(),
              classification: queryParams.classification,
              cacheTtl: 1800 // 30 minutes
            }
          }
        )

        // Add caching and metadata headers
        response.headers.set('Cache-Control', 'public, max-age=1800') // 30 minutes
        response.headers.set('X-Analysis-Id', analysisResult.analysisId)
        response.headers.set('X-Data-Quality', analysisResult.dataQuality.toString())
        response.headers.set('X-Confidence', analysisResult.confidence.toString())
        response.headers.set('X-Total-Items', analysisResult.totalItems.toString())

        return response

      } catch (error) {
        console.error('Error in GET /api/menu-engineering/analysis:', error)
        
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
      exposedHeaders: ['X-Analysis-Id', 'X-Data-Quality', 'X-Confidence', 'X-Total-Items']
    }
  }
)

// Apply rate limiting for analytics operations
export const GET = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100, // 100 analyses per hour
  skipSuccessfulRequests: false,
  keyGenerator: (req) => `menu-analysis:${req.headers.get('authorization') || req.ip}`
})(getMenuAnalysis)