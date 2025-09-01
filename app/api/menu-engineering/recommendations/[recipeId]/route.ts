/**
 * AI-Powered Menu Recommendations API - Get optimization recommendations for specific recipes
 * 
 * GET /api/menu-engineering/recommendations/[recipeId] - Get AI recommendations for a recipe
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
  type GenerateRecommendationsInput,
  type MenuRecommendation,
  type MenuAnalysisResult
} from '@/lib/services/menu-engineering-service'
import { EnhancedCacheLayer } from '@/lib/services/cache/enhanced-cache-layer'
import { withUnifiedAuth, type UnifiedAuthenticatedUser, authStrategies } from '@/lib/auth/api-protection'
import { withAuthorization } from '@/lib/middleware/rbac'
import { withSecurity, createSecureResponse, auditSecurityEvent } from '@/lib/middleware/security'
import { withRateLimit, RateLimitPresets } from '@/lib/security/rate-limiter'
import { validateInput, SecureSchemas } from '@/lib/security/input-validator'
import { SecurityEventType } from '@/lib/security/audit-logger'

// Enhanced validation schema for recommendation query
const RecommendationQuerySchema = z.object({
  // Analysis period
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  // Recommendation filters
  types: z.string().transform(str => str.split(',')).pipe(
    z.array(z.enum(['promote', 'reposition', 'reprice', 'reformulate', 'remove', 'feature', 'bundle', 'investigate']))
  ).optional(),
  priority: z.enum(['high', 'medium', 'low', 'all']).optional().default('all'),
  impact: z.enum(['high', 'medium', 'low', 'all']).optional().default('all'),
  effort: z.enum(['high', 'medium', 'low', 'all']).optional().default('all'),
  // Business context
  focusAreas: z.string().transform(str => str.split(',')).pipe(
    z.array(z.enum(['profitability', 'popularity', 'cost_reduction', 'marketing', 'operational']))
  ).optional(),
  maxRecommendations: z.coerce.number().int().min(1).max(20).optional().default(10),
  // Context data flags
  includeSeasonality: z.string().transform(str => str === 'true').optional().default(false),
  includeCompetitor: z.string().transform(str => str === 'true').optional().default(false),
  includeMarketTrends: z.string().transform(str => str === 'true').optional().default(false),
  // Output options
  includeActionSteps: z.string().transform(str => str !== 'false').optional().default(true),
  includeMetrics: z.string().transform(str => str !== 'false').optional().default(true),
  includeImpactEstimates: z.string().transform(str => str === 'true').optional().default(false)
})

// Path parameter validation
const PathParamsSchema = z.object({
  recipeId: SecureSchemas.uuid
})

/**
 * GET /api/menu-engineering/recommendations/[recipeId] - Get AI recommendations for a recipe
 * Requires authentication and 'read:menu_recommendations' permission
 */
const getRecipeRecommendations = withSecurity(
  authStrategies.hybrid(
    withAuthorization('menu_engineering', 'read', async (
      request: NextRequest, 
      { user, params }: { user: UnifiedAuthenticatedUser, params: { recipeId: string } }
    ) => {
      try {
        // Validate path parameters
        const pathValidation = await validateInput({ recipeId: params.recipeId }, PathParamsSchema)
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
          periodStart: searchParams.get('periodStart') || undefined,
          periodEnd: searchParams.get('periodEnd') || undefined,
          types: searchParams.get('types') || undefined,
          priority: searchParams.get('priority') || undefined,
          impact: searchParams.get('impact') || undefined,
          effort: searchParams.get('effort') || undefined,
          focusAreas: searchParams.get('focusAreas') || undefined,
          maxRecommendations: searchParams.get('maxRecommendations') || undefined,
          includeSeasonality: searchParams.get('includeSeasonality') || undefined,
          includeCompetitor: searchParams.get('includeCompetitor') || undefined,
          includeMarketTrends: searchParams.get('includeMarketTrends') || undefined,
          includeActionSteps: searchParams.get('includeActionSteps') || undefined,
          includeMetrics: searchParams.get('includeMetrics') || undefined,
          includeImpactEstimates: searchParams.get('includeImpactEstimates') || undefined
        }

        // Enhanced security validation
        const validationResult = await validateInput(rawQuery, RecommendationQuerySchema, {
          maxLength: 500,
          trimWhitespace: true,
          removeSuspiciousPatterns: true
        })

        if (!validationResult.success) {
          await auditSecurityEvent(SecurityEventType.MALICIOUS_REQUEST, request, user.id, {
            reason: 'Invalid recommendation query parameters',
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
        const recipeId = pathValidation.data!.recipeId

        // Log recommendation access
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'recipe_recommendations',
          action: 'read',
          recipeId,
          filters: {
            priority: queryParams.priority,
            impact: queryParams.impact,
            effort: queryParams.effort,
            maxRecommendations: queryParams.maxRecommendations,
            includeContext: !!(queryParams.includeSeasonality || queryParams.includeCompetitor || queryParams.includeMarketTrends)
          }
        })

        // Initialize cache and menu engineering service
        const cache = new EnhancedCacheLayer()
        const menuService = createMenuEngineeringService(cache)

        // First, we need to get or create a menu analysis for the recipe
        // In a real implementation, this would check if recent analysis exists or create one
        const mockAnalysis: MenuAnalysisResult = createMockAnalysisForRecipe(recipeId)

        // Prepare recommendation input
        const recommendationInput: GenerateRecommendationsInput = {
          analysis: mockAnalysis,
          businessRules: {
            maxRecommendations: queryParams.maxRecommendations,
            focusAreas: queryParams.types,
            excludeTypes: []
          },
          contextData: {
            seasonality: queryParams.includeSeasonality ? {
              currentSeason: 'winter',
              seasonalFactor: 0.85,
              peakMonths: ['December', 'January', 'February']
            } : undefined,
            competitorData: queryParams.includeCompetitor ? {
              avgCompetitorPrice: 24.99,
              competitorRating: 4.2,
              marketPosition: 'premium'
            } : undefined,
            marketTrends: queryParams.includeMarketTrends ? {
              trendingIngredients: ['truffle', 'plant-based', 'fermented'],
              dietaryTrends: ['keto', 'gluten-free', 'sustainable'],
              priceTrend: 'increasing'
            } : undefined
          }
        }

        // Generate recommendations
        const result = await menuService.generateRecommendations(recommendationInput)

        if (!result.success) {
          await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
            component: 'menu-engineering-service',
            operation: 'generate_recommendations',
            recipeId,
            error: result.error
          })

          return createSecureResponse(
            {
              success: false,
              error: 'Failed to generate recommendations',
              details: result.error
            },
            500
          )
        }

        const recommendations = result.value

        // Filter recommendations based on query parameters
        let filteredRecommendations = [
          ...recommendations.highPriority,
          ...recommendations.mediumPriority,
          ...recommendations.lowPriority
        ].filter(rec => rec.recipeId === recipeId)

        // Apply priority filter
        if (queryParams.priority !== 'all') {
          filteredRecommendations = filteredRecommendations.filter(rec => rec.priority === queryParams.priority)
        }

        // Apply impact filter
        if (queryParams.impact !== 'all') {
          filteredRecommendations = filteredRecommendations.filter(rec => rec.impact === queryParams.impact)
        }

        // Apply effort filter
        if (queryParams.effort !== 'all') {
          filteredRecommendations = filteredRecommendations.filter(rec => rec.effort === queryParams.effort)
        }

        // Apply type filters
        if (queryParams.types && queryParams.types.length > 0) {
          filteredRecommendations = filteredRecommendations.filter(rec => 
            queryParams.types!.includes(rec.recommendationType)
          )
        }

        // Limit results
        filteredRecommendations = filteredRecommendations.slice(0, queryParams.maxRecommendations)

        // Format recommendations based on output options
        const formattedRecommendations = filteredRecommendations.map(rec => ({
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          recipeId: rec.recipeId,
          recipeName: rec.recipeName,
          classification: rec.currentClassification,
          type: rec.recommendationType,
          priority: rec.priority,
          impact: rec.impact,
          effort: rec.effort,
          title: rec.title,
          description: rec.description,
          rationale: rec.rationale,
          expectedOutcome: rec.expectedOutcome,
          timeframe: rec.timeframe,
          actionSteps: queryParams.includeActionSteps ? rec.actionSteps : undefined,
          metrics: queryParams.includeMetrics ? rec.metrics : undefined,
          impactEstimates: queryParams.includeImpactEstimates ? {
            revenueImpact: rec.estimatedImpactRevenue,
            profitImpact: rec.estimatedImpactProfit
          } : undefined,
          tags: rec.tags
        }))

        // Log successful recommendation generation
        await auditSecurityEvent(SecurityEventType.SENSITIVE_DATA_ACCESS, request, user.id, {
          resource: 'recipe_recommendations',
          action: 'recommendations_generated',
          recipeId,
          recommendationCount: formattedRecommendations.length,
          highPriorityCount: formattedRecommendations.filter(r => r.priority === 'high').length
        })

        // Create response
        const response = createSecureResponse(
          {
            success: true,
            data: {
              recipeId,
              recipeName: mockAnalysis.stars[0]?.recipeName || 'Unknown Recipe',
              analysisDate: mockAnalysis.analysisDate.toISOString(),
              totalRecommendations: formattedRecommendations.length,
              recommendations: formattedRecommendations,
              summary: {
                highPriority: formattedRecommendations.filter(r => r.priority === 'high').length,
                mediumPriority: formattedRecommendations.filter(r => r.priority === 'medium').length,
                lowPriority: formattedRecommendations.filter(r => r.priority === 'low').length,
                quickWins: formattedRecommendations.filter(r => r.effort === 'low' && r.impact !== 'low').length,
                strategicInitiatives: formattedRecommendations.filter(r => r.effort === 'high' && r.impact === 'high').length
              }
            },
            metadata: {
              recipeId,
              generatedAt: new Date().toISOString(),
              filters: {
                priority: queryParams.priority,
                impact: queryParams.impact,
                effort: queryParams.effort
              },
              cacheTtl: 3600 // 1 hour
            }
          }
        )

        // Add caching and metadata headers
        response.headers.set('Cache-Control', 'public, max-age=3600') // 1 hour
        response.headers.set('X-Recipe-Id', recipeId)
        response.headers.set('X-Recommendation-Count', formattedRecommendations.length.toString())
        response.headers.set('X-High-Priority-Count', formattedRecommendations.filter(r => r.priority === 'high').length.toString())

        return response

      } catch (error) {
        console.error('Error in GET /api/menu-engineering/recommendations/[recipeId]:', error)
        
        await auditSecurityEvent(SecurityEventType.SYSTEM_ERROR, request, user.id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          recipeId: params.recipeId,
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
      exposedHeaders: ['X-Recipe-Id', 'X-Recommendation-Count', 'X-High-Priority-Count']
    }
  }
)

// Helper function to create mock analysis for recipe
function createMockAnalysisForRecipe(recipeId: string): MenuAnalysisResult {
  return {
    analysisId: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    analysisDate: new Date(),
    periodType: 'monthly',
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    periodEnd: new Date(),
    totalItems: 1,
    totalSales: 245,
    totalRevenue: { amount: 12250.50, currency: 'USD' },
    totalGrossProfit: { amount: 7350.30, currency: 'USD' },
    overallProfitMargin: 60.0,
    stars: [{
      recipeId,
      recipeName: 'Signature Burger',
      recipeCode: 'SIG-001',
      category: 'Main Courses',
      totalSales: 245,
      totalRevenue: { amount: 12250.50, currency: 'USD' },
      totalQuantitySold: 245,
      averagePrice: { amount: 50.00, currency: 'USD' },
      totalFoodCost: { amount: 4900.20, currency: 'USD' },
      averageFoodCost: { amount: 20.00, currency: 'USD' },
      totalGrossProfit: { amount: 7350.30, currency: 'USD' },
      averageProfitMargin: 60.0,
      popularityScore: 85.5,
      profitabilityScore: 88.2,
      popularityRank: 3,
      profitabilityRank: 2,
      classification: 'STAR',
      dataQuality: 0.92,
      sampleSize: 245,
      salesTrend: 'increasing',
      profitabilityTrend: 'stable'
    }],
    plowhorses: [],
    puzzles: [],
    dogs: [],
    averagePopularityScore: 85.5,
    averageProfitabilityScore: 88.2,
    dataQuality: 0.92,
    confidence: 0.91,
    recommendations: { totalRecommendations: 0, highPriority: [], mediumPriority: [], lowPriority: [], quickWins: [], strategicInitiatives: [] },
    insights: []
  }
}

// Apply rate limiting
export const GET = withRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 200, // 200 recommendation requests per hour
  skipSuccessfulRequests: false,
  keyGenerator: (req) => `recipe-recommendations:${req.headers.get('authorization') || req.ip}`
})(getRecipeRecommendations)